import React, { useState } from 'react';
import { X, User, Phone, Check, LoaderCircle, Sparkles } from 'lucide-react';

export default function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.Name || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError('Apna pura naam likhein');
      return;
    }

    setBusy(true);
    const ok = await onSave(name.trim());
    setBusy(false);
    if (ok) {
      onClose();
    } else {
      setError('Profile update nahi ho saki. Dobara try karein.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-[#11141c] border border-[var(--border-color)] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h3 className="text-base font-bold text-white">Edit Profile</h3>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="label" htmlFor="edit-name">Aap ka Naam</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                id="edit-name"
                className="input pl-10"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ali Khan"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label">Registered Mobile Number</label>
            <div className="relative opacity-60">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                className="input pl-10 bg-white/5 cursor-not-allowed"
                disabled
                value={user.Phone_Number}
              />
            </div>
            <p className="text-[10px] text-[var(--text-dim)] mt-1">
              Mobile number lock hota hai taa ke aap ka cashback balance safe rahe
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1 text-xs">
              {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
