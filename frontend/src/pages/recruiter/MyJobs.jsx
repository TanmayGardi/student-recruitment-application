import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import {
  Plus, Edit2, Trash2, Users, ToggleLeft, ToggleRight,
  MapPin, DollarSign, X, Briefcase, Calendar, Clock,
  ChevronRight, Search,
} from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

const emptyForm = {
  title: '', description: '', location: '',
  job_type: 'Full-time', salary_range: '', experience_required: '',
  required_skills: [], preferred_roles: [], deadline: '',
};

function TagInput({ label, tags, onChange, placeholder = 'Type and press Enter' }) {
  const [input, setInput] = useState('');
  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
        padding: '0.55rem 0.75rem', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', minHeight: 46, alignItems: 'center',
        background: 'var(--bg-elevated)', transition: 'border-color 0.2s',
      }}
        onFocus={() => { }} onBlur={() => { }}
        onClick={() => document.getElementById(`tag-input-${label}`)?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '2px 10px', borderRadius: 99,
            background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
            fontSize: '0.77rem', fontWeight: 600,
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', display: 'flex', padding: 0, lineHeight: 1 }}>
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          id={`tag-input-${label}`}
          type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{ border: 'none', outline: 'none', flex: 1, minWidth: 120, fontSize: '0.855rem', background: 'transparent', color: 'var(--text-primary)' }}
        />
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Press Enter or comma to add</p>
    </div>
  );
}

function JobForm({ form, onChange }) {
  const set = (e) => onChange({ ...form, [e.target.name]: e.target.value });
  const setTags = (field, tags) => onChange({ ...form, [field]: tags });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div className="form-group">
        <label className="form-label">Job Title <span style={{ color: 'var(--error)' }}>*</span></label>
        <input className="form-input" name="title" value={form.title} onChange={set} placeholder="e.g. Senior Backend Engineer" required />
      </div>
      <div className="form-group">
        <label className="form-label">Description <span style={{ color: 'var(--error)' }}>*</span></label>
        <textarea className="form-input form-textarea" name="description" value={form.description} onChange={set}
          placeholder="Describe the role, responsibilities, and what you're looking for…" rows={4} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" name="location" value={form.location} onChange={set} placeholder="e.g. Bangalore / Remote" />
        </div>
        <div className="form-group">
          <label className="form-label">Job Type</label>
          <select className="form-input form-select" name="job_type" value={form.job_type} onChange={set}>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Salary Range</label>
          <input className="form-input" name="salary_range" value={form.salary_range} onChange={set} placeholder="e.g. ₹6–10 LPA" />
        </div>
        <div className="form-group">
          <label className="form-label">Experience Required</label>
          <input className="form-input" name="experience_required" value={form.experience_required} onChange={set} placeholder="e.g. 0–2 years" />
        </div>
      </div>
      <TagInput label="Required Skills" tags={form.required_skills} onChange={t => setTags('required_skills', t)} placeholder="Python, React, SQL…" />
      <TagInput label="Preferred Roles / Backgrounds" tags={form.preferred_roles} onChange={t => setTags('preferred_roles', t)} placeholder="Backend Developer, Data Engineer…" />
      <div className="form-group">
        <label className="form-label">Application Deadline</label>
        <input className="form-input" name="deadline" type="date" value={form.deadline} onChange={set} />
      </div>
    </div>
  );
}

const TYPE_COLOR = { 'Full-time': 'badge-blue', 'Internship': 'badge-cyan', 'Part-time': 'badge-purple', 'Contract': 'badge-yellow', 'Remote': 'badge-green' };

