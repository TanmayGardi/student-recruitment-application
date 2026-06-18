import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner, { PageLoader } from '../../components/ui/Spinner';
import { api } from '../../api/client';
import {
  User, Phone, Mail, BookOpen, GraduationCap, Award,
  Link2, Code2, Globe, Plus, X, Save, Camera,
  Building, Calendar, BarChart2
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 2 + i);

function TagInput({ tags, setTags, placeholder, color = '#6366f1' }) {
  const [input, setInput] = useState('');
  const inputRef = useRef();

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        padding: '0.6rem', borderRadius: 'var(--radius)',
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
        minHeight: 48, cursor: 'text',
      }} onClick={() => inputRef.current?.focus()}>
        {tags.map((t, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.6rem', borderRadius: 20,
            background: `${color}20`, border: `1px solid ${color}40`,
            color: color, fontSize: '0.78rem', fontWeight: 600,
          }}>
            {t}
            <button onClick={() => setTags(tags.filter((_, j) => j !== i))}
              style={{ color: color, display: 'flex', padding: '1px', opacity: 0.7 }}>
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{
            flex: 1, minWidth: 100, background: 'transparent', border: 'none',
            outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem',
          }}
        />
      </div>
      <button onClick={add} className="btn btn-sm" style={{
        marginTop: '0.4rem', background: `${color}20`,
        border: `1px solid ${color}40`, color: color, display: 'flex',
        alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem',
      }}>
        <Plus size={12} /> Add
      </button>
    </div>
  );
}

