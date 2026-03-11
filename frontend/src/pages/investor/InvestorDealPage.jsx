import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  MapPin, Clock, TrendingUp, CheckCircle, ArrowLeft,
  DollarSign, Home, AlertCircle
} from 'lucide-react';
import InvestorLayout from '../../components/InvestorLayout';
import { api, fmt$$, fmtPct, fmtStatus, statusBadgeClass } from '../../lib/api';

function KpiCard({ label, value, sub, accent = false }) {
  return (
    <div className={`kpi-card ${accent ? 'border-accent-200 bg-accent-50' : ''}`}>
      <span className="text-xs text-secondary-500 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-xl font-bold leading-tight ${accent ? 'text-accent-600' : 'text-primary-900'}`}>{value}</span>
      {sub && <span className="text-xs text-secondary-400">{sub}</span>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      <p>{fmt$$(payload[0].value)}</p>
    </div>
  );
}

export default function InvestorDealPage() {
  const { slug }              = useParams();
  const [deal, setDeal]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.investors.myDeal(slug)
      .then(setDeal)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const chartData = deal ? [
    { name: 'Purchase',    value: deal.purchase_price,   fill: '#334155' },
    { name: 'Rehab',       value: deal.rehab_budget,      fill: '#475569' },
    { name: 'Other Costs', value: (deal.holding_costs || 0) + (deal.closing_costs || 0), fill: '#64748B' },
    { name: 'ARV / Sale',  value: deal.arv,               fill: '#10B981' },
    { name: 'Net Profit',  value: deal.projected_net_profit, fill: '#059669' },
  ].filter(d => d.value > 0) : [];

  if (loading) {
    return (
      <InvestorLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </InvestorLayout>
    );
  }

  if (error || !deal) {
    return (
      <InvestorLayout>
        <div className="text-center py-20">
          <AlertCircle size={40} className="text-primary-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary-900 mb-2">Deal not found</h1>
          <p className="text-primary-500 mb-6">This deal may not be assigned to your account.</p>
          <Link to="/investor" className="btn-primary">Back to Portfolio</Link>
        </div>
      </InvestorLayout>
    );
  }

  const img = deal.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80';

  return (
    <InvestorLayout>
      {/* Back link */}
      <Link
        to="/investor"
        className="inline-flex items-center gap-2 text-primary-400 hover:text-accent-600 text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Portfolio
      </Link>

      {/* Hero image */}
      <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
        <img src={img} alt={deal.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className={statusBadgeClass(deal.status) + ' mb-2'}>{fmtStatus(deal.status)}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{deal.title}</h1>
          <div className="flex items-center gap-2 text-white/70 mt-1 text-sm">
            <MapPin size={13} />
            <span>{deal.address}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* Summary */}
        {deal.summary && (
          <section>
            <p className="section-title">Opportunity Overview</p>
            <p className="text-primary-700 text-base sm:text-lg leading-relaxed max-w-3xl">{deal.summary}</p>
          </section>
        )}

        {/* KPI Cards */}
        <section>
          <p className="section-title">Key Numbers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {deal.purchase_price       && <KpiCard label="Purchase Price"       value={fmt$$(deal.purchase_price)} />}
            {deal.total_project_cost   && <KpiCard label="Total Project Cost"   value={fmt$$(deal.total_project_cost)} />}
            {deal.arv                  && <KpiCard label="After Repair Value"   value={fmt$$(deal.arv)} sub="Projected sale price" />}
            {deal.projected_net_profit && <KpiCard label="Net Profit"           value={fmt$$(deal.projected_net_profit)} accent />}
            {deal.investor_capital_required && <KpiCard label="Investor Capital" value={fmt$$(deal.investor_capital_required)} sub="Capital raise target" />}
            {deal.projected_investor_return && <KpiCard label="Projected Return" value={fmtPct(deal.projected_investor_return)} accent sub="On invested capital" />}
          </div>
        </section>

        {/* Chart */}
        {chartData.length > 0 && (
          <section className="bg-white rounded-2xl border border-primary-200 p-5 sm:p-6 shadow-sm">
            <p className="section-title">Deal Economics at a Glance</p>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false} tickLine={false} width={52}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Use of Funds */}
        <section className="bg-white rounded-2xl border border-primary-200 p-5 sm:p-6 shadow-sm">
          <p className="section-title">Use of Funds</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Purchase Price', value: deal.purchase_price },
              { label: 'Rehab Budget',   value: deal.rehab_budget },
              { label: 'Holding Costs',  value: deal.holding_costs },
              { label: 'Closing Costs',  value: deal.closing_costs },
            ].filter(r => r.value > 0).map(({ label, value }) => {
              const pct = deal.total_project_cost ? (value / deal.total_project_cost) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-primary-700 font-medium">{label}</span>
                    <span className="font-semibold text-primary-900">{fmt$$(value)}</span>
                  </div>
                  <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
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

        {/* Timeline */}
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

        {/* Why This Deal */}
        {deal.why_this_deal && (
          <section className="bg-primary-900 rounded-2xl p-5 sm:p-6">
            <p className="section-title text-primary-400">Investment Thesis</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Why This Deal</h2>
            <p className="text-primary-300 leading-relaxed">{deal.why_this_deal}</p>
          </section>
        )}

        {/* Deal Highlights */}
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
      </div>
    </InvestorLayout>
  );
}
