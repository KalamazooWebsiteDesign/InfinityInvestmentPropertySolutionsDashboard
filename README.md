# Infinity Investment Property Solutions — Deal Dashboard

A private, investor-facing real estate deal dashboard built for Isaac Garcia / Infinity Investment Property Solutions.

**Live site:** https://phpstack-1518311-6270209.cloudwaysapps.com

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (admin + investor roles) |
| Hosting | Cloudways (PHP/Nginx + Node.js on port 3001) |
| API Proxy | PHP (`api/index.php`) forwards `/api/` → `localhost:3001` |

---

## Local Development

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Start development servers
```bash
npm run dev
```

This starts:
- **Backend API** → http://localhost:3001
- **Frontend**    → http://localhost:3000 (proxied via Vite)

### 3. Log in to admin
Visit http://localhost:3000/login

| Email | Password |
|-------|----------|
| `admin@infinityips.com` | `ChangeMe123!` |

> **Important:** Change the password immediately via **Admin → Settings → Change Password**

---

## Project Structure

```
/
├── backend/                  # Express API + SQLite
│   ├── server.js             # Entry point (port 3001)
│   ├── db.js                 # Schema, migrations, seed data (uses better-sqlite3)
│   ├── middleware/auth.js     # JWT verification (admin + investor roles)
│   └── routes/
│       ├── auth.js           # Login, /me, change-password
│       ├── deals.js          # Full deal CRUD + image upload
│       ├── investors.js      # Investor management + deal assignment
│       └── leads.js          # Investor interest form submissions
├── frontend/                 # React + Vite + Tailwind
│   ├── public/
│   │   ├── api/index.php     # PHP reverse proxy → Node.js backend
│   │   ├── .htaccess         # Apache/Nginx SPA routing fallback
│   │   └── isaac-garcia.jpg  # About section headshot
│   ├── vite.config.js        # Build outputs to project root (../) for Cloudways deploy
│   └── src/
│       ├── pages/public/     # HomePage, DealPage, NotFound
│       ├── pages/admin/      # Login, Dashboard, DealsList, DealEditor, Investors, Settings
│       ├── pages/investor/   # InvestorDashboard, InvestorDealPage
│       └── contexts/AuthContext.jsx
├── index.html                # Built frontend entry (committed, output of vite build)
├── assets/                   # Built frontend JS/CSS (committed, output of vite build)
├── api/                      # PHP proxy (committed copy, output of vite build)
├── .htaccess                 # SPA routing (committed copy, output of vite build)
└── deploy.sh                 # Post-deploy script for Cloudways Git deployment
```

---

## URL Routes

| URL | Access | Description |
|-----|--------|-------------|
| `/` | Public | Homepage with featured deals + investor form |
| `/deals/:slug` | Public | Investor-facing deal page |
| `/login` | Public | Admin + Investor login |
| `/admin` | Admin | Dashboard |
| `/admin/deals` | Admin | Manage all deals |
| `/admin/deals/new` | Admin | Create a new deal |
| `/admin/deals/:id/edit` | Admin | Edit a deal |
| `/admin/investors` | Admin | Manage investors + assign deals |
| `/admin/settings` | Admin | Change admin password |
| `/investor` | Investor | Investor deal portal |
| `/investor/deals/:slug` | Investor | Investor deal detail view |

---

## Cloudways Deployment

### Git Deploy Settings

| Setting | Value |
|---------|-------|
| Branch | `dashboard-build` |
| Deployment Path / Web Root | `public_html` |
| Script after deployment | `/home/1518311.cloudwaysapps.com/infinity_investor_dashboard/public_html/deploy.sh` |

### How it works

1. Vite is configured to build directly to the **project root** (`../` from `frontend/`), so `index.html`, `assets/`, `api/`, and `.htaccess` land at the repo root.
2. These built files are **committed to git**, so a `git pull` on the server immediately serves the latest frontend with no extra build step.
3. `deploy.sh` handles: frontend rebuild (in case of source changes), backend `npm install`, and Node.js process restart.

### Deploy workflow
```bash
# After making changes:
cd frontend && npm run build   # Rebuilds index.html + assets/ at project root
cd ..
git add -A
git commit -m "your message"
git push origin dashboard-build
# Then click Deploy in Cloudways dashboard
```

---

## Server Credentials

**SSH:**
- Host: `45.77.102.80`
- User: `master_mfdbwbzeex`
- App path: `/home/1518311.cloudwaysapps.com/infinity_investor_dashboard/public_html`

**Admin login:**
- Email: `admin@infinityips.com`
- Password: `ChangeMe123!`

> Stored in `backend/.env` on the server. Change via **Admin → Settings → Change Password**.

---

## Production Checklist

1. **Change the admin password** via Admin → Settings, or update `backend/.env` and delete `backend/data/iips.db` to re-seed.

2. **Set a strong JWT secret** in `backend/.env`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Node.js requires v22+** — The app uses `better-sqlite3` (compatible with Node v20+). The `--experimental-sqlite` flag has been removed.

---

## Data Model

Each **deal** has:
- Basic info: title, address, status, summary, cover image
- Financials: purchase price, rehab budget, holding/closing costs, total cost, ARV, gross/net profit, investor capital required, projected return %
- Optional: rent estimate, refinance value, estimated timeline
- Rich content: deal highlights (bullet list), timeline phases (JSON), "why this deal" narrative, internal notes
- Flags: `is_published` (controls public visibility)

**Investor accounts** have their own login and can only see deals explicitly assigned to them by the admin.

---

## Sharing Deals

Each deal has a unique slug-based public URL:
```
https://phpstack-1518311-6270209.cloudwaysapps.com/deals/ridgewood-flip-phoenix
```
Copy into Mailchimp or share directly. Pages are fully mobile-optimized.
