const router = require('express').Router();
const db     = require('../db');
const requireAuth = require('../middleware/auth');

// POST /api/v1/leads  (investor submits interest form)
router.post('/', (req, res) => {
  const { name, email, phone, message, deal_id, deal_slug } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Name and email are required' });

  // Basic email format check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email))
    return res.status(400).json({ error: 'Please enter a valid email address' });

  db.prepare(`
    INSERT INTO leads (deal_id, deal_slug, name, email, phone, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(deal_id || null, deal_slug || null, name.trim(), email.toLowerCase().trim(), phone || null, message || null);

  res.status(201).json({ message: 'Thank you! We will be in touch shortly.' });
});

// GET /api/v1/leads  (admin only)
router.get('/', requireAuth, (_req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json(leads);
});

// GET /api/v1/leads/deal/:slug  (leads for a specific deal, admin only)
router.get('/deal/:slug', requireAuth, (req, res) => {
  const leads = db.prepare('SELECT * FROM leads WHERE deal_slug = ? ORDER BY created_at DESC').all(req.params.slug);
  res.json(leads);
});

module.exports = router;
