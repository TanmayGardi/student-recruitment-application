import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner, { PageLoader } from '../../components/ui/Spinner';
import { api } from '../../api/client';
import {
  Briefcase, Calendar, CheckCircle, Clock, XCircle,
  Star, Building, MapPin, TrendingUp, FileText, Target
} from 'lucide-react';

const STATUS_TABS = ['all', 'applied', 'shortlisted', 'hired', 'rejected'];

const STATUS_CONFIG = {
  applied:     { label: 'Applied',     color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: FileText,      badge: 'badge-blue'   },
  shortlisted: { label: 'Shortlisted', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Star,          badge: 'badge-yellow' },
  hired:       { label: 'Hired',       color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle,   badge: 'badge-green'  },
  rejected:    { label: 'Rejected',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: XCircle,       badge: 'badge-red'    },
  pending:     { label: 'Pending',     color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', icon: Clock,         badge: ''             },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ApplicationCard({ app }) {
  const status = (app.status || 'applied').toLowerCase();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.applied;
  const StatusIcon = cfg.icon;

  const companyName = app.company_name || app.job?.company_name || app.job?.company || 'Company';
  const jobTitle = app.job_title || app.job?.title || 'Job Title';
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
  const color = colors[(companyName.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="card" style={{
      borderColor: `${cfg.color}20`,
      transition: 'all 0.2s ease',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${cfg.color}40`;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.2)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${cfg.color}20`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Status accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${cfg.color}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {/* Company Avatar */}
        <div style={{
          width: 50, height: 50, borderRadius: 'var(--radius)',
          background: `${color}20`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', fontWeight: 800, color, flexShrink: 0,
        }}>
          {companyName[0].toUpperCase()}
        </div>

        {/* Main Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{jobTitle}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <Building size={12} /> {companyName}
                {app.location && <><MapPin size={11} style={{ marginLeft: '0.5rem' }} /> {app.location}</>}
              </div>
            </div>

            {/* Status Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.3rem 0.75rem', borderRadius: 20,
              background: cfg.bg, color: cfg.color,
              fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              border: `1px solid ${cfg.color}30`,
            }}>
              <StatusIcon size={12} />
              {cfg.label}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
            {/* Applied Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Calendar size={11} />
              Applied {formatDate(app.applied_at || app.created_at)}
            </div>

            {/* Match Score */}
            {app.match_score != null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.75rem', color: '#8b5cf6',
                background: 'rgba(139,92,246,0.1)', padding: '0.15rem 0.5rem',
                borderRadius: 6, border: '1px solid rgba(139,92,246,0.2)',
              }}>
                <TrendingUp size={11} />
                {Math.round(app.match_score * 100 || app.match_score)}% match
              </div>
            )}

            {/* Job Type */}
            {(app.job_type || app.job?.job_type) && (
              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                {app.job_type || app.job?.job_type}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyApplications() {
  const showToast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    api.student.getApplications()
      .then(res => setApplications(Array.isArray(res) ? res : []))
      .catch(() => showToast('Could not load applications', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter(a => (a.status || 'applied').toLowerCase() === activeTab);

  const countFor = (tab) => tab === 'all'
    ? applications.length
    : applications.filter(a => (a.status || 'applied').toLowerCase() === tab).length;

  if (loading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">

        {/* ── Header ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            <span className="gradient-text">My Applications</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Track the status of all your job applications
          </p>
        </div>

        {/* ── Summary Stats ── */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {['applied', 'shortlisted', 'hired', 'rejected'].map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = countFor(s);
            return (
              <div key={s} style={{
                flex: 1, minWidth: 110, background: 'var(--bg-surface)',
                border: `1px solid ${cfg.color}20`,
                borderRadius: 'var(--radius)', padding: '0.875rem 1rem',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: cfg.color }}>{count}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Filter Tabs ── */}
        <div style={{
          display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
          marginBottom: '1.5rem', background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '0.5rem',
        }}>
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab;
            const cfg = tab === 'all' ? null : STATUS_CONFIG[tab];
            const count = countFor(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.45rem 1rem', borderRadius: 'var(--radius)',
                  border: 'none', cursor: 'pointer', fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive
                    ? (cfg ? cfg.bg : 'rgba(99,102,241,0.15)')
                    : 'transparent',
                  color: isActive
                    ? (cfg ? cfg.color : '#6366f1')
                    : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'all 0.15s',
                  outline: isActive ? `1px solid ${cfg ? cfg.color : '#6366f1'}30` : 'none',
                }}
              >
                {tab === 'all' ? 'All' : STATUS_CONFIG[tab].label}
                <span style={{
                  background: isActive ? (cfg ? `${cfg.color}30` : 'rgba(99,102,241,0.3)') : 'rgba(255,255,255,0.06)',
                  color: isActive ? (cfg ? cfg.color : '#6366f1') : 'var(--text-muted)',
                  borderRadius: 10, padding: '0.05rem 0.45rem', fontSize: '0.72rem',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Applications List ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} color="var(--text-muted)" />
            <h3 style={{ margin: '0.75rem 0 0.25rem' }}>
              {activeTab === 'all' ? 'No Applications Yet' : `No ${STATUS_CONFIG[activeTab]?.label} Applications`}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 300, textAlign: 'center', margin: '0 auto' }}>
              {activeTab === 'all'
                ? 'Start applying to jobs to see them tracked here.'
                : `You have no applications with status "${STATUS_CONFIG[activeTab]?.label}" yet.`}
            </p>
            {activeTab !== 'all' && (
              <button className="btn btn-ghost" onClick={() => setActiveTab('all')} style={{ marginTop: '1rem' }}>
                View All Applications
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filtered.map((app, i) => (
              <ApplicationCard key={app.id || i} app={app} />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
