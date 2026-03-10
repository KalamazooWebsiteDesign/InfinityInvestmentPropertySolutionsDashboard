# Garcia Capital — Real Estate Deal Dashboard

A private, investor-facing real estate deal dashboard built for Isaac Garcia.

## Quick Start

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
- **Frontend**    → http://localhost:3000

### 3. Log in to admin
Visit http://localhost:3000/login

| Email | Password |
|-------|----------|
| `admin@garciacapital.com` | `ChangeMe123!` |

> **Important:** Change the password immediately via **Admin → Settings → Change Password**

---

## App Structure

```
garcia-capital/
├── backend/              # Express API + SQLite
│   ├── server.js         # Entry point
│   ├── db.js             # Database schema + seed data
│   ├── middleware/auth.js # JWT verification
│   └── routes/
│       ├── auth.js       # Login, /me, change-password
│       ├── deals.js      # Full deal CRUD + image upload
│       └── leads.js      # Investor interest form submissions
└── frontend/             # React + Vite + Tailwind
    └── src/
        ├── pages/public/ # Homepage, DealPage, NotFound
        └── pages/admin/  # Login, Dashboard, DealsList, DealEditor, Settings
```

## URL Routes

| URL | Description |
|-----|-------------|
| `/` | Public homepage with featured deals |
| `/deals/:slug` | Public investor-facing deal page |
| `/login` | Admin login |
| `/admin` | Admin dashboard |
| `/admin/deals` | Manage all deals |
| `/admin/deals/new` | Create a new deal |
| `/admin/deals/:id/edit` | Edit a deal |
| `/admin/settings` | Change password |

## Admin Credentials (Development)

Stored in `backend/.env`:
```
ADMIN_EMAIL=admin@garciacapital.com
ADMIN_PASSWORD=ChangeMe123!
JWT_SECRET=garcia-capital-dev-secret-change-in-production-abc123xyz
```

## Production Checklist

1. **Change the admin password** via Settings, OR:
   - Update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`
   - Delete `backend/data/garcia.db`
   - Restart the server (it will re-seed with new credentials)

2. **Set a strong JWT secret** — generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Paste into `JWT_SECRET` in `backend/.env`

3. **Build the frontend** for production:
   ```bash
   npm run build
   ```
   Then set `NODE_ENV=production` so Express serves the built frontend.

## Data Model

Each **deal** has:
- Basic info: title, address, status, summary, cover image
- Financials: purchase price, rehab budget, holding/closing costs, total cost, ARV, gross/net profit, investor capital, projected return
- Optional: rent estimate, refinance value
- Rich content: deal highlights (bullets), timeline phases, "why this deal" narrative
- Internal: notes (admin-only), published flag

## Sharing Deals via Mailchimp

Each deal has a unique slug-based URL:
```
https://yoursite.com/deals/ridgewood-flip-phoenix
```

Copy that URL into your Mailchimp email. The page is fully mobile-optimized for phone viewing.
