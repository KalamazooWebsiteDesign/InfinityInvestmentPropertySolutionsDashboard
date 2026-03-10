import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Upload, ExternalLink, Eye, EyeOff, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { api, fmtStatus } from '../../lib/api';

const STATUSES = ['lead', 'active', 'rehab', 'completed', 'sold'];

const emptyDeal = {
  title: '',
  address: '',
  status: 'lead',
  summary: '',
  cover_image: '',
  purchase_price: '',
  rehab_budget: '',
  holding_costs: '',
  closing_costs: '',
  total_project_cost: '',
  arv: '',
  projected_gross_profit: '',
  projected_net_profit: '',
  investor_capital_required: '',
  projected_investor_return: '',
  estimated_timeline: '',
  rent_estimate: '',
  refinance_value: '',
  deal_highlights: [''],
  timeline_details: [{ phase: '', duration: '' }],
  why_this_deal: '',
  notes: '',
  is_published: false,
};

function SectionHeader({ title }) {
  return (
    <div className="border-b border-primary-200 pb-3 mb-5">
      <h3 className="font-semibold text-primary-700 text-sm uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function NumberField({ label, name, value, onChange, prefix = '$', hint }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-sm font-medium">{prefix}</span>
        )}
        <input
          type="number"
          className={`input ${prefix ? 'pl-7' : ''}`}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="0"
          step="any"
          min="0"
        />
      </div>
      {hint && <span className="text-xs text-primary-400">{hint}</span>}
    </div>
  );
}

