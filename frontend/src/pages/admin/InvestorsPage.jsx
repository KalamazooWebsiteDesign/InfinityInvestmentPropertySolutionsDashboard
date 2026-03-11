import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Trash2, Edit2, X, CheckCircle, AlertCircle, Users,
  ChevronDown, ChevronUp, Search, Link2, Unlink
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api, fmt$$, fmtStatus, statusBadgeClass } from '../../lib/api';

// ── Modal: create / edit investor ─────────────────────────────────────────────
function InvestorModal({ investor, onSave, onClose }) {
  const isEdit = !!investor;
  const [form, setForm]     = useState({
    name:     investor?.name     || '',
    email:    investor?.email    || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        const payload = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        const updated = await api.investors.update(investor.id, payload);
        onSave(updated);
      } else {
        const created = await api.investors.create(form);
        onSave(created);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
          <h2 className="font-bold text-primary-900 text-lg">
            {isEdit ? 'Edit Investor' : 'New Investor'}
          </h2>
          <button onClick={onClose} className="text-primary-400 hover:text-primary-700 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-6 flex flex-col gap-4">
          <div className="field">
            <label className="label">Full Name *</label>
            <input className="input" name="name" value={form.name} onChange={handle} placeholder="Jane Smith" required />
          </div>
          <div className="field">
            <label className="label">Email Address *</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handle} placeholder="jane@example.com" required />
          </div>
          <div className="field">
            <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handle}
              placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
              required={!isEdit}
              minLength={8}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Investor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Investor row with expandable deal assignment ──────────────────────────────
function InvestorRow({ investor, allDeals, onEdit, onDelete }) {
  const [expanded, setExpanded]     = useState(false);
  const [assigned, setAssigned]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [assigning, setAssigning]   = useState(false);
  const [selectedDeal, setSelected] = useState('');
  const [error, setError]           = useState('');

  const loadDeals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.investors.getDeals(investor.id);
      setAssigned(data.deals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [investor.id]);

  useEffect(() => {
    if (expanded) loadDeals();
  }, [expanded, loadDeals]);

  const handleAssign = async () => {
    if (!selectedDeal) return;
    setAssigning(true);
    setError('');
    try {
      await api.investors.assignDeal(investor.id, Number(selectedDeal));
      setSelected('');
      await loadDeals();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (dealId) => {
    setError('');
    try {
      await api.investors.unassignDeal(investor.id, dealId);
      await loadDeals();
    } catch (err) {
      setError(err.message);
    }
  };

  const assignedIds = new Set(assigned.map(d => d.id));
  const unassignedDeals = allDeals.filter(d => !assignedIds.has(d.id));

  return (
    <div className="border border-primary-200 rounded-xl overflow-hidden bg-white">
      {/* Investor header row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
          <span className="text-accent-700 font-bold text-sm">{investor.name[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-primary-900 text-sm">{investor.name}</div>
          <div className="text-primary-400 text-xs truncate">{investor.email}</div>
        </div>
        <div className="text-xs text-primary-400 hidden sm:block shrink-0">
          {investor.deal_count} deal{investor.deal_count !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(investor)}
            className="p-1.5 rounded-lg text-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(investor)}
            className="p-1.5 rounded-lg text-primary-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors ml-1"
            title={expanded ? 'Collapse' : 'Manage deals'}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded: deal assignment panel */}
      {expanded && (
        <div className="border-t border-primary-100 bg-primary-50 px-4 py-4 flex flex-col gap-4">
          <div className="font-semibold text-primary-700 text-sm">Deal Access</div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
              <AlertCircle size={13} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Assigned deals list */}
          {loading ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assigned.length === 0 ? (
            <p className="text-primary-400 text-sm italic">No deals assigned yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {assigned.map(deal => (
                <div key={deal.id} className="flex items-center gap-3 bg-white border border-primary-200 rounded-lg px-3 py-2.5">
                  <span className={statusBadgeClass(deal.status) + ' shrink-0 text-xs'}>
                    {fmtStatus(deal.status)}
                  </span>
                  <span className="flex-1 text-sm font-medium text-primary-900 truncate">{deal.title}</span>
                  <button
                    onClick={() => handleUnassign(deal.id)}
                    className="p-1 text-primary-300 hover:text-red-500 transition-colors shrink-0"
                    title="Remove access"
                  >
                    <Unlink size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add deal */}
          {unassignedDeals.length > 0 && (
            <div className="flex gap-2">
              <select
                value={selectedDeal}
                onChange={e => setSelected(e.target.value)}
                className="input flex-1 text-sm py-2"
              >
                <option value="">Select a deal to add...</option>
                {unassignedDeals.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedDeal || assigning}
                className="btn-primary text-sm py-2 px-4 shrink-0"
              >
                {assigning ? '...' : 'Add'}
              </button>
            </div>
          )}
          {unassignedDeals.length === 0 && !loading && (
            <p className="text-primary-400 text-xs">All deals are already assigned to this investor.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InvestorsPage() {
  const [investors, setInvestors] = useState([]);
  const [allDeals, setAllDeals]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, deals] = await Promise.all([
        api.investors.list(),
        api.deals.adminList(),
      ]);
      setInvestors(inv);
      setAllDeals(deals.filter(d => d.status !== 'archived'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = (saved) => {
    setShowModal(false);
    setEditTarget(null);
    load();
  };

  const handleDelete = async (investor) => {
    if (!confirm(`Delete investor "${investor.name}"? This cannot be undone.`)) return;
    try {
      await api.investors.remove(investor.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = investors.filter(inv =>
    inv.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Investors"
      actions={
        <button onClick={() => { setEditTarget(null); setShowModal(true); }} className="btn-primary text-sm py-2 px-4">
          <Plus size={16} />
          New Investor
        </button>
      }
    >
      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
        <input
          className="input pl-9 text-sm"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users size={40} className="text-primary-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-primary-900 mb-2">
            {search ? 'No investors match your search' : 'No investors yet'}
          </h2>
          {!search && (
            <p className="text-primary-500 mb-6 max-w-sm mx-auto">
              Create investor accounts and assign deals to give investors access to their portal.
            </p>
          )}
          {!search && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} />
              Create First Investor
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(investor => (
            <InvestorRow
              key={investor.id}
              investor={investor}
              allDeals={allDeals}
              onEdit={(inv) => { setEditTarget(inv); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <InvestorModal
          investor={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}
    </AdminLayout>
  );
}
