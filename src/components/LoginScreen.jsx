import React, { useState } from 'react';
import { Phone, User, LogIn, UserPlus, Scissors, Wallet, MessageSquare, LoaderCircle } from 'lucide-react';
import { isValidPkMobile } from '../lib/format';

export default function LoginScreen({ users, onLogin, onSignup }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidPkMobile(phone)) {
      setError('Sahi mobile number likhein (masalan 0300 1234567)');
      return;
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Apna naam likhein');
      return;
    }
    setBusy(true);
    const res = mode === 'login' ? onLogin(phone) : await onSignup(name, phone);
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  // Quick-fill numbers only in local development
  const demoAccounts = import.meta.env.DEV
    ? [
        users.find((u) => u.Role === 'Customer'),
        users.find((u) => u.Role === 'Barber' || u.Role === 'Admin')
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />

      <main className="w-full max-w-md relative animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 flex items-center justify-center font-extrabold text-black text-2xl shadow-lg shadow-yellow-500/30 mb-4">
            M5
          </div>
          <h1 className="text-3xl font-extrabold">
            M5 <span className="gold-gradient-text">SmartSalon</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Booking karein, har haircut par 10% cashback payen</p>
        </div>

        <div className="card p-5 sm:p-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/40 border border-[var(--border-color)] mb-6">
            {[
              { id: 'login', label: 'Login', icon: LogIn },
              { id: 'signup', label: 'Naya Account', icon: UserPlus }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`tab-${id}`}
                type="button"
                onClick={() => switchMode(id)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === id ? 'bg-yellow-500 text-black' : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="animate-fade-in">
                <label className="label" htmlFor="name-input">Aap ka naam</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    id="name-input"
                    className="input pl-10"
                    placeholder="Ali Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="phone-input">Mobile number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  id="phone-input"
                  className="input pl-10"
                  type="tel"
                  inputMode="tel"
                  placeholder="0300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button id="submit-auth" type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base">
              {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Login karein' : 'Account banayein'}
            </button>

            <p className="text-xs text-center text-[var(--text-dim)]">
              Salon owner / barber bhi apne number se isi jagah login karein
            </p>
          </form>

          {demoAccounts.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[var(--border-color)]">
              <p className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] font-semibold mb-2">
                Testing accounts (sirf dev mode)
              </p>
              <div className="flex flex-wrap gap-2">
                {demoAccounts.map((u) => (
                  <button
                    key={u.User_ID}
                    type="button"
                    onClick={() => { switchMode('login'); setPhone(u.Phone_Number); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border-color)] hover:border-yellow-500/50 text-[var(--text-muted)] hover:text-white transition-all"
                  >
                    {u.Name} · <span className="text-yellow-400">{u.Role === 'Customer' ? 'Customer' : 'Owner'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-3 gap-2 mt-6 text-center">
          {[
            { icon: Scissors, text: 'Online booking' },
            { icon: Wallet, text: '10% cashback' },
            { icon: MessageSquare, text: 'WhatsApp reminders' }
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-[var(--border-color)] flex items-center justify-center">
                <Icon className="w-4 h-4 text-yellow-400" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
