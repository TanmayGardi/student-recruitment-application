import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/ui/Spinner';
import { api } from '../../api/client';
import {
  Briefcase, Send, Star, Zap, TrendingUp, TrendingDown,
  FileText, Target, GitBranch, ChevronRight, MapPin,
  DollarSign, Clock, CheckCircle, ArrowRight, Sparkles,
  Brain, Search
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function CircularProgress({ pct = 0, size = 100, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(99,102,241,0.15)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#prog-grad)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <defs>
        <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const showToast = useToast();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.student.getProfile().catch(() => null),
      api.student.browseJobs({ limit: 3 }).catch(() => []),
      api.student.getApplications().catch(() => []),
    ]).then(([p, j, a]) => {
      setProfile(p);
      setJobs(Array.isArray(j) ? j.slice(0, 3) : []);
      setApplications(Array.isArray(a) ? a : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const cgpa = profile?.cgpa ?? '—';
  const skills = profile?.skills ?? [];
  const appliedCount = applications.length;
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
  const hired = applications.filter(a => a.status === 'hired').length;

  // Profile completion
  const checks = [
    { label: 'Full Name', done: !!profile?.full_name, color: '#6366f1' },
    { label: 'Phone Number', done: !!profile?.phone, color: '#8b5cf6' },
    { label: 'Bio / About', done: !!profile?.bio, color: '#06b6d4' },
    { label: 'Skills Added', done: skills.length > 0, color: '#10b981' },
    { label: 'Resume Uploaded', done: !!profile?.resume_url, color: '#f59e0b' },
    { label: 'College Info', done: !!profile?.college, color: '#ec4899' },
  ];
  const completedChecks = checks.filter(c => c.done).length;
  const completionPct = Math.round((completedChecks / checks.length) * 100);

  const stats = [
    { label: 'Jobs Available', value: jobs.length > 0 ? '50+' : '0', icon: Briefcase, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', trend: '+12%', up: true },
    { label: 'Applications Sent', value: appliedCount, icon: Send, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', trend: appliedCount > 0 ? `+${appliedCount}` : '—', up: true },
    { label: 'CGPA Score', value: cgpa, icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: 'Current', up: true },
    { label: 'Skills Tagged', value: skills.length, icon: Zap, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', trend: skills.length > 0 ? 'Active' : 'Add skills', up: true },
  ];

  const aiTools = [
    { icon: FileText, label: 'Parse Resume', desc: 'Extract skills & experience automatically', color: '#6366f1', grad: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(99,102,241,0.05))' },
    { icon: Target, label: 'Match Jobs', desc: 'AI-ranked jobs based on your profile', color: '#8b5cf6', grad: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(139,92,246,0.05))' },
    { icon: Brain, label: 'Skill Gap', desc: 'Find missing skills for your dream role', color: '#06b6d4', grad: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(6,182,212,0.05))' },
  ];

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">

        {/* ── Welcome Banner ── */}
        <div style={{
          position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d1526 0%, #131f35 50%, #0d1a2e 100%)',
          border: '1px solid rgba(99,102,241,0.25)', padding: '2.5rem 2rem',
          marginBottom: '2rem',
        }}>
          {/* Animated orbs */}
          <div style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            top: -100, right: -50, pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            bottom: -80, left: 200, pointerEvents: 'none',
            animation: 'float 8s ease-in-out infinite reverse',
          }} />
          <div style={{
            position: 'absolute', width: 150, height: 150, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
            top: 20, left: -30, pointerEvents: 'none',
            animation: 'float 7s ease-in-out infinite',
          }} />
          <style>{`
            @keyframes float {
              0%,100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-20px) scale(1.05); }
            }
            @keyframes shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
          `}</style>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--gradient-main)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff',
              flexShrink: 0, boxShadow: '0 0 30px rgba(99,102,241,0.5)',
            }}>
              {initials}
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                {getGreeting()} 👋
              </p>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>
                <span className="gradient-text">{name}</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Your career journey starts here — let's make today count!
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">Student</span>
              {profile?.degree && <span className="badge badge-purple">{profile.degree}</span>}
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card" style={{
                background: `var(--bg-surface)`,
                borderColor: `${s.color}30`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: 80, height: 80,
                  background: `radial-gradient(circle at top right, ${s.color}20, transparent 70%)`,
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius)',
                    background: s.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', border: `1px solid ${s.color}30`,
                  }}>
                    <Icon size={20} color={s.color} />
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.75rem', color: s.up ? '#10b981' : '#ef4444',
                  }}>
                    {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {s.trend}
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Profile Completion + Application Pipeline ── */}
        <div className="grid-2" style={{ marginBottom: '2rem', gap: '1.5rem' }}>

          {/* Profile Completion */}
          <div className="card-glass">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700 }}>Profile Completion</h3>
              <span className="badge badge-cyan">{completionPct}%</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <CircularProgress pct={completionPct} size={100} stroke={9} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9' }}>{completionPct}%</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Done</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {checks.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: c.done ? c.color : 'var(--text-muted)',
                      boxShadow: c.done ? `0 0 6px ${c.color}` : 'none',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '0.78rem', color: c.done ? 'var(--text-primary)' : 'var(--text-muted)',
                      textDecoration: c.done ? 'none' : 'none',
                    }}>{c.label}</span>
                    {c.done && <CheckCircle size={12} color="#10b981" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Pipeline */}
          <div className="card-glass">
            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700 }}>Application Pipeline</h3>
              <span className="badge badge-purple">{appliedCount} Total</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Applied', count: appliedCount, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', pct: 100 },
                { label: 'Shortlisted', count: shortlisted, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', pct: appliedCount ? Math.round((shortlisted / appliedCount) * 100) : 0 },
                { label: 'Hired', count: hired, color: '#10b981', bg: 'rgba(16,185,129,0.15)', pct: appliedCount ? Math.round((hired / appliedCount) * 100) : 0 },
              ].map((stage, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ArrowRight size={14} color={stage.color} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stage.label}</span>
                    </div>
                    <span style={{
                      padding: '0.15rem 0.6rem', borderRadius: 20,
                      background: stage.bg, color: stage.color,
                      fontSize: '0.78rem', fontWeight: 700,
                    }}>{stage.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${stage.pct}%`,
                      background: stage.color,
                      boxShadow: `0 0 8px ${stage.color}60`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Tools Strip ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#8b5cf6" /> AI Powered Tools
            </h3>
            <a href="/student/ai-hub" style={{ color: 'var(--accent-1)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              View all <ChevronRight size={14} />
            </a>
          </div>
          <div className="grid-3" style={{ gap: '1rem' }}>
            {aiTools.map((t, i) => {
              const Icon = t.icon;
              return (
                <div key={i} style={{
                  background: t.grad, border: `1px solid ${t.color}30`,
                  borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  position: 'relative', overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 0 24px ${t.color}30`;
                    e.currentTarget.style.borderColor = `${t.color}60`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = `${t.color}30`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius)',
                    background: `${t.color}20`, border: `1px solid ${t.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}>
                    <Icon size={20} color={t.color} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{t.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{t.desc}</div>
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    color: t.color, opacity: 0.5,
                  }}>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Jobs ── */}
        <div>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} color="#06b6d4" /> Recent Jobs
            </h3>
            <a href="/student/jobs" style={{ color: 'var(--accent-1)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              Browse all <ChevronRight size={14} />
            </a>
          </div>
          {jobs.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={40} color="var(--text-muted)" />
              <p>No recent jobs available</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {jobs.map((job, i) => (
                <div key={job.id || i} style={{
                  minWidth: 280, background: 'var(--bg-surface)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem', flexShrink: 0,
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius)',
                      background: 'var(--gradient-main)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#fff', fontSize: '1rem',
                    }}>
                      {(job.company_name || job.company || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{job.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{job.company_name || job.company}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {job.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <MapPin size={11} /> {job.location}
                      </span>
                    )}
                    {job.job_type && <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{job.job_type}</span>}
                    {job.salary_range && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#10b981' }}>
                        <DollarSign size={11} /> {job.salary_range}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
