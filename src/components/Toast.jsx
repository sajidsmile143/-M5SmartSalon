import React, { useEffect } from 'react';
import { CircleCheck, CircleX, Info, X } from 'lucide-react';

const STYLES = {
  success: { icon: CircleCheck, cls: 'border-emerald-500/40 text-emerald-300', iconCls: 'text-emerald-400' },
  error: { icon: CircleX, cls: 'border-rose-500/40 text-rose-300', iconCls: 'text-rose-400' },
  info: { icon: Info, cls: 'border-yellow-500/40 text-yellow-200', iconCls: 'text-yellow-400' }
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, toast.type === 'error' ? 6000 : 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const { icon: Icon, cls, iconCls } = STYLES[toast.type] || STYLES.success;

  return (
    <div
      key={toast.id}
      role="status"
      className={`fixed top-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm glass-panel rounded-2xl px-4 py-3 flex items-start gap-3 shadow-2xl animate-toast ${cls}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconCls}`} />
      <p className="text-sm font-medium flex-1 min-w-0 break-words">{toast.message}</p>
      <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white shrink-0" aria-label="Close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
