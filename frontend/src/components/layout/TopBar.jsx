import { useLocation } from 'react-router-dom';
import { Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const titles = {
  '/student':              { title: 'Dashboard',      subtitle: 'Welcome back 👋' },
  '/student/profile':      { title: 'My Profile',     subtitle: 'Manage your information' },
  '/student/resume':       { title: 'Resume',         subtitle: 'Upload and AI-parse your resume' },
  '/student/jobs':         { title: 'Browse Jobs',    subtitle: 'Find your dream role' },
  '/student/applications': { title: 'Applications',   subtitle: 'Track your job applications' },
  '/student/ai':           { title: 'AI Hub',         subtitle: 'AI-powered career tools' },
  '/recruiter':            { title: 'Dashboard',      subtitle: 'Manage your recruitment' },
  '/recruiter/profile':    { title: 'Company Profile',subtitle: 'Your company details' },
  '/recruiter/jobs':       { title: 'My Jobs',        subtitle: 'Manage job postings' },
  '/recruiter/students':   { title: 'Talent Search',  subtitle: 'Find the best candidates' },
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const base = Object.keys(titles).find(k => pathname === k || (k !== '/student' && k !== '/recruiter' && pathname.startsWith(k)));
  const info = titles[base] || { title: 'PlaceAI', subtitle: '' };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0,
      height: 'var(--topbar-height)',
      background: 'rgba(6,13,26,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', zIndex: 90,
    }}>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1px' }}>{info.title}</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{info.subtitle}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem',
          fontSize: '0.75rem', color: '#a5b4fc',
        }}>
          <Sparkles size={12} />
          AI-Powered
        </div>
      </div>
    </header>
  );
}
