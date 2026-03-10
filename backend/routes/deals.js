const router      = require('express').Router();
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const slugify     = require('slugify');
const db          = require('../db');
const requireAuth = require('../middleware/auth');

// ─── Multer image upload ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDeal(deal) {
  if (!deal) return null;
  return {
    ...deal,
    is_published:   Boolean(deal.is_published),
    deal_highlights: deal.deal_highlights ? JSON.parse(deal.deal_highlights) : [],
    timeline_details: deal.timeline_details ? JSON.parse(deal.timeline_details) : [],
  };
}

function generateSlug(title) {
  const base = slugify(title, { lower: true, strict: true });
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// ─── PUBLIC routes ────────────────────────────────────────────────────────────

// GET /api/v1/deals  (published deals only for public)
router.get('/', (req, res) => {
  const adminMode = req.headers['x-admin'] === 'true';
  // Admin-header validation done in private routes; here just check presence
  const rows = adminMode
    ? db.prepare('SELECT * FROM deals ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM deals WHERE is_published = 1 ORDER BY created_at DESC').all();
  res.json(rows.map(parseDeal));
});

// GET /api/v1/deals/stats  (public stats for homepage)
router.get('/stats', (_req, res) => {
  const total      = db.prepare("SELECT COUNT(*) as n FROM deals WHERE is_published = 1").get().n;
  const active     = db.prepare("SELECT COUNT(*) as n FROM deals WHERE status IN ('active','rehab') AND is_published = 1").get().n;
  const completed  = db.prepare("SELECT COUNT(*) as n FROM deals WHERE status = 'completed' AND is_published = 1").get().n;
  const profitRow  = db.prepare("SELECT SUM(projected_net_profit) as total FROM deals WHERE is_published = 1 AND status NOT IN ('sold','completed')").get();
  res.json({ total, active, completed, totalProjectedProfit: profitRow.total || 0 });
});

// GET /api/v1/deals/:slug  (single deal by slug — public if published)
router.get('/:slug', (req, res) => {
  const adminMode = req.headers['x-admin'] === 'true';
  const deal = db.prepare('SELECT * FROM deals WHERE slug = ?').get(req.params.slug);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  if (!adminMode && !deal.is_published)
    return res.status(404).json({ error: 'Deal not found' });
  res.json(parseDeal(deal));
});

// ─── ADMIN routes (protected) ─────────────────────────────────────────────────

// GET /api/v1/deals/admin/all
router.get('/admin/all', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT * FROM deals ORDER BY updated_at DESC').all();
  res.json(rows.map(parseDeal));
});

// GET /api/v1/deals/admin/dashboard-stats
router.get('/admin/dashboard-stats', requireAuth, (_req, res) => {
  const active    = db.prepare("SELECT COUNT(*) as n FROM deals WHERE status IN ('active','rehab')").get().n;
  const completed = db.prepare("SELECT COUNT(*) as n FROM deals WHERE status = 'completed'").get().n;
  const sold      = db.prepare("SELECT COUNT(*) as n FROM deals WHERE status = 'sold'").get().n;
  const totalProfit = db.prepare("SELECT SUM(projected_net_profit) as t FROM deals WHERE status IN ('active','rehab')").get().t || 0;
  const totalCapital = db.prepare("SELECT SUM(investor_capital_required) as t FROM deals WHERE status IN ('active','rehab')").get().t || 0;
  const leads     = db.prepare("SELECT COUNT(*) as n FROM leads").get().n;
  const recent    = db.prepare("SELECT id, slug, title, status, is_published, updated_at FROM deals ORDER BY updated_at DESC LIMIT 5").all();
  res.json({ active, completed, sold, totalProfit, totalCapital, leads, recent });
});

