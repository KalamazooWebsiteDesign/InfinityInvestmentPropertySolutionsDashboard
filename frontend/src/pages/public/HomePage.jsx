import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Shield, Clock, Users, Mail, Phone, ChevronDown } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DealCard from '../../components/DealCard';
import { api, fmt$$ } from '../../lib/api';

// ── Investor Interest Form ─────────────────────────────────────────────────────
function InvestorForm({ dealSlug = null, dealTitle = null, onClose = null }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.leads.submit({ ...form, deal_slug: dealSlug });
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-accent-600" />
        </div>
        <h3 className="text-xl font-bold text-primary-900 mb-2">You're on the list!</h3>
        <p className="text-primary-500 text-sm">
          Thanks for your interest{dealTitle ? ` in ${dealTitle}` : ''}. Isaac will be in touch shortly.
        </p>
        {onClose && (
          <button onClick={onClose} className="mt-4 btn-secondary text-sm py-2">Close</button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {dealTitle && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg px-4 py-3 text-sm text-accent-700 font-medium">
          Expressing interest in: {dealTitle}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label className="label">Full Name *</label>
          <input className="input" name="name" value={form.name} onChange={handle} placeholder="Jane Smith" required />
        </div>
        <div className="field">
          <label className="label">Email Address *</label>
          <input className="input" type="email" name="email" value={form.email} onChange={handle} placeholder="jane@example.com" required />
        </div>
      </div>
      <div className="field">
        <label className="label">Phone (optional)</label>
        <input className="input" name="phone" value={form.phone} onChange={handle} placeholder="(602) 555-0100" />
      </div>
      <div className="field">
        <label className="label">Message (optional)</label>
        <textarea
          className="textarea"
          rows={3}
          name="message"
          value={form.message}
          onChange={handle}
          placeholder="Tell us a bit about your investment goals or any questions you have..."
        />
      </div>
      {status === 'error' && (
        <p className="text-red-600 text-sm">{errorMsg}</p>
      )}
      <button type="submit" className="btn-primary" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Express Interest'}
        {status !== 'loading' && <ArrowRight size={16} />}
      </button>
      <p className="text-xs text-primary-400 text-center">
        No spam. Just deal updates and investment opportunities directly from Isaac.
      </p>
    </form>
  );
}

// ── Stats strip item ───────────────────────────────────────────────────────────
function StatItem({ value, label }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-2xl sm:text-3xl font-bold text-accent-400">{value}</span>
      <span className="text-primary-400 text-sm mt-0.5">{label}</span>
    </div>
  );
}

// ── Step card ──────────────────────────────────────────────────────────────────
function StepCard({ num, title, desc }) {
  return (
    <div className="relative flex flex-col items-center text-center p-6">
      <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-lg">
        {num}
      </div>
      <h3 className="font-bold text-primary-900 text-lg mb-2">{title}</h3>
      <p className="text-primary-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [deals, setDeals]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.deals.list(), api.deals.stats()])
      .then(([dealsData, statsData]) => {
        setDeals(dealsData.filter(d => d.is_published).slice(0, 3));
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1800&q=80')" }}
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-32">
          <div className="inline-flex items-center gap-2 bg-accent-500/15 border border-accent-500/30 text-accent-300 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <TrendingUp size={12} />
            Private Real Estate Opportunities — Phoenix Metro
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Invest in <span className="text-accent-400">Real Estate</span>{' '}
            With a Trusted Partner
          </h1>

          <p className="text-lg sm:text-xl text-primary-200 leading-relaxed max-w-2xl mx-auto mb-10">
            Isaac Garcia sources, manages, and executes high-quality fix-and-flip and value-add deals in the Phoenix Metro. Join select investors who earn strong returns on carefully vetted opportunities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto"
            >
              View Current Deals
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Join Investor List
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/40">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <section className="bg-primary-900 py-10 border-b border-primary-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value={`${stats?.active ?? '—'}+`} label="Active Opportunities" />
            <StatItem value={`${stats?.completed ?? '—'}+`} label="Completed Deals" />
            <StatItem value={stats?.totalProjectedProfit ? `${fmt$$(stats.totalProjectedProfit)}` : '—'} label="Projected Profit (Active)" />
            <StatItem value="Phoenix" label="Metro Focus" />
          </div>
        </div>
      </section>

      {/* ── FEATURED DEALS ──────────────────────────────────────────────────── */}
      <section id="opportunities" className="py-20 bg-primary-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="section-title">Current Portfolio</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-900 mb-4">
              Active Investment Opportunities
            </h2>
            <p className="text-primary-500 text-lg max-w-xl mx-auto">
              Carefully selected deals with clear fundamentals, conservative underwriting, and strong return profiles.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-primary-400">
              <p>New opportunities coming soon. Join the investor list to be notified first.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="section-title">Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-900 mb-4">
              How It Works
            </h2>
            <p className="text-primary-500 text-lg max-w-xl mx-auto">
              A straightforward, transparent process from deal identification to return distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-accent-200" />

            <StepCard
              num="1"
              title="We Find the Deal"
              desc="Isaac sources off-market and on-market properties with strong fundamentals in the Phoenix Metro, then underwrites each deal conservatively before presenting to investors."
            />
            <StepCard
              num="2"
              title="You Invest"
              desc="Review the deal page, ask questions, and confirm your participation. Capital is secured by the property and all terms are clearly documented before funding."
            />
            <StepCard
              num="3"
              title="We Execute & Distribute"
              desc="Isaac manages the full project — acquisition, renovation, and exit — then distributes returns to investors within the projected timeline."
            />
          </div>

          <div className="mt-12 bg-primary-50 rounded-2xl border border-primary-200 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Shield size={28} className="text-accent-500" />
                <h3 className="font-bold text-primary-900">First-Position Security</h3>
                <p className="text-primary-500 text-sm">Investor capital secured by recorded deed of trust on the property.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <TrendingUp size={28} className="text-accent-500" />
                <h3 className="font-bold text-primary-900">Transparent Returns</h3>
                <p className="text-primary-500 text-sm">Clear projections, no hidden fees, and full reporting throughout the project.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Clock size={28} className="text-accent-500" />
                <h3 className="font-bold text-primary-900">Defined Timelines</h3>
                <p className="text-primary-500 text-sm">Each deal has a clear start and end date so your capital is not tied up indefinitely.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ISAAC ──────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-primary-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img
                  src="/isaac-garcia.jpg"
                  alt="Isaac Garcia"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-accent-500 text-white rounded-xl px-5 py-3 shadow-lg">
                <div className="font-bold text-xl">Isaac Garcia</div>
                <div className="text-accent-100 text-sm">Founder, Infinity Investment Property Solutions</div>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="section-title text-primary-400">About</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
                Real Estate Investing, Done Right
              </h2>
              <p className="text-primary-300 leading-relaxed mb-6">
                Isaac Garcia has spent years executing profitable real estate transactions in the Phoenix Metro — one of the most active real estate markets in the United States. His approach is grounded in conservative underwriting, trusted contractor relationships, and a commitment to protecting investor capital above all else.
              </p>
              <p className="text-primary-400 leading-relaxed mb-8">
                Infinity Investment Property Solutions operates with a simple mission: identify strong opportunities, structure deals transparently, and deliver results. Every deal presented here has been personally sourced, analyzed, and approved by Isaac.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  'Conservative deal underwriting',
                  'Trusted contractor network',
                  'Phoenix market specialist',
                  'Full project transparency',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-accent-400 mt-0.5 shrink-0" />
                    <span className="text-primary-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── JOIN INVESTOR LIST ────────────────────────────────────────────────── */}
      <section id="join" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="section-title">Get Started</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-900 mb-4">
              Ready to Invest?
            </h2>
            <p className="text-primary-500 text-lg">
              Fill out the form below and Isaac will reach out to discuss current opportunities and how you can participate.
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 sm:p-8">
            <InvestorForm />
          </div>

          <div className="mt-8 text-center text-sm text-primary-400">
            <p>Or reach out directly:</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-3">
              <a href="mailto:isaac@infinityips.com" className="flex items-center gap-2 text-primary-600 hover:text-accent-600 font-medium transition-colors">
                <Mail size={16} />
                isaac@infinityips.com
              </a>
              <a href="tel:+16025550100" className="flex items-center gap-2 text-primary-600 hover:text-accent-600 font-medium transition-colors">
                <Phone size={16} />
                (602) 555-0100
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
