import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, User, FileText, Briefcase, Send, Sparkles,
  Building2, Search, LogOut, GraduationCap, ChevronRight,
} from 'lucide-react';

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/profile', icon: User, label: 'My Profile' },
  { to: '/student/resume', icon: FileText, label: 'Resume' },
  { to: '/student/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { to: '/student/applications', icon: Send, label: 'Applications' },
  { to: '/student/ai', icon: Sparkles, label: 'AI Hub' },
];

const recruiterLinks = [
  { to: '/recruiter', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/recruiter/profile', icon: Building2, label: 'Company Profile' },
  { to: '/recruiter/jobs', icon: Briefcase, label: 'My Jobs' },
  { to: '/recruiter/students', icon: Search, label: 'Talent Search' },
];

const SIDEBAR_W = 256;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'student' ? studentLinks : recruiterLinks;
  const isRecruiter = user?.role === 'recruiter';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: SIDEBAR_W,
      background: 'linear-gradient(180deg, #08102a 0%, #060d1a 100%)',
      borderRight: '1px solid rgba(99,102,241,0.1)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Top glow strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'var(--gradient-main)',
        opacity: 0.8,
      }} />

      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'var(--gradient-main)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.45)',
            flexShrink: 0,
          }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Place<span style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
            </div>
            <div style={{
              fontSize: '0.65rem', fontWeight: 600,
              color: isRecruiter ? '#a78bfa' : '#818cf8',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1px',
            }}>
              {user?.role} portal
            </div>
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Navigation
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', overflowY: 'auto' }}>
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.62rem 0.85rem', borderRadius: 10,
              fontSize: '0.855rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#fff' : 'rgba(148,163,184,0.8)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.14))'
                : 'transparent',
              border: `1px solid ${isActive ? 'rgba(99,102,241,0.35)' : 'transparent'}`,
              transition: 'all 0.2s',
              boxShadow: isActive ? '0 2px 12px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
              textDecoration: 'none',
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%', borderRadius: '0 3px 3px 0',
                    background: 'var(--gradient-main)',
                  }} />
                )}
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user card */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.7rem 0.85rem',
          borderRadius: 10,
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.1)',
          marginBottom: '0.4rem',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: isRecruiter
              ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.82rem', fontWeight: 800, color: '#fff', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.55rem 0.85rem', borderRadius: 9,
            background: 'transparent', border: '1px solid transparent',
            color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            e.currentTarget.style.color = '#fca5a5';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
