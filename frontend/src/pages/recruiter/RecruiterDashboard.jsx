import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase, Users, TrendingUp, Plus, ArrowRight,
  MapPin, Clock, Eye, Star, Zap, Building2,
} from 'lucide-react';
import { PageLoader } from '../../components/ui/Spinner';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.jobs.myListings().catch(() => []),
      api.recruiter.getProfile().catch(() => null),
    ]).then(([j, p]) => {
      setJobs(j || []);
      setProfile(p);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const totalApplicants = jobs.reduce((acc, j) => acc + (j.application_count || 0), 0);
  const activeJobs = jobs.filter(j => j.is_active).length;

  const stats = [
    { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', sub: `${jobs.length} total` },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', sub: 'across all jobs' },
    { label: 'Avg. Applicants', value: jobs.length ? Math.round(totalApplicants / jobs.length) : 0, icon: TrendingUp, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', sub: 'per job post' },
    { label: 'Company', value: profile?.company_name || '—', icon: Building2, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', sub: profile?.industry || 'Set up profile', isText: true },
  ];

  const recentJobs = [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Welcome banner */}
        <div className="animate-fade-in" style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 'var(--radius-xl)', padding: '2rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(6,182,212,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.2)', marginBottom: '2rem',
        }}>
          {/* Bg orbs */}
          <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -40, right: 120, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)', filter: 'blur(30px)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Recruiter Dashboard</p>
              <h2 style={{ marginBottom: '0.5rem' }}>
                Hello, <span className="gradient-text">{user?.username}</span> 👋
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {activeJobs > 0
                  ? `You have ${activeJobs} active job${activeJobs > 1 ? 's' : ''} with ${totalApplicants} applicant${totalApplicants !== 1 ? 's' : ''}.`
                  : 'Post your first job to start finding great talent.'}
              </p>
            </div>
            <Link to="/recruiter/jobs" className="btn btn-gradient btn-lg" style={{ gap: '0.5rem', flexShrink: 0 }}>
              <Plus size={18} /> Post New Job
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4 animate-fade-in stagger-1" style={{ marginBottom: '2rem' }}>
          {stats.map((s, i) => (
            <div key={s.label} className={`stat-card stagger-${i + 1}`}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div className="stat-value gradient-text" style={{ fontSize: s.isText ? '1.1rem' : '2rem', marginBottom: '0.2rem' }}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', marginTop: '0.35rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {/* Recent Jobs */}
          <div className="card animate-fade-in stagger-2">
            <div className="section-header" style={{ marginBottom: '1.25rem' }}>
              <h3>Recent Job Posts</h3>
              <Link to="/recruiter/jobs" className="btn btn-ghost btn-sm">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            {recentJobs.length === 0 ? (
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <Briefcase size={36} className="empty-icon" />
                <h3>No jobs posted yet</h3>
                <p>Create your first job listing to start receiving applications.</p>
                <Link to="/recruiter/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  <Plus size={14} /> Post a Job
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentJobs.map(job => (
                  <Link key={job.id} to={`/recruiter/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.875rem', borderRadius: 12,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', fontWeight: 800, color: '#818cf8',
                      }}>
                        {job.title[0]}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={11} />{job.location}</span>}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={11} />{job.application_count || 0}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span className={`badge ${job.is_active ? 'badge-green' : 'badge-gray'}`}>{job.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions + tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Actions */}
            <div className="card animate-fade-in stagger-3">
              <h3 style={{ marginBottom: '1.1rem', fontSize: '0.95rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: 'Post New Job', icon: Plus, to: '/recruiter/jobs', color: 'var(--accent-1)', desc: 'Create a new listing' },
                  { label: 'Search Talent', icon: Users, to: '/recruiter/students', color: '#8b5cf6', desc: 'Find candidates by skill' },
                  { label: 'Update Profile', icon: Building2, to: '/recruiter/profile', color: '#06b6d4', desc: 'Add company details' },
                ].map(({ label, icon: Icon, to, color, desc }) => (
                  <Link key={label} to={to} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.8rem 1rem', borderRadius: 11,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.855rem', fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{desc}</div>
                      </div>
                      <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* AI tip */}
            <div className="card animate-fade-in stagger-4" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} color="#818cf8" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Candidate Ranking</div>
              </div>
              <p style={{ fontSize: '0.835rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                Click into any job posting to let AI automatically rank all applicants with match scores and reasoning.
              </p>
              <Link to="/recruiter/jobs" className="btn btn-outline btn-sm">
                Go to My Jobs <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
