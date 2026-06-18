import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/ui/Spinner';
import { api } from '../../api/client';
import {
  FileText, Target, Brain, ChevronDown, ChevronUp,
  Cpu, CheckCircle, XCircle, Zap, BookOpen, Star,
  TrendingUp, AlertCircle, Sparkles, BarChart2,
  Award, ExternalLink
} from 'lucide-react';

/* ── Match % Ring ── */
function MatchRing({ pct = 0, size = 64 }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: size > 56 ? '0.9rem' : '0.7rem', fontWeight: 800, color,
      }}>
        {pct}%
      </div>
    </div>
  );
}

/* ── Section Card ── */
function ToolSection({ icon: Icon, title, subtitle, color, gradient, children, badge }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      background: 'var(--bg-surface)', border: `1px solid ${color}25`,
      borderRadius: 'var(--radius-xl)', overflow: 'hidden',
      marginBottom: '1.5rem',
    }}>
      {/* Gradient Header */}
      <div style={{
        background: gradient,
        padding: '1.25rem 1.5rem',
        borderBottom: open ? `1px solid ${color}20` : 'none',
        display: 'flex', alignItems: 'center', gap: '1rem',
        cursor: 'pointer', userSelect: 'none',
      }} onClick={() => setOpen(o => !o)}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius)',
          background: `${color}25`, border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={22} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>{title}</h3>
            {badge && (
              <span style={{
                background: `${color}20`, color,
                borderRadius: 20, padding: '0.15rem 0.6rem',
                fontSize: '0.7rem', fontWeight: 700,
                border: `1px solid ${color}30`,
              }}>{badge}</span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.15rem' }}>{subtitle}</p>
        </div>
        <div style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {open && (
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
export default function AIHub() {
  const showToast = useToast();

  // ── Parse Resume State ──
  const [parseLoading, setParseLoading] = useState(false);
  const [parseData, setParseData] = useState(null);
  const [parseError, setParseError] = useState('');

  // ── Job Match State ──
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [matchError, setMatchError] = useState('');

  // ── Skill Gap State ──
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const [gapData, setGapData] = useState(null);
  const [gapError, setGapError] = useState('');

  // Load jobs for skill gap dropdown
  useEffect(() => {
    setJobsLoading(true);
    api.student.browseJobs()
      .then(res => setJobs(Array.isArray(res) ? res : (res?.jobs || [])))
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  const handleParseResume = async () => {
    setParseLoading(true);
    setParseError('');
    setParseData(null);
    try {
      const res = await api.ai.parseResume();
      setParseData(res);
      showToast('Resume parsed successfully!', 'success');
    } catch (e) {
      const msg = e.message || 'Parse failed';
      setParseError(msg);
      showToast(msg, 'error');
    } finally {
      setParseLoading(false);
    }
  };

  const handleMatchJobs = async () => {
    setMatchLoading(true);
    setMatchError('');
    setMatchData(null);
    try {
      const res = await api.ai.matchJobs();
      setMatchData(Array.isArray(res) ? res : (res?.matches || res?.jobs || []));
      showToast('Job matching complete!', 'success');
    } catch (e) {
      const msg = e.message || 'Match failed';
      setMatchError(msg);
      showToast(msg, 'error');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleSkillGap = async () => {
    if (!selectedJob) { showToast('Please select a job first', 'warning'); return; }
    setGapLoading(true);
    setGapError('');
    setGapData(null);
    try {
      const res = await api.ai.skillGap(selectedJob);
      setGapData(res);
      showToast('Skill gap analysis complete!', 'success');
    } catch (e) {
      const msg = e.message || 'Analysis failed';
      setGapError(msg);
      showToast(msg, 'error');
    } finally {
      setGapLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">

        {/* ── Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(139,92,246,0.3)',
            }}>
              <Sparkles size={20} color="#8b5cf6" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              <span className="gradient-text">AI Hub</span>
            </h2>
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Beta</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Supercharge your career search with AI-powered tools
          </p>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* ── TOOL 1: Parse Resume ── */}
        {/* ═══════════════════════════════════════ */}
        <ToolSection
          icon={FileText}
          title="Parse Resume"
          subtitle="Extract skills, experience, education & certifications from your resume using AI"
          color="#6366f1"
          gradient="linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)"
          badge="Resume AI"
        >
          <button
            className="btn btn-gradient"
            onClick={handleParseResume}
            disabled={parseLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
          >
            {parseLoading ? <Spinner size={16} color="#fff" /> : <Cpu size={16} />}
            {parseLoading ? 'Parsing...' : 'Parse My Resume'}
          </button>

          {parseError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={15} /> {parseError}
            </div>
          )}

          {parseLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', justifyContent: 'center' }}>
              <Spinner size={28} />
              <span style={{ color: 'var(--text-muted)' }}>Analyzing your resume with AI...</span>
            </div>
          )}

          {parseData && !parseLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Skills */}
              {(parseData.skills || []).length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Cpu size={14} color="#8b5cf6" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Extracted Skills</span>
                    <span className="badge badge-purple">{parseData.skills.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {parseData.skills.map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {(parseData.experience || []).length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <BarChart2 size={14} color="#06b6d4" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Experience</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {parseData.experience.map((exp, i) => (
                      <div key={i} style={{
                        background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
                        borderRadius: 'var(--radius)', padding: '0.875rem 1rem',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{exp.role || exp.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{exp.company}</div>
                        {exp.duration && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{exp.duration}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {(parseData.education || []).length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <BookOpen size={14} color="#6366f1" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Education</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {parseData.education.map((e, i) => (
                      <div key={i} style={{
                        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: 'var(--radius)', padding: '0.6rem 0.875rem',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{e.degree}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{e.institution} · {e.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {(parseData.certifications || []).length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Award size={14} color="#f59e0b" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Certifications</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {parseData.certifications.map((c, i) => (
                      <span key={i} style={{
                        padding: '0.3rem 0.75rem', borderRadius: 20,
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                        color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600,
                      }}>
                        🏆 {typeof c === 'string' ? c : c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!parseData && !parseLoading && !parseError && (
            <div style={{
              textAlign: 'center', padding: '2rem',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              background: 'rgba(99,102,241,0.04)', borderRadius: 'var(--radius)',
              border: '1px dashed rgba(99,102,241,0.2)',
            }}>
              <FileText size={32} color="rgba(99,102,241,0.3)" style={{ margin: '0 auto 0.75rem' }} />
              <p>Click "Parse My Resume" to extract your profile data automatically.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>Make sure you've uploaded your resume first.</p>
            </div>
          )}
        </ToolSection>

        {/* ═══════════════════════════════════════ */}
        {/* ── TOOL 2: Job Match ── */}
        {/* ═══════════════════════════════════════ */}
        <ToolSection
          icon={Target}
          title="AI Job Match"
          subtitle="Get AI-ranked job recommendations based on your skills, experience, and desired roles"
          color="#8b5cf6"
          gradient="linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.04) 100%)"
          badge="Matching AI"
        >
          <button
            className="btn btn-primary"
            onClick={handleMatchJobs}
            disabled={matchLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              marginBottom: '1.5rem',
            }}
          >
            {matchLoading ? <Spinner size={16} color="#fff" /> : <Target size={16} />}
            {matchLoading ? 'Matching...' : 'Match Jobs for Me'}
          </button>

          {matchError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={15} /> {matchError}
            </div>
          )}

          {matchLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', justifyContent: 'center' }}>
              <Spinner size={28} color="#8b5cf6" />
              <span style={{ color: 'var(--text-muted)' }}>Finding your best job matches...</span>
            </div>
          )}

          {matchData && !matchLoading && (
            matchData.length === 0 ? (
              <div className="empty-state">
                <Target size={32} color="var(--text-muted)" />
                <p>No job matches found. Complete your profile and upload your resume first.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {matchData.map((job, i) => {
                  const companyName = job.company_name || job.company || 'Company';
                  const matchPct = Math.round((job.match_score || job.score || 0) * 100) || job.match_percentage || 0;
                  const colors2 = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
                  const clr = colors2[i % colors2.length];

                  return (
                    <div key={job.id || i} style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                      {/* Rank */}
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800,
                        color: i === 0 ? '#f59e0b' : 'var(--text-muted)',
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>

                      {/* Company Avatar */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius)',
                        background: `${clr}20`, color: clr, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', flexShrink: 0,
                      }}>
                        {companyName[0].toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{job.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{companyName}</div>
                        {job.required_skills && job.required_skills.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            {job.required_skills.slice(0, 3).map((s, si) => (
                              <span key={si} className="skill-tag" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Match Ring */}
                      <MatchRing pct={matchPct} size={58} />
                    </div>
                  );
                })}
              </div>
            )
          )}

          {!matchData && !matchLoading && !matchError && (
            <div style={{
              textAlign: 'center', padding: '2rem',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              background: 'rgba(139,92,246,0.04)', borderRadius: 'var(--radius)',
              border: '1px dashed rgba(139,92,246,0.2)',
            }}>
              <Target size={32} color="rgba(139,92,246,0.3)" style={{ margin: '0 auto 0.75rem' }} />
              <p>Click "Match Jobs for Me" to get AI-ranked job recommendations.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>Based on your skills, experience, and desired roles.</p>
            </div>
          )}
        </ToolSection>

        {/* ═══════════════════════════════════════ */}
        {/* ── TOOL 3: Skill Gap ── */}
        {/* ═══════════════════════════════════════ */}
        <ToolSection
          icon={Brain}
          title="Skill Gap Analyzer"
          subtitle="Select a target job and discover which skills you have and which ones you need to develop"
          color="#06b6d4"
          gradient="linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.04) 100%)"
          badge="Gap Analysis"
        >
          {/* Job Selector */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Select Target Job</label>
              {jobsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.75rem' }}>
                  <Spinner size={16} color="#06b6d4" /> Loading jobs...
                </div>
              ) : (
                <select
                  className="form-input"
                  value={selectedJob}
                  onChange={e => { setSelectedJob(e.target.value); setGapData(null); setGapError(''); }}
                  style={{ margin: 0 }}
                >
                  <option value="">— Choose a job to analyze —</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} {j.company_name ? `· ${j.company_name}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSkillGap}
              disabled={gapLoading || !selectedJob}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                opacity: (!selectedJob || gapLoading) ? 0.7 : 1,
              }}
            >
              {gapLoading ? <Spinner size={16} color="#fff" /> : <Zap size={16} />}
              {gapLoading ? 'Analyzing...' : 'Analyze Gap'}
            </button>
          </div>

          {gapError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={15} /> {gapError}
            </div>
          )}

          {gapLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2rem', justifyContent: 'center' }}>
              <Spinner size={28} color="#06b6d4" />
              <span style={{ color: 'var(--text-muted)' }}>Analyzing your skill gaps...</span>
            </div>
          )}

          {gapData && !gapLoading && (
            <div>
              {/* Matching vs Missing Two-Column */}
              <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>

                {/* Matching Skills */}
                <div style={{
                  background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                      Skills You Have
                    </span>
                    <span style={{
                      background: 'rgba(16,185,129,0.15)', color: '#10b981',
                      borderRadius: 10, padding: '0.1rem 0.5rem', fontSize: '0.72rem',
                      marginLeft: 'auto',
                    }}>
                      {(gapData.matching_skills || []).length}
                    </span>
                  </div>
                  {(gapData.matching_skills || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No matching skills found.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {(gapData.matching_skills || []).map((s, i) => (
                        <span key={i} style={{
                          padding: '0.25rem 0.6rem', borderRadius: 20,
                          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                          color: '#10b981', fontSize: '0.75rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                        }}>
                          <CheckCircle size={10} /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Missing Skills */}
                <div style={{
                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <XCircle size={16} color="#ef4444" />
                    <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem' }}>
                      Skills to Develop
                    </span>
                    <span style={{
                      background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                      borderRadius: 10, padding: '0.1rem 0.5rem', fontSize: '0.72rem',
                      marginLeft: 'auto',
                    }}>
                      {(gapData.missing_skills || []).length}
                    </span>
                  </div>
                  {(gapData.missing_skills || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#10b981', fontSize: '0.85rem' }}>
                      <CheckCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ fontWeight: 700 }}>You have all required skills! 🎉</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {(gapData.missing_skills || []).map((s, i) => (
                        <span key={i} style={{
                          padding: '0.25rem 0.6rem', borderRadius: 20,
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                          color: '#ef4444', fontSize: '0.75rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                        }}>
                          <XCircle size={10} /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Suggestions */}
              {(gapData.suggestions || gapData.learning_suggestions || gapData.recommendations) && (
                <div style={{
                  background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <BookOpen size={16} color="#6366f1" />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Learning Suggestions
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(gapData.suggestions || gapData.learning_suggestions || gapData.recommendations || []).map((sug, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                        fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(99,102,241,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        <span>{typeof sug === 'string' ? sug : sug.text || sug.suggestion || JSON.stringify(sug)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Score */}
              {gapData.match_percentage != null && (
                <div style={{
                  marginTop: '1.25rem', display: 'flex', alignItems: 'center',
                  gap: '1rem', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  padding: '1rem 1.25rem',
                }}>
                  <MatchRing pct={Math.round(gapData.match_percentage)} size={64} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Overall Match Score</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      You match {Math.round(gapData.match_percentage)}% of the job requirements
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!gapData && !gapLoading && !gapError && (
            <div style={{
              textAlign: 'center', padding: '2rem',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              background: 'rgba(6,182,212,0.04)', borderRadius: 'var(--radius)',
              border: '1px dashed rgba(6,182,212,0.2)',
            }}>
              <Brain size={32} color="rgba(6,182,212,0.3)" style={{ margin: '0 auto 0.75rem' }} />
              <p>Select a job and click "Analyze Gap" to see your skill compatibility.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>We'll show you what you have and what you need to develop.</p>
            </div>
          )}
        </ToolSection>

      </div>
    </DashboardLayout>
  );
}
