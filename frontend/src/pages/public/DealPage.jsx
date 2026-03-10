import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  MapPin, Clock, TrendingUp, CheckCircle, ArrowLeft, Phone, Mail,
  ChevronRight, DollarSign, Home, AlertCircle, X
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, fmt$$, fmtPct, fmtStatus, statusBadgeClass } from '../../lib/api';

// ── Interest form modal ────────────────────────────────────────────────────────
function InterestModal({ deal, onClose }) {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.leads.submit({ ...form, deal_id: deal.id, deal_slug: deal.slug });
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
          <h2 className="font-bold text-primary-900 text-lg">Express Interest</h2>
          <button onClick={onClose} className="text-primary-400 hover:text-primary-700 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">Message Sent!</h3>
              <p className="text-primary-500 text-sm mb-6">
                Thanks for your interest in <strong>{deal.title}</strong>. Isaac will be in touch shortly.
              </p>
              <button onClick={onClose} className="btn-secondary text-sm py-2">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="bg-accent-50 border border-accent-200 rounded-lg px-4 py-3 text-sm text-accent-700 font-medium">
                {deal.title} — {deal.address}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field">
                  <label className="label">Full Name *</label>
                  <input className="input" name="name" value={form.name} onChange={handle} placeholder="Jane Smith" required />
                </div>
                <div className="field">
                  <label className="label">Email *</label>
                  <input className="input" type="email" name="email" value={form.email} onChange={handle} placeholder="jane@example.com" required />
                </div>
              </div>
              <div className="field">
                <label className="label">Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={handle} placeholder="(602) 555-0100" />
              </div>
              <div className="field">
                <label className="label">Message</label>
                <textarea className="textarea" rows={3} name="message" value={form.message} onChange={handle}
                  placeholder="Any questions or notes for Isaac..." />
              </div>
              {status === 'error' && <p className="text-red-600 text-sm">{errorMsg}</p>}
              <button type="submit" className="btn-primary" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent = false }) {
  return (
    <div className={`kpi-card ${accent ? 'border-accent-200 bg-accent-50' : ''}`}>
      <span className="text-xs text-secondary-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-xl font-bold leading-tight ${accent ? 'text-accent-600' : 'text-primary-900'}`}>{value}</span>
      {sub && <span className="text-xs text-secondary-400">{sub}</span>}
    </div>
  );
}

