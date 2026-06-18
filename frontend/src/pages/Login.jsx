import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle,
  GraduationCap, Zap, Shield, Sparkles, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── tiny Google icon SVG ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const features = [
  { icon: Zap, text: 'AI-powered job matching' },
  { icon: Shield, text: 'Role-based secure access' },
  { icon: Sparkles, text: 'Smart resume parsing' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      navigate(userData?.role === 'recruiter' ? '/recruiter' : '/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setGoogleLoading(true);
    try {
      // credentialResponse.credential is the Google ID token (JWT) the backend verifies
      const userData = await googleLogin(credentialResponse.credential, 'student');
      navigate(userData?.role === 'recruiter' ? '/recruiter' : '/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-base)',
    }}>
      {/* ── Left panel — branding ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        background: 'linear-gradient(135deg, #060d1a 0%, #0d1526 40%, #111827 100%)',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', right: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />

        {/* Grid lines decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '3rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--gradient-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(99,102,241,0.5)',
            }}>
              <GraduationCap size={26} color="#fff" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Place<span style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
            Your career,<br />
            <span style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              supercharged by AI
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 400 }}>
            The intelligent placement platform that matches students to opportunities and helps recruiters find exceptional talent.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={17} color="#818cf8" />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Decorative card */}
          <div style={{
            marginTop: '3rem',
            padding: '1.25rem 1.5rem',
            borderRadius: 16,
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--gradient-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>A</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.15rem' }}>Trusted by 10,000+ students</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Across 500+ campuses nationwide</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        background: 'var(--bg-surface)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in">

          {/* Header */}
          <div style={{ marginBottom: '2.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sign in to continue to your portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.5rem', borderRadius: 12 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <div style={{ marginBottom: '1.5rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in was cancelled or failed.')}
              useOneTap={false}
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="400"
              text="signin_with"
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.6rem', paddingRight: '2.75rem', height: 48, borderRadius: 12 }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '0.9rem 1.5rem', borderRadius: 12,
                background: 'var(--gradient-main)', color: '#fff',
                fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer', marginTop: '0.25rem',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              ) : null}
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#a5b4fc', fontWeight: 700, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              ← Back to home
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
          div[style*="overflow: hidden"][style*="flexDirection: column"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