function JobCard({ job, onToggle, onDelete, onNavigate }) {
  return (
    <div onClick={() => onNavigate(job.id)} style={{
      display: 'flex', alignItems: 'center', gap: '1.1rem',
      padding: '1.1rem 1.25rem', borderRadius: 14,
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      cursor: 'pointer', transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Avatar */}
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', fontWeight: 800, color: '#818cf8',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
        {job.title[0]}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.title}</h4>
          <span className={`badge ${TYPE_COLOR[job.job_type] || 'badge-blue'}`}>{job.job_type}</span>
          <span className={`badge ${job.is_active ? 'badge-green' : 'badge-gray'}`}>{job.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.77rem', color: 'var(--text-muted)' }}>
          {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={11} />{job.location}</span>}
          {job.salary_range && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><DollarSign size={11} />{job.salary_range}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={11} />{job.application_count || 0} applicant{job.application_count !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button title={job.is_active ? 'Deactivate' : 'Activate'} onClick={() => onToggle(job)}
          className="btn btn-ghost btn-icon" style={{ padding: '0.45rem' }}>
          {job.is_active ? <ToggleRight size={22} color="#22c55e" /> : <ToggleLeft size={22} color="#94a3b8" />}
        </button>
        <button title="Delete job" onClick={() => onDelete(job)}
          className="btn btn-ghost btn-icon" style={{ padding: '0.45rem', color: 'var(--error)' }}>
          <Trash2 size={16} />
        </button>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  );
}

export default function MyJobs() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.jobs.myListings();
      setJobs(data || []);
    } catch {
      showToast('Failed to load jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Title and description are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.jobs.create({ ...formData, deadline: formData.deadline || undefined });
      showToast('Job posted successfully! 🎉', 'success');
      setModalOpen(false);
      setFormData(emptyForm);
      fetchJobs();
    } catch (err) {
      showToast(err?.message || 'Failed to post job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (job) => {
    try {
      await api.jobs.update(job.id, { is_active: !job.is_active });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
      showToast(`Job ${!job.is_active ? 'activated' : 'deactivated'}.`, 'success');
    } catch { showToast('Failed to update.', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.jobs.delete(confirmDelete.id);
      setJobs(prev => prev.filter(j => j.id !== confirmDelete.id));
      showToast('Job deleted.', 'success');
    } catch { showToast('Failed to delete.', 'error'); }
    finally { setConfirmDelete(null); }
  };

  const filtered = jobs
    .filter(j => filter === 'all' ? true : filter === 'active' ? j.is_active : !j.is_active)
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase()));

  const activeCount = jobs.filter(j => j.is_active).length;
  const totalApps = jobs.reduce((acc, j) => acc + (j.application_count || 0), 0);

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>My Job Postings</h2>
            <p style={{ fontSize: '0.875rem' }}>
              {activeCount} active · {jobs.length} total · {totalApps} applicants
            </p>
          </div>
          <button className="btn btn-gradient" onClick={() => { setFormData(emptyForm); setModalOpen(true); }}
            style={{ gap: '0.45rem' }}>
            <Plus size={17} /> Post New Job
          </button>
        </div>

        {/* Search + filter bar */}
        {jobs.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input className="form-input" placeholder="Search jobs…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem', height: 40, borderRadius: 10 }} />
            </div>
            <div className="tab-bar" style={{ flexShrink: 0 }}>
              {[{ v: 'all', l: 'All' }, { v: 'active', l: 'Active' }, { v: 'inactive', l: 'Inactive' }].map(({ v, l }) => (
                <button key={v} className={`tab-item ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Spinner size={44} /></div>
        ) : jobs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            border: '2px dashed rgba(99,102,241,0.2)', borderRadius: 20,
            background: 'rgba(99,102,241,0.03)',
          }}>
            <Briefcase size={52} style={{ opacity: 0.15, margin: '0 auto 1.25rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No jobs posted yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>Create your first listing to start receiving applications.</p>
            <button className="btn btn-gradient" onClick={() => setModalOpen(true)} style={{ gap: '0.45rem' }}>
              <Plus size={17} /> Post First Job
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={36} className="empty-icon" />
            <h3>No results found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="animate-fade-in">
            {filtered.map(job => (
              <JobCard key={job.id} job={job}
                onToggle={handleToggle}
                onDelete={j => setConfirmDelete(j)}
                onNavigate={id => navigate(`/recruiter/jobs/${id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post New Job" width="640px">
        <form onSubmit={handlePostJob}>
          <JobForm form={formData} onChange={setFormData} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-gradient" disabled={saving}
              style={{ minWidth: 130, gap: '0.4rem' }}>
              {saving ? <Spinner size={15} color="#fff" /> : <Plus size={15} />}
              {saving ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div onClick={e => e.stopPropagation()} className="card animate-scale-in"
            style={{ maxWidth: 380, width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Trash2 size={24} color="var(--error)" />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Delete Job?</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              "<strong>{confirmDelete.title}</strong>" and all its applications will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Job</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
