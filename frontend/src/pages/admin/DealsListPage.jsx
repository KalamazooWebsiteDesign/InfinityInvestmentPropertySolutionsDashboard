import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Copy, Archive, ExternalLink, Search, Filter } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api, fmt$$, fmtPct, fmtStatus, statusBadgeClass } from '../../lib/api';

const STATUSES = ['all', 'lead', 'active', 'rehab', 'completed', 'sold', 'archived'];

export default function DealsListPage() {
  const navigate = useNavigate();
  const [deals, setDeals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [error, setError]       = useState('');

  const load = () => {
    setLoading(true);
    api.deals.adminList()
      .then(setDeals)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDuplicate = async (id) => {
    try {
      const newDeal = await api.deals.duplicate(id);
      load();
      // Optionally navigate to edit the duplicated deal
      navigate(`/admin/deals/${newDeal.id}/edit`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleArchive = async (deal) => {
    if (!confirm(`Archive "${deal.title}"? It will be unpublished and hidden.`)) return;
    try {
      await api.deals.archive(deal.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTogglePublish = async (deal) => {
    try {
      await api.deals.update(deal.id, { is_published: !deal.is_published });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = deals
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d =>
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AdminLayout
      title="Deals"
      actions={
        <Link to="/admin/deals/new" className="btn-primary text-sm py-2 px-4">
          <Plus size={16} />
          New Deal
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input
              className="input pl-9"
              placeholder="Search deals by title or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  filter === s
                    ? 'bg-primary-900 text-white'
                    : 'bg-white border border-primary-200 text-primary-600 hover:border-primary-400'
                }`}
              >
                {s === 'all' ? 'All' : fmtStatus(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary counts */}
        <div className="flex items-center gap-4 text-sm text-primary-500">
          <span>{filtered.length} deal{filtered.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{deals.filter(d => d.is_published).length} published</span>
          <span>·</span>
          <span>{deals.filter(d => !d.is_published).length} draft</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <div className="bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm">
            {filtered.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary-100 bg-primary-50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide">Deal</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide">Investor $</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide">Return</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide">Visibility</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-primary-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((deal, i) => (
                        <tr key={deal.id} className={`${i < filtered.length - 1 ? 'border-b border-primary-100' : ''} hover:bg-primary-50 transition-colors`}>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-primary-900">{deal.title}</div>
                            <div className="text-xs text-primary-400 mt-0.5 truncate max-w-[220px]">{deal.address}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={statusBadgeClass(deal.status)}>{fmtStatus(deal.status)}</span>
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-primary-800">
                            {deal.investor_capital_required ? fmt$$(deal.investor_capital_required) : '—'}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-accent-600">
                            {deal.projected_investor_return ? fmtPct(deal.projected_investor_return) : '—'}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleTogglePublish(deal)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                deal.is_published
                                  ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                                  : 'bg-primary-100 text-primary-500 hover:bg-primary-200'
                              }`}
                            >
                              {deal.is_published ? '● Live' : '○ Draft'}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/admin/deals/${deal.id}/edit`} className="btn-ghost p-2" title="Edit">
                                <Edit size={14} />
                              </Link>
                              <button onClick={() => handleDuplicate(deal.id)} className="btn-ghost p-2" title="Duplicate">
                                <Copy size={14} />
                              </button>
                              {deal.is_published && (
                                <a href={`/deals/${deal.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost p-2" title="View live">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              {deal.status !== 'archived' && (
                                <button onClick={() => handleArchive(deal)} className="btn-ghost p-2 text-primary-300 hover:text-red-500" title="Archive">
                                  <Archive size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-primary-100">
                  {filtered.map(deal => (
                    <div key={deal.id} className="p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-primary-900">{deal.title}</div>
                          <div className="text-xs text-primary-400 mt-0.5">{deal.address}</div>
                        </div>
                        <span className={statusBadgeClass(deal.status)}>{fmtStatus(deal.status)}</span>
                      </div>

                      <div className="flex gap-4 text-sm">
                        {deal.investor_capital_required && (
                          <div>
                            <div className="text-xs text-primary-400">Capital</div>
                            <div className="font-semibold text-primary-800">{fmt$$(deal.investor_capital_required)}</div>
                          </div>
                        )}
                        {deal.projected_investor_return && (
                          <div>
                            <div className="text-xs text-primary-400">Return</div>
                            <div className="font-semibold text-accent-600">{fmtPct(deal.projected_investor_return)}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-primary-400">Visibility</div>
                          <button
                            onClick={() => handleTogglePublish(deal)}
                            className={`text-xs font-semibold transition-colors ${deal.is_published ? 'text-accent-600' : 'text-primary-400'}`}
                          >
                            {deal.is_published ? '● Live' : '○ Draft'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Link to={`/admin/deals/${deal.id}/edit`} className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center">
                          <Edit size={13} /> Edit
                        </Link>
                        <button onClick={() => handleDuplicate(deal.id)} className="btn-secondary text-xs py-1.5 px-3">
                          <Copy size={13} />
                        </button>
                        {deal.is_published && (
                          <a href={`/deals/${deal.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-primary-400">
                <p className="mb-4">No deals match your filter.</p>
                <Link to="/admin/deals/new" className="btn-primary text-sm py-2">
                  <Plus size={16} />
                  Create New Deal
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
