import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  Brain,
  Search,
  FileText,
  Star,
  Users,
  Zap,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#060d1a', overflowX: 'hidden', position: 'relative' }}>

      {/* ── Animated Background Blobs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div
          className="animate-blob"
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="animate-blob"
          style={{
            position: 'absolute',
            top: '20%',
            right: '-8%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '2s',
          }}
        />
        <div
          className="animate-blob"
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '30%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '4s',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Navigation Bar ── */}
      <nav
        className="card-glass"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 2rem',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}
          >
            <Brain size={20} color="#fff" />
          </div>
          <span
            className="gradient-text"
            style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}
          >
            PlaceAI
          </span>
        </div>

        {/* Nav Links + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a
            href="#features"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.target.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.target.style.color = 'var(--text-secondary)')}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.target.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.target.style.color = 'var(--text-secondary)')}
          >
            How it works
          </a>
          <Link to="/login">
            <button className="btn btn-ghost btn-sm">Login</button>
          </Link>
          <button
            className="btn btn-gradient btn-sm"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 2rem 80px',
        }}
      >
        {/* Announcement chip */}
        <div
          className="animate-fade-in"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '9999px',
            padding: '0.35rem 1rem',
            marginBottom: '2rem',
            fontSize: '0.8rem',
            color: '#a5b4fc',
            fontWeight: 500,
          }}
        >
          <Sparkles size={14} />
          AI-Powered Placement Platform — Now Live
          <ArrowRight size={13} />
        </div>

        {/* Main Heading */}
        <h1
          className="animate-fade-in stagger-1"
          style={{ maxWidth: '820px', marginBottom: '1rem' }}
        >
          Land Your Dream Job with{' '}
          <span className="gradient-text" style={{ display: 'block' }}>
            PlaceAI
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="animate-fade-in stagger-2"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}
        >
          Intelligent resume analysis, smart job matching, and real-time recruiter connections — all powered by cutting-edge AI.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in stagger-3"
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button
            className="btn btn-gradient btn-lg"
            onClick={() => navigate('/signup')}
            style={{ fontSize: '1rem', gap: '0.6rem' }}
          >
            <GraduationCap size={20} />
            Get Started as Student
            <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => navigate('/signup?role=recruiter')}
            style={{
              fontSize: '1rem',
              gap: '0.6rem',
              border: '1px solid rgba(99,102,241,0.35)',
              color: 'var(--text-primary)',
            }}
          >
            <Briefcase size={20} />
            Join as Recruiter
          </button>
        </div>

        {/* Trust badges */}
        <div
          className="animate-fade-in stagger-4"
          style={{
            display: 'flex',
            gap: '2rem',
            marginTop: '3.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {[
            { icon: <Users size={16} />, label: '12K+ Students' },
            { icon: <Briefcase size={16} />, label: '800+ Recruiters' },
            { icon: <Star size={16} />, label: '94% Placement Rate' },
            { icon: <Zap size={16} />, label: 'AI-Matched in Seconds' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 500,
              }}
            >
              <span style={{ color: '#818cf8' }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Floating decorative card preview */}
        <div
          className="animate-float"
          style={{
            marginTop: '5rem',
            position: 'relative',
            width: '100%',
            maxWidth: '760px',
          }}
        >
          <div
            className="card card-glass"
            style={{
              borderRadius: '20px',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: '0 8px 60px rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.2)',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                minWidth: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
              }}
            >
              <Brain size={26} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                AI Resume Analysis Complete
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Your profile matches <span style={{ color: '#a78bfa', fontWeight: 600 }}>87%</span> of Frontend Engineer roles — 24 new matches found!
              </div>
            </div>
            <div
              style={{
                padding: '0.4rem 0.9rem',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                color: '#a5b4fc',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              View Matches →
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section
        id="features"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '80px 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section label */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '9999px',
              padding: '0.3rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.78rem',
              color: '#c4b5fd',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <Sparkles size={13} /> Everything you need
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>
            Built for every side of{' '}
            <span className="gradient-text">the hiring journey</span>
          </h2>
          <p style={{ maxWidth: '500px', margin: '0 auto', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            From resume upload to offer letter — PlaceAI handles the entire recruitment lifecycle intelligently.
          </p>
        </div>

        {/* 3-column feature cards */}
        <div className="grid-3" style={{ gap: '1.5rem' }}>

          {/* Card 1: For Students */}
          <div
            className="card card-glass animate-fade-in-up stagger-1"
            style={{ padding: '2rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
            />
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <GraduationCap size={26} color="#818cf8" />
            </div>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>For Students</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Upload your resume, discover tailored job listings, and get AI-powered feedback to boost your profile before applying.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Smart resume parsing & scoring', 'Personalized job recommendations', 'Application tracker & status', 'Interview prep resources'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: For Recruiters */}
          <div
            className="card card-glass animate-fade-in-up stagger-2"
            style={{ padding: '2rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
              }}
            />
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Briefcase size={26} color="#a78bfa" />
            </div>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>For Recruiters</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Post openings, browse AI-ranked candidates, and streamline your hiring pipeline from one powerful dashboard.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['AI-ranked candidate shortlists', 'Job posting & management', 'One-click interview scheduling', 'Real-time applicant pipeline'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: AI Features */}
          <div
            className="card card-glass animate-fade-in-up stagger-3"
            style={{ padding: '2rem', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #06b6d4, #6366f1)',
              }}
            />
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Brain size={26} color="#67e8f9" />
            </div>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>AI Features</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Our models analyze skills, experience, and culture-fit signals to generate the most accurate matches on both sides.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['NLP resume understanding', 'Skill-gap analysis & tips', 'Sentiment & culture-fit scoring', 'Predictive placement likelihood'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#67e8f9', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '80px 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>
            Simple. Smart.{' '}
            <span className="gradient-text">Fast.</span>
          </h2>
          <p style={{ maxWidth: '440px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Get from signup to your first interview in three easy steps.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {[
            {
              step: '01',
              icon: <FileText size={22} color="#818cf8" />,
              title: 'Upload Your Resume',
              desc: 'Drop your PDF or paste a link. Our AI extracts every detail instantly.',
              color: '#6366f1',
            },
            {
              step: '02',
              icon: <Search size={22} color="#a78bfa" />,
              title: 'Discover Matches',
              desc: 'Browse AI-curated job listings ranked by fit score, location, and preferences.',
              color: '#8b5cf6',
            },
            {
              step: '03',
              icon: <Zap size={22} color="#67e8f9" />,
              title: 'Apply & Get Hired',
              desc: 'One-click apply, track status, and land the offer — all in one place.',
              color: '#06b6d4',
            },
          ].map(({ step, icon, title, desc, color }) => (
            <div
              key={step}
              className="card card-glass"
              style={{ padding: '2rem', borderRadius: '20px', textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: `${color}20`,
                  lineHeight: 1,
                  marginBottom: '1rem',
                  letterSpacing: '-0.04em',
                }}
              >
                {step}
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `rgba(${color === '#6366f1' ? '99,102,241' : color === '#8b5cf6' ? '139,92,246' : '6,182,212'},0.1)`,
                  border: `1px solid rgba(${color === '#6366f1' ? '99,102,241' : color === '#8b5cf6' ? '139,92,246' : '6,182,212'},0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                {icon}
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA Banner ── */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '80px 2rem 100px',
          textAlign: 'center',
        }}
      >
        <div
          className="card card-glass"
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            padding: '3.5rem 2.5rem',
            borderRadius: '28px',
            background: 'rgba(13,21,38,0.8)',
            boxShadow: '0 0 80px rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '9999px',
              padding: '0.3rem 0.9rem',
              marginBottom: '1.5rem',
              fontSize: '0.78rem',
              color: '#a5b4fc',
              fontWeight: 600,
            }}
          >
            <Star size={13} /> Free to Join
          </div>
          <h2 style={{ marginBottom: '1rem' }}>
            Ready to accelerate your{' '}
            <span className="gradient-text">career journey?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Join thousands of students and recruiters already using PlaceAI to close the gap between talent and opportunity.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-gradient btn-lg"
              onClick={() => navigate('/signup')}
              style={{ gap: '0.6rem' }}
            >
              <GraduationCap size={20} />
              Start as Student
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate('/signup?role=recruiter')}
              style={{ border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <Briefcase size={20} />
              Post a Job
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '2rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(99,102,241,0.1)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Brain size={16} color="#6366f1" />
          <span className="gradient-text" style={{ fontWeight: 700 }}>PlaceAI</span>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} PlaceAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
