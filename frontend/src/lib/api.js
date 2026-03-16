const BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('iips_token');
}

async function request(method, path, body, isAdmin = false) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isAdmin) headers['x-admin'] = 'true';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const candidates = ['data', 'items', 'results', 'rows', 'deals', 'investors'];
    for (const key of candidates) {
      if (Array.isArray(value[key])) return value[key];
    }
  }
  return [];
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login:          (email, password) => request('POST', '/auth/login', { email, password }),
    me:             ()                => request('GET',  '/auth/me'),
    changePassword: (currentPassword, newPassword) =>
                    request('POST', '/auth/change-password', { currentPassword, newPassword }),
  },

  // ── Investors (admin management + investor self) ─────────────────────────
  investors: {
    list:           ()              => request('GET',    '/investors').then(asArray),
    create:         (data)          => request('POST',   '/investors', data),
    update:         (id, data)      => request('PUT',    `/investors/${id}`, data),
    remove:         (id)            => request('DELETE', `/investors/${id}`),
    getDeals:       (id)            => request('GET',    `/investors/${id}/deals`),
    assignDeal:     (id, deal_id)   => request('POST',   `/investors/${id}/deals`, { deal_id }),
    unassignDeal:   (id, dealId)    => request('DELETE', `/investors/${id}/deals/${dealId}`),
    // Investor self-service
    myDeals:        ()              => request('GET',    '/investors/me/deals').then(asArray),
    myDeal:         (slug)          => request('GET',    `/investors/me/deals/${slug}`),
  },

  // ── Public deals ────────────────────────────────────────────────────────────
  deals: {
    list:       ()     => request('GET', '/deals').then(asArray),
    stats:      ()     => request('GET', '/deals/stats'),
    getBySlug:  (slug) => request('GET', `/deals/${slug}`),

    // ── Admin deals ──────────────────────────────────────────────────────────
    adminList:    ()     => request('GET',    '/deals/admin/all').then(asArray),
    dashStats:    ()     => request('GET',    '/deals/admin/dashboard-stats'),
    create:       (data) => request('POST',   '/deals', data),
    update:       (id, data) => request('PUT', `/deals/${id}`, data),
    duplicate:    (id)   => request('POST',   `/deals/${id}/duplicate`),
    archive:      (id)   => request('DELETE', `/deals/${id}`),

    uploadImage: async (file) => {
      const form = new FormData();
      form.append('image', file);
      const headers = {};
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${BASE}/deals/upload-image`, {
        method: 'POST',
        headers,
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data;
    },
  },

  // ── Leads ────────────────────────────────────────────────────────────────────
  leads: {
    submit:  (data)  => request('POST', '/leads', data),
    list:    ()      => request('GET',  '/leads').then(asArray),
    byDeal:  (slug)  => request('GET',  `/leads/deal/${slug}`),
  },
};

// ── Formatting helpers ────────────────────────────────────────────────────────
export function fmt$$(n) {
  if (n == null || n === '') return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n));
}

export function fmtPct(n) {
  if (n == null || n === '') return '—';
  return `${Number(n).toFixed(1)}%`;
}

export function fmtStatus(s) {
  const map = {
    lead:      'Lead',
    active:    'Active Opportunity',
    rehab:     'In Rehab',
    completed: 'Completed',
    sold:      'Sold',
    archived:  'Archived',
  };
  return map[s] || s;
}

export function statusBadgeClass(s) {
  const map = {
    lead:      'badge-lead',
    active:    'badge-active',
    rehab:     'badge-rehab',
    completed: 'badge-completed',
    sold:      'badge-sold',
    archived:  'badge-archived',
  };
  return `badge ${map[s] || 'badge-lead'}`;
}