// POST /api/v1/deals  (create)
router.post('/', requireAuth, (req, res) => {
  const d    = req.body;
  const slug = d.slug || generateSlug(d.title || 'new-deal');

  const existing = db.prepare('SELECT id FROM deals WHERE slug = ?').get(slug);
  if (existing) return res.status(409).json({ error: 'A deal with this slug already exists' });

  const stmt = db.prepare(`
    INSERT INTO deals (
      slug, title, address, status, summary, cover_image,
      purchase_price, rehab_budget, holding_costs, closing_costs, total_project_cost,
      arv, projected_gross_profit, projected_net_profit,
      investor_capital_required, projected_investor_return,
      estimated_timeline, rent_estimate, refinance_value,
      deal_highlights, timeline_details, why_this_deal, notes, is_published
    ) VALUES (
      @slug, @title, @address, @status, @summary, @cover_image,
      @purchase_price, @rehab_budget, @holding_costs, @closing_costs, @total_project_cost,
      @arv, @projected_gross_profit, @projected_net_profit,
      @investor_capital_required, @projected_investor_return,
      @estimated_timeline, @rent_estimate, @refinance_value,
      @deal_highlights, @timeline_details, @why_this_deal, @notes, @is_published
    )
  `);

  const result = stmt.run({
    slug,
    title:                      d.title || 'Untitled Deal',
    address:                    d.address || '',
    status:                     d.status || 'lead',
    summary:                    d.summary || null,
    cover_image:                d.cover_image || null,
    purchase_price:             d.purchase_price || null,
    rehab_budget:               d.rehab_budget || null,
    holding_costs:              d.holding_costs || null,
    closing_costs:              d.closing_costs || null,
    total_project_cost:         d.total_project_cost || null,
    arv:                        d.arv || null,
    projected_gross_profit:     d.projected_gross_profit || null,
    projected_net_profit:       d.projected_net_profit || null,
    investor_capital_required:  d.investor_capital_required || null,
    projected_investor_return:  d.projected_investor_return || null,
    estimated_timeline:         d.estimated_timeline || null,
    rent_estimate:              d.rent_estimate || null,
    refinance_value:            d.refinance_value || null,
    deal_highlights:            Array.isArray(d.deal_highlights) ? JSON.stringify(d.deal_highlights) : (d.deal_highlights || null),
    timeline_details:           Array.isArray(d.timeline_details) ? JSON.stringify(d.timeline_details) : (d.timeline_details || null),
    why_this_deal:              d.why_this_deal || null,
    notes:                      d.notes || null,
    is_published:               d.is_published ? 1 : 0,
  });

  const newDeal = db.prepare('SELECT * FROM deals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseDeal(newDeal));
});

// PUT /api/v1/deals/:id  (update)
router.put('/:id', requireAuth, (req, res) => {
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const d = req.body;
  db.prepare(`
    UPDATE deals SET
      title = @title, address = @address, status = @status,
      summary = @summary, cover_image = @cover_image,
      purchase_price = @purchase_price, rehab_budget = @rehab_budget,
      holding_costs = @holding_costs, closing_costs = @closing_costs,
      total_project_cost = @total_project_cost, arv = @arv,
      projected_gross_profit = @projected_gross_profit,
      projected_net_profit = @projected_net_profit,
      investor_capital_required = @investor_capital_required,
      projected_investor_return = @projected_investor_return,
      estimated_timeline = @estimated_timeline,
      rent_estimate = @rent_estimate, refinance_value = @refinance_value,
      deal_highlights = @deal_highlights, timeline_details = @timeline_details,
      why_this_deal = @why_this_deal, notes = @notes,
      is_published = @is_published,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({
    id:                         deal.id,
    title:                      d.title ?? deal.title,
    address:                    d.address ?? deal.address,
    status:                     d.status ?? deal.status,
    summary:                    d.summary ?? deal.summary,
    cover_image:                d.cover_image ?? deal.cover_image,
    purchase_price:             d.purchase_price ?? deal.purchase_price,
    rehab_budget:               d.rehab_budget ?? deal.rehab_budget,
    holding_costs:              d.holding_costs ?? deal.holding_costs,
    closing_costs:              d.closing_costs ?? deal.closing_costs,
    total_project_cost:         d.total_project_cost ?? deal.total_project_cost,
    arv:                        d.arv ?? deal.arv,
    projected_gross_profit:     d.projected_gross_profit ?? deal.projected_gross_profit,
    projected_net_profit:       d.projected_net_profit ?? deal.projected_net_profit,
    investor_capital_required:  d.investor_capital_required ?? deal.investor_capital_required,
    projected_investor_return:  d.projected_investor_return ?? deal.projected_investor_return,
    estimated_timeline:         d.estimated_timeline ?? deal.estimated_timeline,
    rent_estimate:              d.rent_estimate ?? deal.rent_estimate,
    refinance_value:            d.refinance_value ?? deal.refinance_value,
    deal_highlights:            Array.isArray(d.deal_highlights)
                                  ? JSON.stringify(d.deal_highlights)
                                  : (d.deal_highlights ?? deal.deal_highlights),
    timeline_details:           Array.isArray(d.timeline_details)
                                  ? JSON.stringify(d.timeline_details)
                                  : (d.timeline_details ?? deal.timeline_details),
    why_this_deal:              d.why_this_deal ?? deal.why_this_deal,
    notes:                      d.notes ?? deal.notes,
    is_published:               d.is_published !== undefined ? (d.is_published ? 1 : 0) : deal.is_published,
  });

  const updated = db.prepare('SELECT * FROM deals WHERE id = ?').get(deal.id);
  res.json(parseDeal(updated));
});

// POST /api/v1/deals/:id/duplicate
router.post('/:id/duplicate', requireAuth, (req, res) => {
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const newSlug  = generateSlug(`${deal.title} copy`);
  const newTitle = `${deal.title} (Copy)`;

  db.prepare(`
    INSERT INTO deals (
      slug, title, address, status, summary, cover_image,
      purchase_price, rehab_budget, holding_costs, closing_costs, total_project_cost,
      arv, projected_gross_profit, projected_net_profit,
      investor_capital_required, projected_investor_return,
      estimated_timeline, rent_estimate, refinance_value,
      deal_highlights, timeline_details, why_this_deal, notes, is_published
    ) SELECT
      ?, ?, address, 'lead', summary, cover_image,
      purchase_price, rehab_budget, holding_costs, closing_costs, total_project_cost,
      arv, projected_gross_profit, projected_net_profit,
      investor_capital_required, projected_investor_return,
      estimated_timeline, rent_estimate, refinance_value,
      deal_highlights, timeline_details, why_this_deal, notes, 0
    FROM deals WHERE id = ?
  `).run(newSlug, newTitle, deal.id);

  const newDeal = db.prepare('SELECT * FROM deals WHERE slug = ?').get(newSlug);
  res.status(201).json(parseDeal(newDeal));
});

// DELETE /api/v1/deals/:id  (archive = set status to archived)
router.delete('/:id', requireAuth, (req, res) => {
  const deal = db.prepare('SELECT id FROM deals WHERE id = ?').get(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  db.prepare("UPDATE deals SET status = 'archived', is_published = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(deal.id);
  res.json({ message: 'Deal archived' });
});

// POST /api/v1/deals/upload-image  (upload cover photo)
router.post('/upload-image', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
