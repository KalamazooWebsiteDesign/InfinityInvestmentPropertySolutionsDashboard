import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import InvestorLayout from '../../components/InvestorLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api, fmt$$, fmtPct, fmtStatus, statusBadgeClass } from '../../lib/api';

function DealCard({ deal }) {
  const img = deal.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=70';

  return (
    <Link
      to={`/investor/deals/${deal.slug}`}
      className="group block bg-white rounded-2xl border border-primary-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={img}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={statusBadgeClass(deal.status)}>{fmtStatus(deal.status)}</span>
        </div>
        {deal.projected_investor_return && (
          <div className="absolute bottom-3 right-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {fmtPct(deal.projected_investor_return)} projected return
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-primary-900 text-lg leading-snug mb-1 group-hover:text-accent-600 transition-colors">
          {deal.title}
        </h3>
        <div className="flex items-center gap-1 text-primary-400 text-sm mb-3">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{deal.address}</span>
        </div>
        {deal.summary && (
          <p className="text-primary-500 text-sm leading-relaxed mb-4 line-clamp-2">{deal.summary}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {deal.investor_capital_required && (
            <div>
              <div className="text-xs text-primary-400 mb-0.5">Investor Capital</div>
              <div className="font-bold text-primary-900 text-sm">{fmt$$(deal.investor_capital_required)}</div>
            </div>
          )}
          {deal.arv && (
            <div>
              <div className="text-xs text-primary-400 mb-0.5">After Repair Value</div>
              <div className="font-bold text-primary-900 text-sm">{fmt$$(deal.arv)}</div>
            </div>
          )}
          {deal.projected_net_profit && (
            <div>
              <div className="text-xs text-primary-400 mb-0.5">Net Profit</div>
              <div className="font-bold text-accent-600 text-sm">{fmt$$(deal.projected_net_profit)}</div>
            </div>
          )}
          {deal.estimated_timeline && (
            <div>
              <div className="text-xs text-primary-400 mb-0.5">Timeline</div>
              <div className="font-bold text-primary-900 text-sm">{deal.estimated_timeline}</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-primary-100">
          <span className="text-xs text-primary-400">View deal details</span>
          <ArrowRight size={16} className="text-accent-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const [deals, setDeals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.investors.myDeals()
      .then(setDeals)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <InvestorLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-900 mb-1">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-primary-500">Here are the deals you're invested in.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-24">
          <TrendingUp size={40} className="text-primary-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-900 mb-2">No deals yet</h2>
          <p className="text-primary-500 max-w-sm mx-auto">
            You don't have any deals assigned to your account yet. Reach out to Isaac to get started.
          </p>
          <a
            href="mailto:isaac@infinityips.com"
            className="inline-flex items-center gap-2 mt-6 btn-primary"
          >
            Contact Isaac
          </a>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-primary-500">
              {deals.length} deal{deals.length !== 1 ? 's' : ''} in your portfolio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
          </div>
        </>
      )}
    </InvestorLayout>
  );
}
