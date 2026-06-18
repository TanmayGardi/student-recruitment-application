import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { api } from '../../api/client';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft, Sparkles, Star, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['applied', 'shortlisted', 'rejected', 'hired'];

const STATUS_STYLES = {
  applied: { background: '#dbeafe', color: '#1d4ed8' },
  shortlisted: { background: '#fef9c3', color: '#854d0e' },
  rejected: { background: '#fee2e2', color: '#dc2626' },
  hired: { background: '#dcfce7', color: '#16a34a' },
};

/* ── Score Progress Bar ─────────────────────────────────────────────────── */
function ScoreBar({ score }) {
  if (score === null || score === undefined) {
    return <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>;
  }

  const pct = Math.min(Math.max(score, 0), 100);
  const color =
    pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '120px' }}>
      <div
        style={{
          flex: 1,
          height: '7px',
          background: 'var(--border)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: '99px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', color, minWidth: '30px', textAlign: 'right' }}>
        {Math.round(pct)}
      </span>
    </div>
  );
}

/* ── Status Dropdown ────────────────────────────────────────────────────── */
function StatusDropdown({ appId, jobId, current, onChange }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const showToast = useToast();

  const select = async (status) => {
    setOpen(false);
    if (status === current) return;
    setUpdating(true);
    try {
      await api.jobs.updateStatus(jobId, appId, status);
      onChange(appId, status);
      showToast(`Status updated to "${status}".`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const style = STATUS_STYLES[current] || {};

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        disabled={updating}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '4px 10px',
          borderRadius: '99px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.78rem',
          ...style,
        }}
      >
        {updating ? <Spinner size={12} /> : null}
        {current}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 100,
              background: 'var(--surface, #fff)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              minWidth: '130px',
            }}
          >
            {STATUS_OPTIONS.map((s) => {
              const st = STATUS_STYLES[s] || {};
              return (
                <button
                  key={s}
                  onClick={(e) => { e.stopPropagation(); select(s); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.55rem 1rem',
                    border: 'none',
                    background: s === current ? 'var(--surface-hover, #f9f9f9)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: s === current ? 700 : 500,
                    fontSize: '0.83rem',
                    color: 'var(--text)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover, #f5f5f5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = s === current ? 'var(--surface-hover, #f9f9f9)' : 'transparent')}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: st.color || '#94a3b8',
                      flexShrink: 0,
                    }}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function JobDetail() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [ranked, setRanked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingPage(true);
      try {
        const [jobData, apps] = await Promise.all([
          api.jobs.getById(jobId),
          api.jobs.getApplicants(jobId),
        ]);
        setJob(jobData);
        setApplicants(apps || []);
      } catch {
        showToast('Failed to load job details.', 'error');
      } finally {
        setLoadingPage(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleRankCandidates = async () => {
    setRankingLoading(true);
    try {
      const ranked = await api.ai.rankCandidates(jobId);
      // Merge scores back into applicants
      setApplicants((prev) =>
        prev.map((app) => {
          const match = ranked.find((r) => r.applicant_id === app.id || r.id === app.id);
          return match ? { ...app, ai_score: match.score ?? match.ai_score } : app;
        })
      );
      // Sort by ai_score descending
      setApplicants((prev) =>
        [...prev].sort((a, b) => (b.ai_score ?? -1) - (a.ai_score ?? -1))
      );
      setRanked(true);
      showToast('Candidates ranked by AI!', 'success');
    } catch {
      showToast('AI ranking failed. Please try again.', 'error');
    } finally {
      setRankingLoading(false);
    }
  };

  const handleStatusChange = (appId, newStatus) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  if (loadingPage) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Spinner size={44} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/recruiter/jobs')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem' }}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div>
              <h1 className="heading-lg" style={{ marginBottom: '0.2rem' }}>
                {job?.title || 'Job Detail'}
              </h1>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
                {job?.location ? ` · ${job.location}` : ''}
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRankCandidates}
            disabled={rankingLoading || applicants.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '185px',
              justifyContent: 'center',
              background: ranked
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : undefined,
            }}
          >
            {rankingLoading ? (
              <Spinner size={18} color="#fff" />
            ) : ranked ? (
              <Star size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            {rankingLoading ? 'Ranking…' : ranked ? 'Re-rank with AI' : 'AI Rank Candidates'}
          </button>
        </div>

        {/* AI Ranking Banner */}
        {rankingLoading && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={20} color="#6366f1" />
            <p style={{ fontWeight: 600, color: '#6366f1' }}>
              AI is analysing and ranking candidates… this may take a moment.
            </p>
          </div>
        )}

        {/* Table */}
        {applicants.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              border: '2px dashed var(--border)',
              borderRadius: '16px',
            }}
          >
            <Star size={44} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No applicants yet</p>
            <p className="text-muted" style={{ fontSize: '0.88rem' }}>
              Applicants will appear here once students apply to this job.
            </p>
          </div>
        ) : (
          <div
            className="card"
            style={{ overflowX: 'auto', padding: 0 }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-hover, #f9fafb)' }}>
                  {['Name', 'College', 'CGPA', 'Skills', ranked ? 'AI Score' : '', 'Status', 'Cover Note'].filter(Boolean).map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h === 'AI Score' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" /> AI Score
                        </span>
                      ) : (
                        h
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applicants.map((app, idx) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: idx < applicants.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover, #fafafa)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Name */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600 }}>{app.student_name || app.full_name || '—'}</div>
                      {app.email && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.email}</div>
                      )}
                    </td>

                    {/* College */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {app.college || '—'}
                    </td>

                    {/* CGPA */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      {app.cgpa != null ? (
                        <span
                          style={{
                            fontWeight: 700,
                            color: app.cgpa >= 8 ? '#16a34a' : app.cgpa >= 6 ? '#d97706' : '#dc2626',
                          }}
                        >
                          {app.cgpa.toFixed(2)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Skills */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '200px' }}>
                        {app.skills && app.skills.length > 0 ? (
                          app.skills.slice(0, 4).map((s, i) => (
                            <span
                              key={i}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '99px',
                                background: 'var(--primary-light, #ede9fe)',
                                color: '#6366f1',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                        )}
                        {app.skills && app.skills.length > 4 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            +{app.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* AI Score (only when ranked) */}
                    {ranked && (
                      <td style={{ padding: '0.85rem 1rem', minWidth: '150px' }}>
                        <ScoreBar score={app.ai_score} />
                      </td>
                    )}

                    {/* Status */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <StatusDropdown
                        appId={app.id}
                        jobId={jobId}
                        current={app.status || 'applied'}
                        onChange={handleStatusChange}
                      />
                    </td>

                    {/* Cover Note */}
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        maxWidth: '220px',
                        color: 'var(--text-muted)',
                        fontSize: '0.82rem',
                      }}
                    >
                      {app.cover_note ? (
                        <span
                          title={app.cover_note}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {app.cover_note}
                        </span>
                      ) : (
                        <span style={{ fontStyle: 'italic' }}>No note</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
