const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const db       = require('../db');
const { requireAdmin, requireInvestor } = require('../middleware/auth');
const requireAuth = require('../middleware/auth');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseInvestor(inv) {
  if (!inv) return null;
  const { password_hash, ...safe } = inv;
  return safe;
}

// ─── ADMIN: manage investors ──────────────────────────────────────────────────

// GET /api/v1/investors  — list all investors with their deal counts
router.get('/', requireAdmin, (_req, res) => {
  const investors = db.prepare(`
    SELECT i.id, i.name, i.email, i.created_at,
           COUNT(id2.deal_id) as deal_count
    FROM investors i
    LEFT JOIN investor_deals id2 ON id2.investor_id = i.id
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `).all();
  res.json(investors);
});

// POST /api/v1/investors  — create investor account
router.post('/', requireAdmin, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const existing = db.prepare('SELECT id FROM investors WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) return res.status(409).json({ error: 'An investor with this email already exists' });

  const hash = bcrypt.hashSync(password, 12);
  const result = db.prepare(
    'INSERT INTO investors (name, email, password_hash) VALUES (?, ?, ?)'
  ).run(name.trim(), email.toLowerCase().trim(), hash);

  const investor = db.prepare('SELECT id, name, email, created_at FROM investors WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(investor);
});

// PUT /api/v1/investors/:id  — update investor name/email/password
router.put('/:id', requireAdmin, (req, res) => {
  const investor = db.prepare('SELECT * FROM investors WHERE id = ?').get(req.params.id);
  if (!investor) return res.status(404).json({ error: 'Investor not found' });

  const { name, email, password } = req.body;

  if (email && email.toLowerCase().trim() !== investor.email) {
    const conflict = db.prepare('SELECT id FROM investors WHERE email = ? AND id != ?')
      .get(email.toLowerCase().trim(), investor.id);
    if (conflict) return res.status(409).json({ error: 'Email already in use' });
  }

  const newName  = name  ? name.trim()                 : investor.name;
  const newEmail = email ? email.toLowerCase().trim()   : investor.email;
  const newHash  = password ? bcrypt.hashSync(password, 12) : investor.password_hash;

  db.prepare('UPDATE investors SET name = ?, email = ?, password_hash = ? WHERE id = ?')
    .run(newName, newEmail, newHash, investor.id);

  const updated = db.prepare('SELECT id, name, email, created_at FROM investors WHERE id = ?').get(investor.id);
  res.json(updated);
});

// DELETE /api/v1/investors/:id  — delete investor (cascades deal assignments)
router.delete('/:id', requireAdmin, (req, res) => {
  const investor = db.prepare('SELECT id FROM investors WHERE id = ?').get(req.params.id);
  if (!investor) return res.status(404).json({ error: 'Investor not found' });
  db.prepare('DELETE FROM investors WHERE id = ?').run(investor.id);
  res.json({ message: 'Investor deleted' });
});

// ─── INVESTOR: my deals ───────────────────────────────────────────────────────

// GET /api/v1/investors/me/deals  — investor's own deal list
router.get('/me/deals', requireInvestor, (req, res) => {
  const deals = db.prepare(`
    SELECT d.id, d.slug, d.title, d.address, d.status, d.summary,
           d.cover_image, d.purchase_price, d.arv,
           d.investor_capital_required, d.projected_investor_return,
           d.estimated_timeline, d.is_published,
           d.deal_highlights, d.timeline_details, d.why_this_deal,
           d.projected_net_profit, d.total_project_cost,
           d.rehab_budget, d.holding_costs, d.closing_costs,
           d.projected_gross_profit, d.rent_estimate, d.refinance_value,
           id2.assigned_at
    FROM deals d
    JOIN investor_deals id2 ON id2.deal_id = d.id
    WHERE id2.investor_id = ?
    ORDER BY id2.assigned_at DESC
  `).all(req.user.id);

  res.json(deals.map(d => ({
    ...d,
    is_published:    Boolean(d.is_published),
    deal_highlights: d.deal_highlights  ? JSON.parse(d.deal_highlights)  : [],
    timeline_details: d.timeline_details ? JSON.parse(d.timeline_details) : [],
  })));
});

// GET /api/v1/investors/me/deals/:slug  — investor views a single assigned deal
router.get('/me/deals/:slug', requireInvestor, (req, res) => {
  const deal = db.prepare(`
    SELECT d.*
    FROM deals d
    JOIN investor_deals id2 ON id2.deal_id = d.id
    WHERE id2.investor_id = ? AND d.slug = ?
  `).get(req.user.id, req.params.slug);

  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  res.json({
    ...deal,
    is_published:    Boolean(deal.is_published),
    deal_highlights: deal.deal_highlights  ? JSON.parse(deal.deal_highlights)  : [],
    timeline_details: deal.timeline_details ? JSON.parse(deal.timeline_details) : [],
  });
});

// ─── ADMIN: deal assignment ───────────────────────────────────────────────────

// GET /api/v1/investors/:id/deals  — deals assigned to an investor
router.get('/:id/deals', requireAdmin, (req, res) => {
  const investor = db.prepare('SELECT id, name, email FROM investors WHERE id = ?').get(req.params.id);
  if (!investor) return res.status(404).json({ error: 'Investor not found' });

  const deals = db.prepare(`
    SELECT d.id, d.slug, d.title, d.status, d.is_published,
           d.investor_capital_required, d.projected_investor_return,
           d.cover_image, id2.assigned_at
    FROM deals d
    JOIN investor_deals id2 ON id2.deal_id = d.id
    WHERE id2.investor_id = ?
    ORDER BY id2.assigned_at DESC
  `).all(req.params.id);

  res.json({ investor, deals });
});

// POST /api/v1/investors/:id/deals  — assign a deal to investor
router.post('/:id/deals', requireAdmin, (req, res) => {
  const { deal_id } = req.body;
  if (!deal_id) return res.status(400).json({ error: 'deal_id is required' });

  const investor = db.prepare('SELECT id FROM investors WHERE id = ?').get(req.params.id);
  if (!investor) return res.status(404).json({ error: 'Investor not found' });

  const deal = db.prepare('SELECT id FROM deals WHERE id = ?').get(deal_id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const existing = db.prepare('SELECT 1 FROM investor_deals WHERE investor_id = ? AND deal_id = ?')
    .get(req.params.id, deal_id);
  if (existing) return res.status(409).json({ error: 'Deal already assigned to this investor' });

  db.prepare('INSERT INTO investor_deals (investor_id, deal_id) VALUES (?, ?)').run(req.params.id, deal_id);
  res.status(201).json({ message: 'Deal assigned' });
});

// DELETE /api/v1/investors/:id/deals/:dealId  — unassign a deal
router.delete('/:id/deals/:dealId', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM investor_deals WHERE investor_id = ? AND deal_id = ?')
    .run(req.params.id, req.params.dealId);
  res.json({ message: 'Deal unassigned' });
});

module.exports = router;
