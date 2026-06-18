import { MapPin, Clock, DollarSign, Tag, Building2, Users } from 'lucide-react';

export default function JobCard({ job, onApply, onView, applied = false, showApply = false }) {
  const skills = job.required_skills || [];

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onView}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{job.title}</h3>
          {job.company_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Building2 size={13} />{job.company_name}
            </div>
          )}
        </div>
        <span className={`badge ${job.job_type === 'Internship' ? 'badge-cyan' : job.job_type === 'Part-time' ? 'badge-purple' : 'badge-blue'}`}>
          {job.job_type}
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {skills.slice(0, 5).map(s => (
          <span key={s} className="skill-tag" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>{s}</span>
        ))}
        {skills.length > 5 && <span className="skill-tag" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>+{skills.length - 5}</span>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{job.location}</span>}
        {job.salary_range && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={12} />{job.salary_range}</span>}
        {job.application_count !== undefined && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={12} />{job.application_count} applicants</span>}
      </div>

      {showApply && (
        <button
          className={`btn w-full ${applied ? 'btn-ghost' : 'btn-primary'}`}
          onClick={e => { e.stopPropagation(); if (!applied && onApply) onApply(job); }}
          disabled={applied}
        >
          {applied ? 'Already Applied ✓' : 'Apply Now'}
        </button>
      )}
    </div>
  );
}
