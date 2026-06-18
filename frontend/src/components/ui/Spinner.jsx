export default function Spinner({ size = 20, color = 'var(--accent-1)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', flexDirection: 'column' }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
    </div>
  );
}
