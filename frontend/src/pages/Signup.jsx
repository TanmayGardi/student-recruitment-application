import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  User, Mail, Lock, Eye, EyeOff, AlertCircle,
  GraduationCap, Building2, ArrowRight, Check, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const studentPerks = ['AI job matching', 'Resume parsing', 'Skill gap analysis', 'Application tracking'];
const recruiterPerks = ['Post unlimited jobs', 'AI candidate ranking', 'Talent search', 'Applicant management'];

function PasswordStrength({ password }) {
  if (!password) return null;
  const score = password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const colors = ['', '#ef4444', '#f59e0b', '#10b981'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 9999,
            background: i <= score ? colors[score] : 'var(--bg-hover)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.72rem', color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, login, googleLogin } = useAuth();

  const [role, setRole] = useState(searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const isStudent = role === 'student';
  const perks = isStudent ? studentPerks : recruiterPerks;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signup({ username, email, password, role });
      const userData = await login(email, password);
      navigate(userData?.role === 'recruiter' ? '/recruiter' : '/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setGoogleLoading(true);
    try {
      const userData = await googleLogin(credentialResponse.credential, role);
      navigate(userData?.role === 'recruiter' ? '/recruiter' : '/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex' }}>
      {/* ── Left narrow accent panel ── */}
      <div style={{
        width: 340,
        flexShrink: 0,
        background: 'linear-gradient(180deg, #060d1a 0%, #0d1526 60%, #111827 100%)',
        borderRight: '1px solid var(--border)',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blob */}
        <div style={{
          position: 'absolute', top: '20%', left: '-30%',
          width: 350, height: 350,
          background: isStudent
            ? 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 65%)',
          filter: 'blur(60px)',
          transition: 'background 0.5s',
          animation: 'float 7s ease-in-out infinite',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', textDecoration: 'none' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: isStudent ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 25px rgba(99,102,241,0.45)',
              transition: 'background 0.4s',
            }}>
              <GraduationCap size={22} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Place<span style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
            </span>
          </Link>

          {/* Role-based headline */}
          <div key={role} className="animate-fade-in">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.875rem', borderRadius: 99,
              background: isStudent ? 'rgba(99,102,241,0.12)' : 'rgba(139,92,246,0.12)',
              border: `1px solid ${isStudent ? 'rgba(99,102,241,0.25)' : 'rgba(139,92,246,0.25)'}`,
              fontSize: '0.78rem', fontWeight: 600,
              color: isStudent ? '#818cf8' : '#a78bfa',
              marginBottom: '1.25rem',
              transition: 'all 0.3s',
            }}>
              <Sparkles size={13} />
              {isStudent ? 'Student Account' : 'Recruiter Account'}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              {isStudent ? 'Launch your career' : 'Find top talent'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
              {isStudent
                ? 'Get matched to the right opportunities using AI — not just keyword search.'
                : 'Source, rank, and hire the best candidates with AI precision.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {perks.map(perk => (
                <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: isStudent ? 'rgba(99,102,241,0.15)' : 'rgba(139,92,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={12} color={isStudent ? '#818cf8' : '#a78bfa'} />
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        background: 'var(--bg-surface)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 480 }} className="animate-fade-in">

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Create your account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Already have one?{' '}
              <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          {/* Role toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-elevated)',
            borderRadius: 14, padding: 5,
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
          }}>
            {[
              { value: 'student', label: 'Student', icon: GraduationCap },
              { value: 'recruiter', label: 'Recruiter', icon: Building2 },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setRole(value); setError(''); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.7rem 1rem', borderRadius: 10,
                  fontWeight: 600, fontSize: '0.9rem',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.25s',
                  background: role === value
                    ? (value === 'student' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)')
                    : 'transparent',
                  color: role === value ? '#fff' : 'var(--text-muted)',
                  boxShadow: role === value ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.25rem', borderRadius: 12 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          {/* Google Sign-Up via GoogleLogin component (returns credential = ID token) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-up was cancelled or failed.')}
              useOneTap={false}
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="480"
              text="signup_with"
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isStudent ? 'e.g. john_doe' : 'e.g. acme_hr'}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={{ paddingLeft: '2.6rem', height: 48, borderRadius: 12 }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.6rem', height: 48, borderRadius: 12 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.6rem', paddingRight: '2.75rem', height: 48, borderRadius: 12 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '0.9rem 1.5rem', borderRadius: 12,
                background: isStudent
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer', marginTop: '0.25rem',
                boxShadow: `0 4px 20px ${isStudent ? 'rgba(99,102,241,0.4)' : 'rgba(139,92,246,0.4)'}`,
                transition: 'all 0.3s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                : null}
              {loading ? 'Creating account…' : `Create ${isStudent ? 'Student' : 'Recruiter'} Account`}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <a href="#" onClick={e => e.preventDefault()} style={{ color: '#a5b4fc' }}>Terms</a>
            {' '}and{' '}
            <a href="#" onClick={e => e.preventDefault()} style={{ color: '#a5b4fc' }}>Privacy Policy</a>.
          </p>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              ← Back to home
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="width: 340"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
