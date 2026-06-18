import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const colors = { success: 'var(--success)', error: 'var(--error)', warning: 'var(--warning)', info: 'var(--info)' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        zIndex: 9999, maxWidth: '360px',
      }}>
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type];
          return (
            <div key={id} className="animate-fade-in" style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${colors[type]}40`,
              borderRadius: 'var(--radius)',
              padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              minWidth: '280px',
            }}>
              <Icon size={18} color={colors[type]} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ flex: 1, fontSize: '0.875rem' }}>{message}</span>
              <button onClick={() => remove(id)} style={{ color: 'var(--text-muted)', display: 'flex', padding: '2px' }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
