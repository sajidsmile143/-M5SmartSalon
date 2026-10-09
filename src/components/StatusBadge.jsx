import React from 'react';

const MAP = {
  Pending: { label: 'Pending', cls: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  Completed: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  'No-Show': { label: 'No-Show', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
};

export default function StatusBadge({ status, label }) {
  const s = MAP[status] || MAP.Pending;
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${s.cls}`}>
      {label || s.label}
    </span>
  );
}
