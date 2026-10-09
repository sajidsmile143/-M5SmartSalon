import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Scissors, Sparkles, Clock, X, LoaderCircle } from 'lucide-react';
import { EmptyState } from './BookingCard';
import { formatRs } from '../../lib/format';

const EMPTY = { Service_Name: '', Price: '', Duration_Minutes: '30', Is_AddOn: false };

export default function ServicesPage({ services, onSaveService, onDeleteService }) {
  const [editing, setEditing] = useState(null); // null | service object (new or existing)

  const main = services.filter((s) => !s.Is_AddOn);
  const addOns = services.filter((s) => s.Is_AddOn);

  const remove = (s) => {
    if (window.confirm(`"${s.Service_Name}" hata dein? Customers ise book nahi kar sakenge.`)) {
      onDeleteService(s.Service_ID);
    }
  };

  const List = ({ items, title, icon: Icon, hint }) => (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon className="w-4.5 h-4.5 text-yellow-500" /> {title}
          <span className="text-xs font-medium text-[var(--text-dim)]">({items.length})</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Icon} title="Abhi koi service nahi" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((s) => (
            <div key={s.Service_ID} className="card p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-lg shrink-0">
                {s.Icon || (s.Is_AddOn ? '✨' : '✂️')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate">{s.Service_Name}</h3>
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                  <span className="font-bold text-yellow-400">{formatRs(s.Price)}</span>
                  <span className="text-white/10 mx-1">•</span>
                  <Clock className="w-3 h-3" /> {s.Duration_Minutes} min
                </p>
              </div>
              <button onClick={() => setEditing(s)} className="icon-btn" title="Edit" aria-label="Edit">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => remove(s)} className="icon-btn hover:!text-rose-400" title="Delete" aria-label="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">Customers ko yehi services aur prices nazar aate hain.</p>
        <button id="add-service" onClick={() => setEditing({ ...EMPTY })} className="btn-primary text-sm px-4 py-2.5 shrink-0">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nayi service</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <List items={main} title="Main services" icon={Scissors} hint="Customer pehle in mein se ek chunta hai" />
      <List items={addOns} title="Add-ons" icon={Sparkles} hint="Booking ke waqt saath mein add hone wali choti services" />

      {editing && (
        <ServiceModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            const ok = await onSaveService(data);
            if (ok) setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    ...initial,
    Price: String(initial.Price ?? ''),
    Duration_Minutes: String(initial.Duration_Minutes ?? '30')
  });
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(initial.Service_ID);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.Service_Name.trim() || !form.Price) return;
    setBusy(true);
    await onSave({
      ...form,
      Service_Name: form.Service_Name.trim(),
      Price: parseInt(form.Price, 10),
      Duration_Minutes: parseInt(form.Duration_Minutes, 10) || 30
    });
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#11141c] border border-[var(--border-color)] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-slide-up"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{isEdit ? 'Service edit karein' : 'Nayi service'}</h3>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div>
          <label className="label" htmlFor="svc-name">Service ka naam</label>
          <input id="svc-name" className="input" required placeholder="Masalan: Keratin Treatment" value={form.Service_Name} onChange={(e) => set('Service_Name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="svc-price">Price (Rs)</label>
            <input id="svc-price" className="input" type="number" min="0" required placeholder="500" value={form.Price} onChange={(e) => set('Price', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="svc-duration">Waqt (minutes)</label>
            <input id="svc-duration" className="input" type="number" min="5" step="5" required value={form.Duration_Minutes} onChange={(e) => set('Duration_Minutes', e.target.value)} />
          </div>
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-color)] cursor-pointer">
          <input type="checkbox" className="w-4 h-4 mt-0.5 accent-yellow-500" checked={form.Is_AddOn} onChange={(e) => set('Is_AddOn', e.target.checked)} />
          <span className="text-sm">
            <span className="font-semibold block">Ye add-on service hai</span>
            <span className="text-xs text-[var(--text-muted)]">Booking ke waqt "saath mein add karein" list mein dikhegi</span>
          </span>
        </label>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save' : 'Add karein'}
          </button>
        </div>
      </form>
    </div>
  );
}
