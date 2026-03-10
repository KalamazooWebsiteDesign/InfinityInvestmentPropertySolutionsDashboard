require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

// Init DB (runs migrations + seeding)
require('./db');

const authRoutes  = require('./routes/auth');
const dealRoutes  = require('./routes/deals');
const leadRoutes  = require('./routes/leads');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/deals', dealRoutes);
app.use('/api/v1/leads', leadRoutes);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// ─── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🏠 Infinity Investment Property Solutions API running on http://localhost:${PORT}`);
  console.log(`   Admin email:    ${process.env.ADMIN_EMAIL}`);
  console.log(`   Environment:    ${process.env.NODE_ENV || 'development'}\n`);
});