export default function DealEditorPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const isNew       = !id;
  const fileRef     = useRef(null);

  const [form, setForm]         = useState(emptyDeal);
  const [loading, setLoading]   = useState(!isNew);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [saved, setSaved]       = useState(false);

  // Load existing deal
  useEffect(() => {
    if (isNew) return;
    api.deals.adminList()
      .then(deals => {
        const deal = deals.find(d => String(d.id) === String(id));
        if (!deal) { setError('Deal not found'); return; }
        setForm({
          ...emptyDeal,
          ...deal,
          purchase_price:            deal.purchase_price    ?? '',
          rehab_budget:              deal.rehab_budget      ?? '',
          holding_costs:             deal.holding_costs     ?? '',
          closing_costs:             deal.closing_costs     ?? '',
          total_project_cost:        deal.total_project_cost ?? '',
          arv:                       deal.arv               ?? '',
          projected_gross_profit:    deal.projected_gross_profit ?? '',
          projected_net_profit:      deal.projected_net_profit ?? '',
          investor_capital_required: deal.investor_capital_required ?? '',
          projected_investor_return: deal.projected_investor_return ?? '',
          rent_estimate:             deal.rent_estimate     ?? '',
          refinance_value:           deal.refinance_value   ?? '',
          deal_highlights:           deal.deal_highlights?.length ? deal.deal_highlights : [''],
          timeline_details:          deal.timeline_details?.length ? deal.timeline_details : [{ phase: '', duration: '' }],
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // Auto-calc total project cost when components change
  useEffect(() => {
    const p = parseFloat(form.purchase_price) || 0;
    const r = parseFloat(form.rehab_budget)   || 0;
    const h = parseFloat(form.holding_costs)  || 0;
    const c = parseFloat(form.closing_costs)  || 0;
    const total = p + r + h + c;
    if (total > 0) {
      setForm(f => ({ ...f, total_project_cost: total.toString() }));
    }
  }, [form.purchase_price, form.rehab_budget, form.holding_costs, form.closing_costs]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Highlights ─────────────────────────────────────────────────────────────
  const setHighlight = (i, val) =>
    setForm(f => ({ ...f, deal_highlights: f.deal_highlights.map((h, j) => j === i ? val : h) }));
  const addHighlight = () =>
    setForm(f => ({ ...f, deal_highlights: [...f.deal_highlights, ''] }));
  const removeHighlight = (i) =>
    setForm(f => ({ ...f, deal_highlights: f.deal_highlights.filter((_, j) => j !== i) }));

  // ── Timeline ───────────────────────────────────────────────────────────────
  const setTimeline = (i, field, val) =>
    setForm(f => ({
      ...f,
      timeline_details: f.timeline_details.map((t, j) => j === i ? { ...t, [field]: val } : t)
    }));
  const addTimeline = () =>
    setForm(f => ({ ...f, timeline_details: [...f.timeline_details, { phase: '', duration: '' }] }));
  const removeTimeline = (i) =>
    setForm(f => ({ ...f, timeline_details: f.timeline_details.filter((_, j) => j !== i) }));

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.deals.uploadImage(file);
      setForm(f => ({ ...f, cover_image: result.url }));
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        purchase_price:            form.purchase_price    ? parseFloat(form.purchase_price)    : null,
        rehab_budget:              form.rehab_budget      ? parseFloat(form.rehab_budget)      : null,
        holding_costs:             form.holding_costs     ? parseFloat(form.holding_costs)     : null,
        closing_costs:             form.closing_costs     ? parseFloat(form.closing_costs)     : null,
        total_project_cost:        form.total_project_cost ? parseFloat(form.total_project_cost) : null,
        arv:                       form.arv               ? parseFloat(form.arv)               : null,
        projected_gross_profit:    form.projected_gross_profit ? parseFloat(form.projected_gross_profit) : null,
        projected_net_profit:      form.projected_net_profit ? parseFloat(form.projected_net_profit) : null,
        investor_capital_required: form.investor_capital_required ? parseFloat(form.investor_capital_required) : null,
        projected_investor_return: form.projected_investor_return ? parseFloat(form.projected_investor_return) : null,
        rent_estimate:             form.rent_estimate     ? parseFloat(form.rent_estimate)     : null,
        refinance_value:           form.refinance_value   ? parseFloat(form.refinance_value)   : null,
        deal_highlights:           form.deal_highlights.filter(h => h.trim()),
        timeline_details:          form.timeline_details.filter(t => t.phase.trim()),
      };

      if (isNew) {
        const created = await api.deals.create(payload);
        navigate(`/admin/deals/${created.id}/edit`);
      } else {
        await api.deals.update(id, payload);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? 'New Deal' : `Edit: ${form.title || 'Untitled'}`}
      actions={
        <div className="flex items-center gap-2">
          {!isNew && form.is_published && (
            <a
              href={`/deals/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm py-2 px-3"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Preview</span>
            </a>
          )}
          <button
            type="submit"
            form="deal-form"
            className="btn-primary text-sm py-2 px-4"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : saved ? (
              '✓ Saved!'
            ) : (
              <>
                <Save size={14} />
                {isNew ? 'Create Deal' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      }
    >
      <form id="deal-form" onSubmit={save} className="flex flex-col gap-8 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ── BASICS ─────────────────────────────────────────────────────── */}
        <section className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SectionHeader title="Deal Basics" />
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="field sm:col-span-2">
                <label className="label">Deal Title *</label>
                <input
                  className="input"
                  name="title"
                  value={form.title}
                  onChange={handle}
                  placeholder="e.g. The Ridgewood Flip"
                  required
                />
              </div>
              <div className="field sm:col-span-2">
                <label className="label">Property Address *</label>
                <input
                  className="input"
                  name="address"
                  value={form.address}
                  onChange={handle}
                  placeholder="e.g. 4821 Ridgewood Lane, Phoenix, AZ 85018"
                  required
                />
              </div>
              <div className="field">
                <label className="label">Deal Status</label>
                <select className="select" name="status" value={form.status} onChange={handle}>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{fmtStatus(s)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label">Estimated Timeline</label>
                <input className="input" name="estimated_timeline" value={form.estimated_timeline} onChange={handle} placeholder="e.g. 5–6 months" />
              </div>
            </div>

            <div className="field">
              <label className="label">Opportunity Summary</label>
              <textarea
                className="textarea"
                rows={4}
                name="summary"
                value={form.summary}
                onChange={handle}
                placeholder="A 2–4 sentence overview investors will see at the top of the deal page..."
              />
            </div>

            {/* Publish toggle */}
            <div className="flex items-center gap-3 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={form.is_published}
                  onChange={handle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-primary-200 peer-focus:ring-2 peer-focus:ring-accent-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
              </label>
              <div>
                <span className={`text-sm font-medium ${form.is_published ? 'text-accent-600' : 'text-primary-500'}`}>
                  {form.is_published ? '● Published — visible to investors' : '○ Draft — not yet public'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── COVER IMAGE ────────────────────────────────────────────────── */}
        <section className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SectionHeader title="Cover Image" />
          <div className="flex flex-col gap-4">
            {form.cover_image && (
              <div className="relative rounded-xl overflow-hidden h-48">
                <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                  className="absolute top-2 right-2 bg-primary-900/70 text-white rounded-lg p-1.5 hover:bg-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Image URL</label>
                <input
                  className="input"
                  name="cover_image"
                  value={form.cover_image}
                  onChange={handle}
                  placeholder="https://... or upload below"
                />
              </div>
              <div className="flex flex-col justify-end">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary h-[38px]"
                >
                  <Upload size={15} />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINANCIALS ──────────────────────────────────────────────────── */}
        <section className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SectionHeader title="Financial Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField label="Purchase Price"            name="purchase_price"            value={form.purchase_price}            onChange={handle} />
            <NumberField label="Rehab Budget"              name="rehab_budget"              value={form.rehab_budget}              onChange={handle} />
            <NumberField label="Holding Costs"             name="holding_costs"             value={form.holding_costs}             onChange={handle} />
            <NumberField label="Closing Costs"             name="closing_costs"             value={form.closing_costs}             onChange={handle} />
            <div className="field sm:col-span-2">
              <label className="label">Total Project Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-sm font-medium">$</span>
                <input
                  type="number"
                  className="input pl-7 bg-primary-50"
                  name="total_project_cost"
                  value={form.total_project_cost}
                  onChange={handle}
                  placeholder="Auto-calculated from above"
                />
              </div>
              <span className="text-xs text-primary-400">Auto-calculated from purchase + rehab + holding + closing costs</span>
            </div>

            <div className="sm:col-span-2 border-t border-primary-100 pt-4 mt-1">
              <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-4">Projections</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField label="ARV / Projected Sale Price"   name="arv"                        value={form.arv}                        onChange={handle} hint="After Repair Value" />
                <NumberField label="Projected Gross Profit"       name="projected_gross_profit"     value={form.projected_gross_profit}     onChange={handle} />
                <NumberField label="Projected Net Profit"         name="projected_net_profit"       value={form.projected_net_profit}       onChange={handle} />
                <NumberField label="Investor Capital Required"    name="investor_capital_required"  value={form.investor_capital_required}  onChange={handle} />
                <NumberField label="Projected Investor Return (%)" name="projected_investor_return" value={form.projected_investor_return}  onChange={handle} prefix="%" hint="Enter as a number, e.g. 14.5" />
              </div>
            </div>

            <div className="sm:col-span-2 border-t border-primary-100 pt-4 mt-1">
              <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-4">Optional — Rental / BRRR Scenario</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField label="Rent Estimate ($/month)"     name="rent_estimate"   value={form.rent_estimate}   onChange={handle} hint="Monthly rent post-renovation" />
                <NumberField label="Refinance / Refi Value"      name="refinance_value" value={form.refinance_value} onChange={handle} hint="Post-reno appraised value for refi" />
              </div>
            </div>
          </div>
        </section>

        {/* ── DEAL HIGHLIGHTS ─────────────────────────────────────────────── */}
        <section className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SectionHeader title="Deal Highlights" />
          <p className="text-xs text-primary-400 mb-4">Bullet points shown on the investor deal page. Keep each one concise — 1–2 sentences max.</p>
          <div className="flex flex-col gap-2">
            {form.deal_highlights.map((hl, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-bold shrink-0 mt-2">
                  {i + 1}
                </div>
                <input
                  className="input flex-1"
                  value={hl}
                  onChange={e => setHighlight(i, e.target.value)}
                  placeholder="e.g. Conservative ARV — meaningful upside potential remains"
                />
                {form.deal_highlights.length > 1 && (
                  <button type="button" onClick={() => removeHighlight(i)} className="btn-ghost p-2 text-primary-300 hover:text-red-500 mt-0.5">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addHighlight} className="btn-ghost text-sm mt-1 self-start">
              <Plus size={14} />
              Add Highlight
            </button>
          </div>
        </section>

        {/* ── TIMELINE ──────────────────────────────────────────────────── */}
        <section className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SectionHeader title="Project Timeline" />
          <div className="flex flex-col gap-3">
            {form.timeline_details.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <input
                  className="input flex-1"
                  value={step.phase}
                  onChange={e => setTimeline(i, 'phase', e.target.value)}
                  placeholder="Phase name (e.g. Renovation)"
                />
                <input
                  className="input w-36"
                  value={step.duration}
                  onChange={e => setTimeline(i, 'duration', e.target.value)}
                  placeholder="Duration"
                />
                {form.timeline_details.length > 1 && (
                  <button type="button" onClick={() => removeTimeline(i)} className="btn-ghost p-2 text-primary-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addTimeline} className="btn-ghost text-sm mt-1 self-start">
              <Plus size={14} />
              Add Phase
            </button>
          </div>
        </section>

        {/* ── INVESTMENT THESIS ───────────────────────────────────────────── */}
        <section className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SectionHeader title="Why This Deal" />
          <div className="field">
            <label className="label">Investment Thesis</label>
            <textarea
              className="textarea"
              rows={5}
              name="why_this_deal"
              value={form.why_this_deal}
              onChange={handle}
              placeholder="2–4 sentences explaining the core thesis: market conditions, exit confidence, contractor readiness, etc."
            />
          </div>
        </section>

        {/* ── INTERNAL NOTES ──────────────────────────────────────────────── */}
        <section className="bg-white border border-primary-200 rounded-xl p-5 sm:p-6 shadow-sm">
          <SectionHeader title="Internal Notes (Admin Only)" />
          <div className="field">
            <label className="label">Notes</label>
            <textarea
              className="textarea"
              rows={4}
              name="notes"
              value={form.notes}
              onChange={handle}
              placeholder="Private notes — not visible to investors. Reminders, investor contacts, contractor status, etc."
            />
          </div>
        </section>

        {/* ── SAVE / CANCEL ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <Link to="/admin/deals" className="btn-ghost">
            <ArrowLeft size={16} />
            Back to Deals
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : isNew ? 'Create Deal' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
