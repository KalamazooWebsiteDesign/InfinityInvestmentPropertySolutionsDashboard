const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const requireAuth = require('../middleware/auth');

// POST /api/v1/auth/login  (handles both admins and investors)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const normalizedEmail = email.toLowerCase().trim();

  // Check admins first
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(normalizedEmail);
  if (admin) {
    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return res.json({ token, role: 'admin', user: { id: admin.id, email: admin.email } });
  }

  // Check investors
  const investor = db.prepare('SELECT * FROM investors WHERE email = ?').get(normalizedEmail);
  if (!investor) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, investor.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: investor.id, email: investor.email, name: investor.name, role: 'investor' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  res.json({ token, role: 'investor', user: { id: investor.id, email: investor.email, name: investor.name } });
});

// GET /api/v1/auth/me  (validate token + return current user)
router.get('/me', requireAuth, (req, res) => {
  res.json({ role: req.user.role, user: { id: req.user.id, email: req.user.email, name: req.user.name || null } });
});

// POST /api/v1/auth/change-password  (admin only)
router.post('/change-password', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Both current and new password are required' });

  if (newPassword.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.user.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  const valid = bcrypt.compareSync(currentPassword, admin.password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const newHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(newHash, admin.id);

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
