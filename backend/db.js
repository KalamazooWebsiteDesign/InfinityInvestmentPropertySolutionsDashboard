require('dotenv').config();
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'iips.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ─── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deals (
    id                         INTEGER PRIMARY KEY AUTOINCREMENT,
    slug                       TEXT    UNIQUE NOT NULL,
    title                      TEXT    NOT NULL,
    address                    TEXT    NOT NULL,
    status                     TEXT    DEFAULT 'lead',
    summary                    TEXT,
    cover_image                TEXT,

    -- Financials
    purchase_price             REAL,
    rehab_budget               REAL,
    holding_costs              REAL,
    closing_costs              REAL,
    total_project_cost         REAL,
    arv                        REAL,
    projected_gross_profit     REAL,
    projected_net_profit       REAL,
    investor_capital_required  REAL,
    projected_investor_return  REAL,
    estimated_timeline         TEXT,
    rent_estimate              REAL,
    refinance_value            REAL,

    -- Rich content (JSON strings)
    deal_highlights            TEXT,
    timeline_details           TEXT,
    why_this_deal              TEXT,
    notes                      TEXT,

    is_published               INTEGER DEFAULT 0,
    created_at                 DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                 DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id    INTEGER,
    deal_slug  TEXT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT,
    message    TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS investors (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS investor_deals (
    investor_id  INTEGER NOT NULL,
    deal_id      INTEGER NOT NULL,
    assigned_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (investor_id, deal_id),
    FOREIGN KEY (investor_id) REFERENCES investors(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id)     REFERENCES deals(id)     ON DELETE CASCADE
  );
`);

// ─── Seed admin ───────────────────────────────────────────────────────────────
const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@garciacapital.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(adminPassword, 12);
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(adminEmail, hash);
  console.log(`✓ Admin seeded: ${adminEmail}`);
}

// ─── Seed sample deals ─────────────────────────────────────────────────────────
const dealCount = db.prepare('SELECT COUNT(*) as count FROM deals').get();
if (dealCount.count === 0) {
  const insertDeal = db.prepare(`
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

  const sampleDeals = [
    {
      slug: 'ridgewood-flip-phoenix',
      title: 'The Ridgewood Flip',
      address: '4821 Ridgewood Lane, Phoenix, AZ 85018',
      status: 'active',
      summary: 'A solid single-family fix-and-flip opportunity in a high-demand East Phoenix neighborhood. Strong comparable sales, a clean scope of work, and an attractive return for investors at our targeted capital raise.',
      cover_image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
      purchase_price: 285000,
      rehab_budget: 55000,
      holding_costs: 12000,
      closing_costs: 9500,
      total_project_cost: 361500,
      arv: 465000,
      projected_gross_profit: 103500,
      projected_net_profit: 72000,
      investor_capital_required: 100000,
      projected_investor_return: 14.5,
      estimated_timeline: '5–6 months',
      rent_estimate: null,
      refinance_value: null,
      deal_highlights: JSON.stringify([
        'Prime East Phoenix location with strong buyer demand',
        'Comparable sales support $460K–$480K exit price',
        'Contractor scoped and mobilized — work begins immediately',
        'Conservative ARV used — meaningful upside potential remains',
        '100% of investor capital secured by first lien position'
      ]),
      timeline_details: JSON.stringify([
        { phase: 'Acquisition', duration: '2–3 weeks' },
        { phase: 'Renovation', duration: '10–12 weeks' },
        { phase: 'Listing & Sale', duration: '3–4 weeks' },
        { phase: 'Close & Distribute Returns', duration: '1–2 weeks' }
      ]),
      why_this_deal: 'This neighborhood has averaged under 21 days on market for comparable homes. The rehab scope is cosmetic-heavy with minimal structural work, reducing timeline risk. We have a trusted general contractor already mobilized with a locked bid.',
      notes: 'Follow up with investor John M. re: participation. Title search is clean.',
      is_published: 1
    },
    {
      slug: 'oak-street-duplex-scottsdale',
      title: 'Oak Street Duplex',
      address: '2240 Oak Street, Scottsdale, AZ 85251',
      status: 'active',
      summary: 'Value-add duplex acquisition in Old Town Scottsdale. Both units currently rented below market. Opportunity to renovate, raise rents to market rate, and execute a profitable exit via sale or cash-out refinance.',
      cover_image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
      purchase_price: 420000,
      rehab_budget: 38000,
      holding_costs: 14000,
      closing_costs: 11500,
      total_project_cost: 483500,
      arv: 595000,
      projected_gross_profit: 111500,
      projected_net_profit: 82000,
      investor_capital_required: 130000,
      projected_investor_return: 16.2,
      estimated_timeline: '6–8 months',
      rent_estimate: 2200,
      refinance_value: 570000,
      deal_highlights: JSON.stringify([
        'Dual income streams — two fully rentable units',
        'Below-market rents create immediate upside post-renovation',
        'Old Town Scottsdale location — exceptional long-term demand',
        'Refinance scenario allows investor capital return while retaining asset',
        'Strong rental comps: $2,200–$2,600 per unit post-renovation'
      ]),
      timeline_details: JSON.stringify([
        { phase: 'Acquisition', duration: '2–3 weeks' },
        { phase: 'Unit A Renovation', duration: '6–8 weeks' },
        { phase: 'Unit B Renovation', duration: '4–6 weeks' },
        { phase: 'Lease-Up & Stabilize', duration: '4 weeks' },
        { phase: 'Refinance or Sale', duration: '3–4 weeks' }
      ]),
      why_this_deal: 'Old Town Scottsdale continues to attract high-income renters and buyers. The duplex structure allows phased renovation to minimize vacancy risk. Both exit strategies — sale at ARV or cash-out refinance — produce strong returns.',
      notes: 'Preferred exit: cash-out refinance and hold. Discuss structure with equity partner.',
      is_published: 1
    },
    {
      slug: 'mesa-heights-brrr',
      title: 'Mesa Heights BRRR',
      address: '1103 Mesa Heights Drive, Mesa, AZ 85201',
      status: 'rehab',
      summary: 'Classic BRRR strategy on a 3/2 single-family in a rapidly appreciating Mesa corridor. Buy, renovate, rent at market rate, cash-out refinance — returning investor capital while holding a cash-flowing asset long term.',
      cover_image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
      purchase_price: 235000,
      rehab_budget: 42000,
      holding_costs: 9500,
      closing_costs: 8000,
      total_project_cost: 294500,
      arv: 370000,
      projected_gross_profit: 75500,
      projected_net_profit: 55000,
      investor_capital_required: 80000,
      projected_investor_return: 12.8,
      estimated_timeline: '4–5 months',
      rent_estimate: 1850,
      refinance_value: 350000,
      deal_highlights: JSON.stringify([
        'BRRR strategy: investor capital returned at refinance',
        'Projected market rent: $1,850/month post-renovation',
        'Mesa submarket showing 8–12% annual appreciation',
        'Full renovation underway — on track with scope and budget',
        'Similar homes selling at $375K–$390K (conservative ARV used)'
      ]),
      timeline_details: JSON.stringify([
        { phase: 'Acquisition', duration: 'Complete' },
        { phase: 'Renovation (In Progress)', duration: '6–8 weeks remaining' },
        { phase: 'Lease-Up', duration: '2–3 weeks' },
        { phase: 'Cash-Out Refinance', duration: '3–4 weeks' }
      ]),
      why_this_deal: 'Mesa is one of the fastest-growing submarkets in the Phoenix Metro. This property provides a clear path to returning investor capital via refinance while retaining a cash-flowing rental asset with strong long-term appreciation potential.',
      notes: 'Renovation approx. 60% complete. On budget. Inspector scheduled next week.',
      is_published: 1
    }
  ];

  for (const deal of sampleDeals) insertDeal.run(deal);
  console.log('✓ Sample deals seeded (3 deals)');
}

module.exports = db;