// ── Custom tooltip for chart ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      <p>{fmt$$(payload[0].value)}</p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function DealPage() {
  const { slug }            = useParams();
  const [deal, setDeal]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.deals.getBySlug(slug)
      .then(setDeal)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Prepare chart data
  const chartData = deal ? [
    { name: 'Purchase', value: deal.purchase_price, fill: '#334155' },
    { name: 'Rehab', value: deal.rehab_budget, fill: '#475569' },
    { name: 'Other Costs', value: (deal.holding_costs || 0) + (deal.closing_costs || 0), fill: '#64748B' },
    { name: 'ARV / Sale', value: deal.arv, fill: '#10B981' },
    { name: 'Net Profit', value: deal.projected_net_profit, fill: '#059669' },
  ].filter(d => d.value > 0) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle size={40} className="text-primary-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary-900 mb-2">Deal not found</h1>
            <p className="text-primary-500 mb-6">This opportunity may no longer be available.</p>
            <Link to="/" className="btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const img = deal.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80';

  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <Navbar />

      {/* ── HERO IMAGE ──────────────────────────────────────────────────────── */}
      <section className="relative h-[50vh] md:h-[60vh] mt-16 overflow-hidden">
        <img src={img} alt={deal.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />

        {/* Back link */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium bg-primary-900/40 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft size={14} />
            All Opportunities
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 sm:pb-8 z-10">
          <div className="max-w-5xl mx-auto">
            <span className={statusBadgeClass(deal.status) + ' mb-3'}>
              {fmtStatus(deal.status)}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
              {deal.title}
            </h1>
            <div className="flex items-center gap-2 text-white/70 mt-2 text-sm sm:text-base">
              <MapPin size={14} />
              <span>{deal.address}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">

        {/* ── SUMMARY ─────────────────────────────────────────────────────── */}
        {deal.summary && (
          <section>
            <p className="section-title">Opportunity Overview</p>
            <p className="text-primary-700 text-base sm:text-lg leading-relaxed max-w-3xl">
              {deal.summary}
            </p>
          </section>
        )}

        {/* ── KPI CARDS ───────────────────────────────────────────────────── */}
        <section>
          <p className="section-title">Key Numbers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {deal.purchase_price && (
              <KpiCard label="Purchase Price" value={fmt$$(deal.purchase_price)} />
            )}
            {deal.total_project_cost && (
              <KpiCard label="Total Project Cost" value={fmt$$(deal.total_project_cost)} />
            )}
            {deal.arv && (
              <KpiCard label="After Repair Value" value={fmt$$(deal.arv)} sub="Projected sale price" />
            )}
            {deal.projected_net_profit && (
              <KpiCard label="Net Profit" value={fmt$$(deal.projected_net_profit)} accent />
            )}
            {deal.investor_capital_required && (
              <KpiCard label="Investor Capital" value={fmt$$(deal.investor_capital_required)} sub="Capital raise target" />
            )}
            {deal.projected_investor_return && (
              <KpiCard label="Projected Return" value={fmtPct(deal.projected_investor_return)} accent sub="On invested capital" />
            )}
          </div>
        </section>

        {/* ── VISUAL CHART ────────────────────────────────────────────────── */}
        {chartData.length > 0 && (
          <section className="bg-white rounded-2xl border border-primary-200 p-5 sm:p-6 shadow-sm">
            <p className="section-title">Deal Economics at a Glance</p>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-secondary-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#334155] inline-block" />Purchase</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#475569] inline-block" />Rehab</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#64748B] inline-block" />Other Costs</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-accent-500 inline-block" />ARV / Sale</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-accent-700 inline-block" />Net Profit</span>
            </div>
          </section>
        )}

        {/* ── USE OF FUNDS ─────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-primary-200 p-5 sm:p-6 shadow-sm">
          <p className="section-title">Use of Funds</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Purchase Price',  value: deal.purchase_price },
              { label: 'Rehab Budget',    value: deal.rehab_budget },
              { label: 'Holding Costs',   value: deal.holding_costs },
              { label: 'Closing Costs',   value: deal.closing_costs },
            ].filter(r => r.value > 0).map(({ label, value }) => {
              const pct = deal.total_project_cost ? (value / deal.total_project_cost) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-primary-700 font-medium">{label}</span>
                    <span className="font-semibold text-primary-900">{fmt$$(value)}</span>
                  </div>
                  <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-400 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between pt-3 border-t border-primary-100">
              <span className="font-bold text-primary-900">Total Project Cost</span>
              <span className="font-bold text-primary-900">{fmt$$(deal.total_project_cost)}</span>
            </div>
          </div>
          {deal.rent_estimate && (
            <div className="mt-4 bg-accent-50 border border-accent-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-accent-700 font-semibold text-sm mb-1">
                <Home size={14} />
                Rental / Refinance Scenario
              </div>
              <div className="flex flex-col sm:flex-row gap-3 text-sm">
                <div>
                  <span className="text-primary-500">Projected Rent: </span>
                  <span className="font-semibold text-primary-900">{fmt$$(deal.rent_estimate)}/mo</span>
                </div>
                {deal.refinance_value && (
                  <div>
                    <span className="text-primary-500">Refinance Value: </span>
                    <span className="font-semibold text-primary-900">{fmt$$(deal.refinance_value)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
        {(deal.timeline_details?.length > 0 || deal.estimated_timeline) && (
          <section>
            <p className="section-title">Project Timeline</p>
            {deal.estimated_timeline && (
              <div className="flex items-center gap-2 text-primary-600 font-semibold mb-4">
                <Clock size={16} className="text-accent-500" />
                Estimated total: {deal.estimated_timeline}
              </div>
            )}
            {deal.timeline_details?.length > 0 && (
              <div className="flex flex-col gap-0">
                {deal.timeline_details.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < deal.timeline_details.length - 1 && (
                        <div className="w-0.5 bg-primary-200 flex-1 my-1" />
                      )}
                    </div>
                    <div className="pb-5">
                      <div className="font-semibold text-primary-900 text-sm">{step.phase}</div>
                      <div className="text-primary-500 text-sm">{step.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── WHY THIS DEAL ─────────────────────────────────────────────────── */}
        {deal.why_this_deal && (
          <section className="bg-primary-900 rounded-2xl p-5 sm:p-6">
            <p className="section-title text-primary-400">Investment Thesis</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Why This Deal</h2>
            <p className="text-primary-300 leading-relaxed">{deal.why_this_deal}</p>
          </section>
        )}

        {/* ── DEAL HIGHLIGHTS ───────────────────────────────────────────────── */}
        {deal.deal_highlights?.length > 0 && (
          <section>
            <p className="section-title">Deal Highlights</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deal.deal_highlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-3 bg-white border border-primary-200 rounded-xl p-4">
                  <CheckCircle size={16} className="text-accent-500 mt-0.5 shrink-0" />
                  <span className="text-primary-700 text-sm leading-relaxed">{hl}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="bg-accent-500 rounded-2xl p-6 sm:p-8 text-center">
          <TrendingUp size={32} className="text-white mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Interested in This Opportunity?
          </h2>
          <p className="text-accent-100 mb-6 max-w-md mx-auto">
            Contact Isaac directly to ask questions, confirm availability, or express your interest in participating.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-white text-accent-700 hover:bg-accent-50 font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Express Interest
            </button>
            <a
              href="tel:+16025550100"
              className="w-full sm:w-auto bg-accent-600 hover:bg-accent-700 text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Phone size={16} />
              Call Isaac
            </a>
          </div>
        </section>

        {/* Share / back link */}
        <div className="flex items-center justify-between text-sm text-primary-400 pb-4">
          <Link to="/" className="flex items-center gap-2 hover:text-accent-600 transition-colors">
            <ArrowLeft size={14} />
            All Opportunities
          </Link>
          <a href="mailto:isaac@garciacapital.com" className="flex items-center gap-2 hover:text-accent-600 transition-colors">
            <Mail size={14} />
            isaac@garciacapital.com
          </a>
        </div>
      </div>

      {showModal && <InterestModal deal={deal} onClose={() => setShowModal(false)} />}

      <Footer />
    </div>
  );
}
