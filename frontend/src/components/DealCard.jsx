import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { fmt$$, fmtPct, fmtStatus, statusBadgeClass } from '../lib/api';

export default function DealCard({ deal }) {
  const img = deal.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=70';

  return (
    <Link
      to={`/deals/${deal.slug}`}
      className="group block bg-white rounded-2xl border border-primary-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={img}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={statusBadgeClass(deal.status)}>
            {fmtStatus(deal.status)}
          </span>
        </div>
        {deal.projected_investor_return && (
          <div className="absolute bottom-3 right-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {fmtPct(deal.projected_investor_return)} projected return
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-primary-900 text-lg leading-snug mb-1 group-hover:text-accent-600 transition-colors">
          {deal.title}
        </h3>

        <div className="flex items-center gap-1 text-primary-400 text-sm mb-3">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{deal.address}</span>
        </div>

        {deal.summary && (
          <p className="text-primary-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {deal.summary}
          </p>
        )}

        {/* Key numbers */}
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
          <span className="text-xs text-primary-400">View full opportunity</span>
          <ArrowRight size={16} className="text-accent-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
