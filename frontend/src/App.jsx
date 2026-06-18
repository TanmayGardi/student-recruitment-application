import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import './styles/global.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentResume from './pages/student/StudentResume';
import BrowseJobs from './pages/student/BrowseJobs';
import MyApplications from './pages/student/MyApplications';
import AIHub from './pages/student/AIHub';

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import MyJobs from './pages/recruiter/MyJobs';
import JobDetail from './pages/recruiter/JobDetail';
import TalentSearch from './pages/recruiter/TalentSearch';

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();

  // Still resolving token → show fullscreen spinner, never redirect prematurely
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--bg-base)' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid rgba(99,102,241,0.2)',
        borderTopColor: 'var(--accent-1)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading PlaceAI...</p>
    </div>
  );

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → send to their correct portal
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/student'} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  // Don't render redirect routes until we know if the user is logged in
  const authRedirect = (path) => {
    if (loading) return null; // render nothing while resolving
    if (!user) return null;   // not logged in, show the page normally
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/student'} replace />;
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={authRedirect('/login') || <Login />} />
      <Route path="/signup" element={authRedirect('/signup') || <Signup />} />

      {/* Student portal */}
      <Route path="/student" element={<RequireAuth role="student"><StudentDashboard /></RequireAuth>} />
      <Route path="/student/profile" element={<RequireAuth role="student"><StudentProfile /></RequireAuth>} />
      <Route path="/student/resume" element={<RequireAuth role="student"><StudentResume /></RequireAuth>} />
      <Route path="/student/jobs" element={<RequireAuth role="student"><BrowseJobs /></RequireAuth>} />
      <Route path="/student/applications" element={<RequireAuth role="student"><MyApplications /></RequireAuth>} />
      <Route path="/student/ai" element={<RequireAuth role="student"><AIHub /></RequireAuth>} />

      {/* Recruiter portal */}
      <Route path="/recruiter" element={<RequireAuth role="recruiter"><RecruiterDashboard /></RequireAuth>} />
      <Route path="/recruiter/profile" element={<RequireAuth role="recruiter"><RecruiterProfile /></RequireAuth>} />
      <Route path="/recruiter/jobs" element={<RequireAuth role="recruiter"><MyJobs /></RequireAuth>} />
      <Route path="/recruiter/jobs/:id" element={<RequireAuth role="recruiter"><JobDetail /></RequireAuth>} />
      <Route path="/recruiter/students" element={<RequireAuth role="recruiter"><TalentSearch /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
