import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import { useToast } from '../../components/ui/Toast';
import Spinner, { PageLoader } from '../../components/ui/Spinner';
import {
  Building2, Globe, Phone, Link2, Save,
  Briefcase, MapPin, Edit3, CheckCircle2,
} from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'E-commerce', 'EdTech',
  'FinTech', 'AI / ML', 'Consulting', 'Manufacturing', 'Media',
  'Logistics', 'Gaming', 'SaaS', 'Other',
];

export default function RecruiterProfile() {
  const showToast = useToast();
  const [form, setForm] = useState({
    full_name: '', company_name: '', company_website: '',
    industry: '', designation: '', phone: '', linkedin_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.recruiter.getProfile()
      .then(p => {
        if (p) setForm({
          full_name: p.full_name || '',
          company_name: p.company_name || '',
          company_website: p.company_website || '',
          industry: p.industry || '',
          designation: p.designation || '',
          phone: p.phone || '',
          linkedin_url: p.linkedin_url || '',
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.recruiter.updateProfile(form);
      showToast('Profile updated! ✓', 'success');
      setSaved(true);
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const completedFields = Object.values(form).filter(v => v).length;
  const completionPct = Math.round((completedFields / 7) * 100);

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 860 }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.3rem' }}>Company Profile</h2>
          <p style={{ fontSize: '0.875rem' }}>Your company information is shown to students viewing your job postings.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Form card */}
          <div className="card animate-fade-in stagger-1">
            <form onSubmit={handleSave}>
              {/* Company avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                  border: '2px solid rgba(99,102,241,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800, color: '#818cf8',
                }}>
                  {form.company_name?.[0]?.toUpperCase() || <Building2 size={28} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
                    {form.company_name || 'Your Company'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {form.designation || 'Position'} {form.industry ? `· ${form.industry}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Personal */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-1)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Edit3 size={11} /> Personal Info
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input className="form-input" value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. HR Manager" />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><Phone size={11} style={{ display: 'inline', marginRight: 4 }} />Phone</label>
                      <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><Link2 size={11} style={{ display: 'inline', marginRight: 4 }} />LinkedIn URL</label>
                      <input className="form-input" type="url" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/…" />
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)' }} />

                {/* Company */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building2 size={11} /> Company Info
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Company Name</label>
                      <input className="form-input" value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="e.g. Acme Technologies" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <select className="form-input form-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
                        <option value="">Select industry…</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label"><Globe size={11} style={{ display: 'inline', marginRight: 4 }} />Company Website</label>
                      <input className="form-input" type="url" value={form.company_website} onChange={e => set('company_website', e.target.value)} placeholder="https://company.com" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button type="submit" disabled={saving}
                  className="btn btn-gradient w-full" style={{ height: 48 }}>
                  {saving ? <Spinner size={16} color="#fff" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                  {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: completion + tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: 80 }}>
            {/* Completion */}
            <div className="card animate-fade-in stagger-2">
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Profile Completeness</h4>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="36" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                  <circle cx="45" cy="45" r="36" fill="none"
                    stroke="url(#pg)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - completionPct / 100)}`}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '45px 45px', transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                  <defs>
                    <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <span style={{ position: 'absolute', fontWeight: 800, fontSize: '1.2rem' }}>{completionPct}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  ['Full Name', form.full_name],
                  ['Company', form.company_name],
                  ['Industry', form.industry],
                  ['Designation', form.designation],
                  ['Website', form.company_website],
                  ['Phone', form.phone],
                  ['LinkedIn', form.linkedin_url],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: val ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                    <span style={{ color: val ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>{val ? '✓' : '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="card animate-fade-in stagger-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>💡 Tip</div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.65 }}>
                A complete company profile gets <strong>3×</strong> more applicants. Add your website and industry for best results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
