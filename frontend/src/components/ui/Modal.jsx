import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = '520px' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-fade-in" style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={18} /></button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}
