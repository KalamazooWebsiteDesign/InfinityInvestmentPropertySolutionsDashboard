import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Home, CheckSquare, Users, Plus, Edit, ExternalLink, Copy } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api, fmt$$, fmtStatus, statusBadgeClass } from '../../lib/api';

function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm flex items-start gap-4 ${accent ? 'border-accent-200' : 'border-primary-200'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-accent-100' : 'bg-primary-100'}`}>
        <Icon size={20} className={accent ? 'text-accent-600' : 'text-primary-600'} />
      </div>
      <div>
        <div className="text-2xl font-bold text-primary-900">{value}</div>
        <div className="text-primary-500 text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-primary-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const load = () => {
    setLoading(true);
    api.deals.dashStats()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDuplicate = async (id) => {
    try {
      await api.deals.duplicate(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout
      title="Dashboard"
      actions={
        <Link to="/admin/deals/new" className="btn-primary text-sm py-2 px-4">
          <Plus size={16} />
          New Deal
        </Link>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : stats ? (
        <div className="flex flex-col gap-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Home}
              label="Active Deals"
              value={stats.active}
              sub="Currently open"
            />
            <StatCard
              icon={CheckSquare}
              label="Completed"
              value={stats.completed}
              sub="Successfully closed"
            />
            <StatCard
              icon={TrendingUp}
              label="Projected Profit"
              value={fmt$$(stats.totalProfit)}
              sub="Across active deals"
              accent
            />
            <StatCard
              icon={Users}
              label="Investor Leads"
              value={stats.leads}
              sub="Total inquiries"
            />
          </div>

          {/* Capital deployed */}
          {stats.totalCapital > 0 && (
            <div className="bg-primary-900 text-white rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="text-primary-400 text-sm font-medium mb-1">Total Investor Capital (Active Deals)</div>
                <div className="text-3xl font-bold text-accent-400">{fmt$$(stats.totalCapital)}</div>
              </div>
              <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-accent-400" />
              </div>
            </div>
          )}

          {/* Recent deals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-primary-900">Recent Deals</h2>
              <Link to="/admin/deals" className="text-accent-600 hover:text-accent-700 text-sm font-medium">
                View all →
              </Link>
            </div>

            <div className="bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm">
              {stats.recent?.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-100 bg-primary-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide">Deal</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase tracking-wide hidden md:table-cell">Published</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-primary-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map((deal, i) => (
                      <tr key={deal.id} className={`${i < stats.recent.length - 1 ? 'border-b border-primary-100' : ''} hover:bg-primary-50 transition-colors`}>
                        <td className="px-4 py-3 font-medium text-primary-900">{deal.title}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={statusBadgeClass(deal.status)}>{fmtStatus(deal.status)}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-xs font-medium ${deal.is_published ? 'text-accent-600' : 'text-primary-400'}`}>
                            {deal.is_published ? '● Live' : '○ Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/admin/deals/${deal.id}/edit`} className="btn-ghost p-2 text-xs" title="Edit">
                              <Edit size={14} />
                            </Link>
                            <button onClick={() => handleDuplicate(deal.id)} className="btn-ghost p-2 text-xs" title="Duplicate">
                              <Copy size={14} />
                            </button>
                            {deal.is_published && (
                              <a href={`/deals/${deal.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost p-2 text-xs" title="View live page">
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-primary-400">
                  <Home size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No deals yet.</p>
                  <Link to="/admin/deals/new" className="btn-primary mt-4 text-sm py-2">Create your first deal</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