export default function StudentProfile() {
  const { user } = useAuth();
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', bio: '', college: '',
    degree: '', branch: '', graduation_year: '', cgpa: '',
    skills: [], desired_roles: [],
    linkedin_url: '', github_url: '', portfolio_url: '',
  });

  useEffect(() => {
    api.student.getProfile()
      .then(p => {
        if (p) setForm({
          full_name: p.full_name || '',
          phone: p.phone || '',
          bio: p.bio || '',
          college: p.college || '',
          degree: p.degree || '',
          branch: p.branch || '',
          graduation_year: p.graduation_year || '',
          cgpa: p.cgpa || '',
          skills: p.skills || [],
          desired_roles: p.desired_roles || [],
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          portfolio_url: p.portfolio_url || '',
        });
      })
      .catch(() => showToast('Could not load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.student.updateProfile(form);
      showToast('Profile saved successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const initials = (form.full_name || user?.email || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const cgpaVal = parseFloat(form.cgpa) || 0;

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">

        {/* ── Hero Section ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
          padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 300, height: 300,
            background: 'radial-gradient(circle at top right, rgba(99,102,241,0.15), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'var(--gradient-main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 800, color: '#fff',
                boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                border: '3px solid rgba(99,102,241,0.4)',
              }}>
                {initials}
              </div>
              <div style={{
                position: 'absolute', bottom: 2, right: 2, width: 26, height: 26,
                borderRadius: '50%', background: 'var(--bg-surface)',
                border: '2px solid var(--border)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Camera size={12} color="var(--text-secondary)" />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {form.full_name || <span style={{ color: 'var(--text-muted)' }}>Your Name</span>}
              </h2>
              {form.college && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building size={14} /> {form.college}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <span className="badge badge-blue">Student</span>
                {form.degree && <span className="badge badge-purple">{form.degree}</span>}
                {form.branch && <span className="badge badge-cyan">{form.branch}</span>}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 'var(--radius)', padding: '0.75rem 1.25rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>
                  {form.cgpa || '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CGPA</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Form ── */}
        <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>

          {/* Personal Info */}
          <div className="card-glass">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#6366f1" />
              </div>
              <h3 style={{ fontWeight: 700 }}>Personal Information</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your full name"
                value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Phone Number
              </label>
              <input className="form-input" placeholder="+91 9876543210" type="tel"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Email
              </label>
              <input className="form-input" value={user?.email || ''} readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / About Me</label>
              <textarea className="form-input" rows={4}
                placeholder="Write a short bio about yourself, your interests and career goals..."
                value={form.bio} onChange={e => set('bio', e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Education */}
          <div className="card-glass">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={16} color="#06b6d4" />
              </div>
              <h3 style={{ fontWeight: 700 }}>Education</h3>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Building size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />College / University
              </label>
              <input className="form-input" placeholder="e.g. IIT Bombay"
                value={form.college} onChange={e => set('college', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                <BookOpen size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Degree
              </label>
              <input className="form-input" placeholder="e.g. B.Tech, MCA, MBA"
                value={form.degree} onChange={e => set('degree', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Branch / Specialization</label>
              <input className="form-input" placeholder="e.g. Computer Science"
                value={form.branch} onChange={e => set('branch', e.target.value)} />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />Graduation Year
                </label>
                <select className="form-input" value={form.graduation_year}
                  onChange={e => set('graduation_year', e.target.value)}>
                  <option value="">Select year</option>
                  {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CGPA (0–10)</label>
                <input className="form-input" type="number" min="0" max="10" step="0.01"
                  placeholder="e.g. 8.5"
                  value={form.cgpa} onChange={e => set('cgpa', e.target.value)} />
              </div>
            </div>

            {/* CGPA Slider visual */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <span>0</span><span>5</span><span>10</span>
              </div>
              <input type="range" min="0" max="10" step="0.01"
                value={cgpaVal} onChange={e => set('cgpa', e.target.value)}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }} />
              <div style={{
                textAlign: 'center', marginTop: '0.3rem',
                fontSize: '0.85rem', color: '#6366f1', fontWeight: 700,
              }}>{cgpaVal.toFixed(2)} / 10.00</div>
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="card-glass" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} color="#8b5cf6" />
            </div>
            <h3 style={{ fontWeight: 700 }}>Skills</h3>
            <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{form.skills.length} skills</span>
          </div>
          <TagInput
            tags={form.skills}
            setTags={v => set('skills', v)}
            placeholder="Type a skill and press Enter (e.g. React, Python, SQL...)"
            color="#8b5cf6"
          />
        </div>

        {/* ── Desired Roles ── */}
        <div className="card-glass" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={16} color="#06b6d4" />
            </div>
            <h3 style={{ fontWeight: 700 }}>Desired Roles</h3>
            <span className="badge badge-cyan" style={{ marginLeft: 'auto' }}>{form.desired_roles.length} roles</span>
          </div>
          <TagInput
            tags={form.desired_roles}
            setTags={v => set('desired_roles', v)}
            placeholder="Type a role and press Enter (e.g. Frontend Developer, Data Analyst...)"
            color="#06b6d4"
          />
        </div>

        {/* ── Links ── */}
        <div className="card-glass" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#f59e0b" />
            </div>
            <h3 style={{ fontWeight: 700 }}>Links & Profiles</h3>
          </div>
          <div className="grid-3" style={{ gap: '1rem' }}>
            {[
              { key: 'linkedin_url', label: 'LinkedIn', icon: Link2, color: '#0a66c2', placeholder: 'linkedin.com/in/yourprofile' },
              { key: 'github_url', label: 'GitHub', icon: Code2, color: '#8b5cf6', placeholder: 'github.com/yourusername' },
              { key: 'portfolio_url', label: 'Portfolio', icon: Globe, color: '#06b6d4', placeholder: 'yourportfolio.com' },
            ].map(({ key, label, icon: Icon, color, placeholder }) => (
              <div key={key} className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon size={13} color={color} /> {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    color: color, display: 'flex',
                  }}>
                    <Icon size={14} />
                  </div>
                  <input className="form-input" placeholder={placeholder}
                    value={form[key]} onChange={e => set(key, e.target.value)}
                    style={{ paddingLeft: '2.25rem' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Save Button ── */}
        <button className="btn btn-gradient" onClick={handleSave} disabled={saving}
          style={{
            width: '100%', padding: '1rem', fontSize: '1rem',
            fontWeight: 700, gap: '0.5rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            opacity: saving ? 0.8 : 1,
          }}>
          {saving ? <Spinner size={18} color="#fff" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>

      </div>
    </DashboardLayout>
  );
}
