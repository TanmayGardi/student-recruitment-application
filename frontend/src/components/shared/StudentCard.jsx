import { GraduationCap, Star, MapPin, Tag } from 'lucide-react';

export default function StudentCard({ student, onClick }) {
  const skills = student.skills || [];
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => onClick && onClick(student)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-full)',
          background: 'var(--gradient-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {student.full_name?.[0] || '?'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student.full_name || 'Unnamed Student'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student.college || 'College not set'}
          </div>
        </div>
        {student.cgpa && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Star size={13} fill="currentColor" />{student.cgpa}
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
        {student.degree} {student.branch ? `· ${student.branch}` : ''} {student.graduation_year ? `· ${student.graduation_year}` : ''}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
        {skills.slice(0, 4).map(s => (
          <span key={s} className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{s}</span>
        ))}
        {skills.length > 4 && <span className="badge badge-gray">+{skills.length - 4}</span>}
      </div>
      {student.has_resume && (
        <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>📄 Resume uploaded</span>
      )}
    </div>
  );
}
