import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/ui/Toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner, { PageLoader } from '../../components/ui/Spinner';
import { api } from '../../api/client';
import {
  Upload, FileText, CheckCircle, AlertCircle, X,
  Clock, Briefcase, BookOpen, Award, Cpu, Calendar,
  CloudUpload, RefreshCw, Trash2, ChevronRight
} from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function StudentResume() {
  const showToast = useToast();
  const fileRef = useRef();
  const dropRef = useRef();

  const [resumeInfo, setResumeInfo] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);

  useEffect(() => {
    api.student.getResume()
      .then(r => {
        setResumeInfo(r);
        if (r?.parsed_data) setParsedData(r.parsed_data);
      })
      .catch(() => {})
      .finally(() => setLoadingResume(false));
  }, []);

  // Drag & Drop
  useEffect(() => {
    const zone = dropRef.current;
    if (!zone) return;
    const prevent = e => e.preventDefault();
    const enter = () => setDragging(true);
    const leave = () => setDragging(false);
    const drop = e => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    };
    zone.addEventListener('dragover', prevent);
    zone.addEventListener('dragenter', enter);
    zone.addEventListener('dragleave', leave);
    zone.addEventListener('drop', drop);
    return () => {
      zone.removeEventListener('dragover', prevent);
      zone.removeEventListener('dragenter', enter);
      zone.removeEventListener('dragleave', leave);
      zone.removeEventListener('drop', drop);
    };
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    const valid = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!valid.includes(file.type)) {
      showToast('Please upload PDF or DOC/DOCX files only', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const res = await api.student.uploadResume(selectedFile);
      setResumeInfo(res);
      setSelectedFile(null);
      showToast('Resume uploaded successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async () => {
    setParsing(true);
    try {
      const res = await api.ai.parseResume();
      setParsedData(res);
      showToast('Resume parsed successfully!', 'success');
    } catch (e) {
      showToast(e.message || 'Parse failed', 'error');
    } finally {
      setParsing(false);
    }
  };

  if (loadingResume) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const skills = parsedData?.skills || [];
  const experience = parsedData?.experience || [];
  const education = parsedData?.education || [];
  const certifications = parsedData?.certifications || [];

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            <span className="gradient-text">Resume Manager</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Upload your resume and let AI extract your skills & experience
          </p>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: Upload Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Drop Zone */}
            <div
              ref={dropRef}
              onClick={() => !selectedFile && fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#6366f1' : selectedFile ? '#10b981' : 'rgba(99,102,241,0.3)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging
                  ? 'rgba(99,102,241,0.08)'
                  : selectedFile
                    ? 'rgba(16,185,129,0.05)'
                    : 'var(--bg-surface)',
                transition: 'all 0.25s ease',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <input
                ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files?.[0])}
              />

              {!selectedFile ? (
                <>
                  <div style={{
                    width: 70, height: 70, borderRadius: '50%',
                    background: dragging ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    transition: 'all 0.25s',
                    boxShadow: dragging ? '0 0 30px rgba(99,102,241,0.4)' : 'none',
                  }}>
                    <CloudUpload size={32} color={dragging ? '#6366f1' : 'var(--text-muted)'} />
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                    {dragging ? 'Drop it here!' : 'Drop your resume here'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    or click to browse your files
                  </p>
                  <div style={{
                    display: 'flex', gap: '0.5rem', justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}>
                    {['PDF', 'DOC', 'DOCX'].map(ext => (
                      <span key={ext} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{ext}</span>
                    ))}
                    <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Max 5MB</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: 70, height: 70, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 0 20px rgba(16,185,129,0.2)',
                  }}>
                    <FileText size={30} color="#10b981" />
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#10b981' }}>
                    {selectedFile.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    {formatBytes(selectedFile.size)}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                      className="btn btn-gradient"
                      onClick={e => { e.stopPropagation(); handleUpload(); }}
                      disabled={uploading}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      {uploading ? <Spinner size={16} color="#fff" /> : <Upload size={16} />}
                      {uploading ? 'Uploading...' : 'Upload Now'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Resume Info Card */}
            {resumeInfo && !selectedFile && (
              <div className="card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius)',
                    background: 'rgba(16,185,129,0.1)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FileText size={22} color="#10b981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                      {resumeInfo.filename || resumeInfo.file_name || 'resume.pdf'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <Clock size={12} />
                      Uploaded {formatDate(resumeInfo.uploaded_at || resumeInfo.created_at)}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      {resumeInfo.is_parsed || parsedData ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontSize: '0.78rem' }}>
                          <CheckCircle size={12} /> Parsed
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontSize: '0.78rem' }}>
                          <AlertCircle size={12} /> Not parsed yet
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => fileRef.current?.click()}
                      className="btn btn-sm btn-ghost" title="Replace"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RefreshCw size={13} /> Replace
                    </button>
                  </div>
                </div>

                {/* Parse Button */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleParse} disabled={parsing}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    {parsing ? <Spinner size={16} color="#fff" /> : <Cpu size={16} />}
                    {parsing ? 'Parsing with AI...' : 'Parse Resume with AI'}
                  </button>
                </div>
              </div>
            )}

            {!resumeInfo && !selectedFile && (
              <div className="empty-state">
                <Upload size={36} color="var(--text-muted)" />
                <p style={{ color: 'var(--text-muted)' }}>No resume uploaded yet</p>
              </div>
            )}
          </div>

          {/* Right: Parsed Data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!parsedData ? (
              <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Cpu size={30} color="#6366f1" />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No Parsed Data</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Upload your resume and click "Parse Resume with AI" to extract skills, experience, education and certifications automatically.
                </p>
              </div>
            ) : (
              <>
                {/* Skills */}
                {skills.length > 0 && (
                  <div className="card-glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 'var(--radius)', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cpu size={15} color="#8b5cf6" />
                      </div>
                      <h4 style={{ fontWeight: 700 }}>Extracted Skills</h4>
                      <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{skills.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {skills.map((s, i) => (
                        <span key={i} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                  <div className="card-glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 'var(--radius)', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={15} color="#06b6d4" />
                      </div>
                      <h4 style={{ fontWeight: 700 }}>Experience</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {experience.map((exp, i) => (
                        <div key={i} style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                          <div style={{
                            position: 'absolute', left: 0, top: '6px', bottom: i < experience.length - 1 ? '-1rem' : '6px',
                            width: 2, background: i < experience.length - 1
                              ? 'linear-gradient(to bottom, #06b6d4, transparent)'
                              : '#06b6d4',
                          }} />
                          <div style={{
                            position: 'absolute', left: -3, top: 6, width: 8, height: 8,
                            borderRadius: '50%', background: '#06b6d4',
                            boxShadow: '0 0 6px rgba(6,182,212,0.6)',
                          }} />
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{exp.role || exp.title}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{exp.company}</div>
                          {(exp.start_date || exp.duration) && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                              <Calendar size={11} /> {exp.start_date} {exp.end_date ? `— ${exp.end_date}` : ''}{exp.duration ? exp.duration : ''}
                            </div>
                          )}
                          {exp.description && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem', lineHeight: 1.5 }}>{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div className="card-glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 'var(--radius)', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={15} color="#6366f1" />
                      </div>
                      <h4 style={{ fontWeight: 700 }}>Education</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {education.map((edu, i) => (
                        <div key={i} style={{
                          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                          borderRadius: 'var(--radius)', padding: '0.75rem 1rem',
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{edu.degree || edu.institution}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{edu.institution || edu.college}</div>
                          {edu.year && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                              {edu.year} {edu.score ? `· ${edu.score}` : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className="card-glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 'var(--radius)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={15} color="#f59e0b" />
                      </div>
                      <h4 style={{ fontWeight: 700 }}>Certifications</h4>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {certifications.map((c, i) => (
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
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
