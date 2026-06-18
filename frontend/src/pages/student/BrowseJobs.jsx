import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner, { PageLoader } from '../../components/ui/Spinner';
import { api } from '../../api/client';
import {
  Search, Filter, Briefcase, MapPin, DollarSign,
  Clock, CheckCircle, ChevronDown, Building, Zap
} from 'lucide-react';

const JOB_TYPES = ['', 'full-time', 'part-time', 'internship', 'contract'];
const TYPE_LABELS = { '': 'All Types', 'full-time': 'Full-time', 'part-time': 'Part-time', 'internship': 'Internship', 'contract': 'Contract' };
const TYPE_COLORS = { 'full-time': 'badge-blue', 'part-time': 'badge-cyan', 'internship': 'badge-purple', 'contract': 'badge-yellow', '': '' };

function JobCard({ job, applied, onApply }) {
  const companyName = job.company_name || job.company || 'Company';
  const initial = companyName[0].toUpperCase();
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
  const color = colors[(companyName.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="card" style={{
      transition: 'all 0.2s ease',
      borderColor: applied ? 'rgba(16,185,129,0.3)' : 'var(--border)',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
        if (!applied) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = applied ? 'rgba(16,185,129,0.3)' : 'var(--border)';
      }}
    >
      {applied && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'rgba(16,185,129,0.15)', padding: '0.25rem 0.6rem',
          borderRadius: '0 var(--radius-lg) 0 var(--radius)',
          fontSize: '0.7rem', color: '#10b981', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.25rem',
        }}>
          <CheckCircle size={10} /> Applied
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 'var(--radius)',
          background: `${color}20`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 800, color, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {job.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Building size={12} /> {companyName}
          </div>
        </div>
      </div>

      {/* Badges Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.875rem' }}>
        {job.location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>
            <MapPin size={10} /> {job.location}
          </span>
        )}
        {job.job_type && (
          <span className={`badge ${TYPE_COLORS[job.job_type] || 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
            {TYPE_LABELS[job.job_type] || job.job_type}
          </span>
        )}
        {job.salary_range && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '0.2rem 0.5rem', borderRadius: 6, border: '1px solid rgba(16,185,129,0.15)' }}>
            <DollarSign size={10} /> {job.salary_range}
          </span>
        )}
        {job.deadline && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245,158,11,0.08)', padding: '0.2rem 0.5rem', borderRadius: 6 }}>
            <Clock size={10} /> {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Skill Tags */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {job.required_skills.slice(0, 4).map((s, i) => (
            <span key={i} className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{s}</span>
          ))}
          {job.required_skills.length > 4 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{job.required_skills.length - 4} more</span>
          )}
        </div>
      )}

      {job.description && (
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5,
          marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {job.description}
        </p>
      )}

      {/* Apply Button */}
      <button
        className={applied ? 'btn btn-sm' : 'btn btn-gradient btn-sm'}
        onClick={() => !applied && onApply(job.id)}
        disabled={applied}
        style={{
          width: '100%', justifyContent: 'center', display: 'flex',
          alignItems: 'center', gap: '0.4rem',
          background: applied ? 'rgba(16,185,129,0.1)' : undefined,
          color: applied ? '#10b981' : undefined,
          border: applied ? '1px solid rgba(16,185,129,0.3)' : undefined,
          cursor: applied ? 'default' : 'pointer',
        }}
      >
        {applied ? <><CheckCircle size={14} /> Applied</> : <><Zap size={14} /> Apply Now</>}
      </button>
    </div>
  );
}

export default function BrowseJobs() {
  const showToast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(new Set());
  const [appliedSet, setAppliedSet] = useState(new Set());
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchJobs = async (params = {}) => {
    setLoading(true);
    try {
      const clean = {};
      if (params.search) clean.search = params.search;
      if (params.job_type) clean.job_type = params.job_type;
      const res = await api.student.browseJobs(clean);
      setJobs(Array.isArray(res) ? res : (res?.jobs || []));
    } catch (e) {
      showToast('Could not load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    api.student.getApplications()
      .then(apps => {
        if (Array.isArray(apps)) setAppliedSet(new Set(apps.map(a => a.job_id || a.job?.id)));
      })
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    setSearch(searchInput);
    fetchJobs({ search: searchInput, job_type: jobType });
  };

  const handleApply = async (jobId) => {
    setApplying(prev => new Set([...prev, jobId]));
    try {
      await api.student.applyJob(jobId, {});
      setAppliedSet(prev => new Set([...prev, jobId]));
      showToast('Application submitted successfully! 🎉', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to apply', 'error');
    } finally {
      setApplying(prev => { const n = new Set(prev); n.delete(jobId); return n; });
    }
  };

  const filteredJobs = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || (j.title || '').toLowerCase().includes(q) ||
      (j.company_name || j.company || '').toLowerCase().includes(q);
    const matchType = !jobType || j.job_type === jobType;
    return matchSearch && matchType;
  });

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">

        {/* ── Header ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            <span className="gradient-text">Browse Jobs</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Discover and apply to opportunities that match your profile
          </p>
        </div>

        {/* ── Search + Filters ── */}
        <div style={{
          display: 'flex', gap: '0.75rem', marginBottom: '2rem',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '1rem', flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '2.25rem', margin: 0 }}
              placeholder="Search by title, company..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div style={{ position: 'relative', minWidth: 160 }}>
            <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <ChevronDown size={13} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <select
              className="form-input"
              style={{ paddingLeft: '2.25rem', paddingRight: '2rem', margin: 0, appearance: 'none', cursor: 'pointer' }}
              value={jobType}
              onChange={e => setJobType(e.target.value)}
            >
              {JOB_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-gradient" onClick={handleSearch}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
            <Search size={15} /> Search
          </button>
        </div>

        {/* ── Job Count ── */}
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
            </span>
            {search && (
              <span style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 20, padding: '0.15rem 0.6rem',
                fontSize: '0.75rem', color: '#6366f1',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                "{search}"
                <button onClick={() => { setSearchInput(''); setSearch(''); fetchJobs({ job_type: jobType }); }}
                  style={{ color: '#6366f1', display: 'flex' }}>
                  <Filter size={11} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── Jobs Grid ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Spinner size={40} />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <Briefcase size={48} color="var(--text-muted)" />
            <h3 style={{ margin: '0.75rem 0 0.25rem' }}>No Jobs Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 300, textAlign: 'center', margin: '0 auto' }}>
              {search || jobType ? 'Try adjusting your filters or search terms.' : 'No jobs available at this time. Check back later!'}
            </p>
            {(search || jobType) && (
              <button className="btn btn-ghost" onClick={() => { setSearchInput(''); setSearch(''); setJobType(''); fetchJobs(); }}
                style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid-2" style={{ gap: '1rem' }}>
            {filteredJobs.map((job, i) => (
              <JobCard
                key={job.id || i}
                job={job}
                applied={appliedSet.has(job.id) || applying.has(job.id)}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
