const jwt = require('jsonwebtoken');

// Accepts tokens from both admins and investors
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role: 'admin'|'investor', name? }
    // Backwards-compat: admin routes that reference req.admin still work
    if (payload.role === 'admin') req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Only allows admins through
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// Only allows investors through
function requireInvestor(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ error: 'Investor access required' });
    }
    next();
  });
}

module.exports = requireAuth;
module.exports.requireAdmin = requireAdmin;
module.exports.requireInvestor = requireInvestor;
