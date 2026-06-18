import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import { useToast } from '../../components/ui/Toast';
import Spinner, { PageLoader } from '../../components/ui/Spinner';
import {
  Search, Filter, SlidersHorizontal, GraduationCap,
  MapPin, Star, Code2, Users, ChevronDown, X, Sparkles,
  ArrowUpRight, BookOpen,
} from 'lucide-react';

const SKILL_SUGGESTIONS = ['Python', 'JavaScript', 'React', 'Node.js', 'Java', 'SQL', 'Machine Learning', 'Docker', 'AWS', 'TypeScript'];

function StudentCard({ student, onClick }) {
  const skills = student.skills || [];
  const initials = student.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
  const hue = (student.full_name?.charCodeAt(0) || 60) * 7 % 360;

  return (
    <div onClick={() => onClick(student)} style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '1.25rem', cursor: 'pointer',
      transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Bg gradient spot */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, hsla(${hue},70%,60%,0.12), transparent 70%)`, pointerEvents: 'none' }} />

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 40},70%,55%))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 800, color: '#fff',
          boxShadow: `0 4px 12px hsla(${hue},70%,55%,0.35)`,
        }}>{initials}</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student.full_name || 'Unnamed Student'}
          </div>
          {student.college && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <GraduationCap size={11} />{student.college}
            </div>
          )}
        </div>
        {student.cgpa && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0.3rem 0.6rem', borderRadius: 8,
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <Star size={11} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fcd34d' }}>{student.cgpa}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        {student.degree && (
          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <BookOpen size={11} />{student.degree}{student.branch ? ` · ${student.branch}` : ''}
          </span>
        )}
        {student.graduation_year && (
          <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Class of {student.graduation_year}</span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.875rem' }}>
          {skills.slice(0, 5).map(s => (
            <span key={s} className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem' }}>{s}</span>
          ))}
          {skills.length > 5 && (
            <span className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', opacity: 0.7 }}>+{skills.length - 5}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.73rem', color: student.has_resume ? 'var(--success)' : 'var(--text-muted)' }}>
          {student.has_resume ? '✓ Resume uploaded' : 'No resume'}
        </span>
        <span style={{ fontSize: '0.73rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
          View Profile <ArrowUpRight size={12} />
        </span>
      </div>
    </div>
  );
}

export default function TalentSearch() {
  const showToast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);

  const [params, setParams] = useState({
    skills: '', min_cgpa: '', graduation_year: '', college: '', sort_by: 'cgpa',
  });

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
      const data = await api.recruiter.searchStudents(clean);
      setStudents(data || []);
    } catch (err) {
      showToast('Search failed.', 'error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams({ skills: '', min_cgpa: '', graduation_year: '', college: '', sort_by: 'cgpa' });
    setStudents([]); setSearched(false);
  };

  const activeFilters = Object.entries(params).filter(([k, v]) => v && k !== 'sort_by').length;

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '0.3rem' }}>Talent Search</h2>
          <p style={{ fontSize: '0.875rem' }}>Discover and filter students by skills, CGPA, graduation year, and more.</p>
        </div>

        {/* Search panel */}
        <div className="card animate-fade-in" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))', border: '1px solid rgba(99,102,241,0.15)' }}>
          {/* Main search row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Code2 size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                className="form-input"
                placeholder="Skills (Python, React, ML…)"
                value={params.skills}
                onChange={e => set('skills', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                style={{ paddingLeft: '2.5rem', height: 46, borderRadius: 12 }}
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
              style={{ height: 46, gap: '0.45rem', position: 'relative' }}>
              <SlidersHorizontal size={15} />
              Filters
              {activeFilters > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -5, width: 18, height: 18,
                  borderRadius: '50%', background: 'var(--error)', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{activeFilters}</span>
              )}
            </button>
            <button onClick={handleSearch} className="btn btn-gradient" style={{ height: 46, gap: '0.45rem', paddingInline: '1.5rem' }}>
              <Search size={15} /> Search
            </button>
            {(searched || activeFilters > 0) && (
              <button onClick={handleReset} className="btn btn-ghost btn-icon" style={{ height: 46 }} title="Reset">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Skill suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.875rem' }}>
            {SKILL_SUGGESTIONS.map(s => (
              <button key={s} type="button"
                onClick={() => set('skills', params.skills ? `${params.skills}, ${s}` : s)}
                style={{
                  padding: '0.2rem 0.65rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                  background: params.skills.includes(s) ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.06)',
                  border: `1px solid ${params.skills.includes(s) ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.12)'}`,
                  color: params.skills.includes(s) ? '#a5b4fc' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {s}
              </button>
            ))}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="animate-slide-down" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <div className="form-group">
                <label className="form-label">Min CGPA</label>
                <input className="form-input" type="number" min="0" max="10" step="0.1"
                  placeholder="e.g. 7.5" value={params.min_cgpa} onChange={e => set('min_cgpa', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input className="form-input" type="number" min="2020" max="2030"
                  placeholder="e.g. 2025" value={params.graduation_year} onChange={e => set('graduation_year', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">College</label>
                <input className="form-input" placeholder="Search by college…" value={params.college}
                  onChange={e => set('college', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Sort By</label>
                <select className="form-input form-select" value={params.sort_by} onChange={e => set('sort_by', e.target.value)}>
                  <option value="cgpa">CGPA (High → Low)</option>
                  <option value="name">Name (A → Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Spinner size={44} /></div>
        ) : !searched ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Search size={32} style={{ opacity: 0.3 }} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Search for candidates</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter skills above or use the suggested filters to discover students.</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <Users size={36} className="empty-icon" />
            <h3>No students found</h3>
            <p>Try different skills or relax your filters.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span className="gradient-text" style={{ fontWeight: 700 }}>{students.length}</span> student{students.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid-3 animate-fade-in">
              {students.map(s => (
                <StudentCard key={s.id} student={s} onClick={setSelected} />
              ))}
            </div>
          </>
        )}

        {/* Student detail drawer */}
        {selected && (
          <div onClick={() => setSelected(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)', zIndex: 500,
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <div onClick={e => e.stopPropagation()} className="animate-slide-in-r"
              style={{ width: 420, height: '100%', overflowY: 'auto', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem' }}>Student Profile</h3>
                <button onClick={() => setSelected(null)} className="btn btn-ghost btn-icon"><X size={18} /></button>
              </div>

              {/* Avatar */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                {(() => {
                  const hue = (selected.full_name?.charCodeAt(0) || 60) * 7 % 360;
                  const initials = selected.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
                  return (
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1rem',
                      background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 40},70%,55%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                      boxShadow: `0 6px 20px hsla(${hue},70%,55%,0.4)`,
                    }}>{initials}</div>
                  );
                })()}
                <h3>{selected.full_name || 'Unnamed'}</h3>
                {selected.college && <p style={{ fontSize: '0.855rem', marginTop: '0.25rem' }}>{selected.college}</p>}
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  ['Degree', selected.degree],
                  ['Branch', selected.branch],
                  ['CGPA', selected.cgpa],
                  ['Grad Year', selected.graduation_year],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label} style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {(selected.skills || []).length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selected.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Desired Roles */}
              {(selected.desired_roles || []).length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>Desired Roles</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selected.desired_roles.map(r => <span key={r} className="badge badge-purple">{r}</span>)}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selected.bio && (
                <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>About</div>
                  <p style={{ fontSize: '0.855rem', lineHeight: 1.7 }}>{selected.bio}</p>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', padding: '0.875rem', borderRadius: 12, background: selected.has_resume ? 'rgba(16,185,129,0.08)' : 'rgba(71,85,105,0.08)', border: `1px solid ${selected.has_resume ? 'rgba(16,185,129,0.2)' : 'rgba(71,85,105,0.2)'}`, textAlign: 'center', fontSize: '0.855rem', fontWeight: 600, color: selected.has_resume ? 'var(--success)' : 'var(--text-muted)' }}>
                {selected.has_resume ? '✓ Resume uploaded' : '✗ No resume uploaded'}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
