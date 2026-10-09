import React, { useState, useMemo } from 'react';
import { X, Clock, Check, Wallet, CalendarDays, Sparkles, LoaderCircle } from 'lucide-react';
import { formatRs, isSameDay } from '../../lib/format';

const OPEN_HOUR = 10;   // 10:00 AM
const CLOSE_HOUR = 22;  // last slot 9:30 PM
const SLOT_MINUTES = 30;

const buildDays = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + i);
  return d;
});

const buildSlots = (day) => {
  const slots = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      const s = new Date(day);
      s.setHours(h, m, 0, 0);
      slots.push(s);
    }
  }
  return slots;
};

export default function BookingSheet({ user, mainService, addOnServices, takenSlots, onClose, onConfirm }) {
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [useWallet, setUseWallet] = useState(false);
  const days = useMemo(buildDays, []);
  const [day, setDay] = useState(days[0]);
  const [slot, setSlot] = useState(null);
  const [busy, setBusy] = useState(false);

  const takenTimes = useMemo(() => new Set(takenSlots.map((t) => new Date(t).getTime())), [takenSlots]);
  const slots = useMemo(() => buildSlots(day), [day]);
  const now = Date.now();

  const subtotal = mainService.Price + selectedAddOns.reduce((s, a) => s + a.Price, 0);
  const duration = mainService.Duration_Minutes + selectedAddOns.reduce((s, a) => s + a.Duration_Minutes, 0);
  const walletDiscount = useWallet ? Math.min(subtotal, user.Wallet_Balance) : 0;
  const finalBill = subtotal - walletDiscount;
  const cashbackPreview = Math.round(subtotal * 0.1);

  const toggleAddOn = (a) => {
    setSelectedAddOns((prev) => (prev.some((x) => x.Service_ID === a.Service_ID)
      ? prev.filter((x) => x.Service_ID !== a.Service_ID)
      : [...prev, a]));
  };

  const handleConfirm = async () => {
    if (!slot) return;
    setBusy(true);
    const ok = await onConfirm({
      Customer_ID: user.User_ID,
      Customer_Name: user.Name,
      Customer_Phone: user.Phone_Number,
      Service_Ids: [mainService.Service_ID, ...selectedAddOns.map((a) => a.Service_ID)],
      Service_Names: [mainService.Service_Name, ...selectedAddOns.map((a) => a.Service_Name)],
      Total_Bill: subtotal,
      Wallet_Discount: walletDiscount,
      Final_Paid: finalBill,
      Booking_Date_Time: slot.toISOString()
    }, walletDiscount);
    setBusy(false);
    if (ok) onClose(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => onClose(false)}>
      <div
        className="w-full max-w-md bg-[#11141c] border border-[var(--border-color)] rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh] animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-[var(--border-color)]">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-yellow-400 font-bold">Booking</p>
            <h3 className="text-lg font-bold truncate">{mainService.Service_Name}</h3>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> {mainService.Duration_Minutes} min · {formatRs(mainService.Price)}
            </p>
          </div>
          <button onClick={() => onClose(false)} className="icon-btn" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Date */}
          <section>
            <h4 className="section-title flex items-center gap-1.5 mb-3">
              <CalendarDays className="w-4 h-4 text-yellow-500" /> Din chunein
            </h4>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {days.map((d, i) => {
                const active = isSameDay(d, day);
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setDay(d); setSlot(null); }}
                    className={`shrink-0 w-16 py-2.5 rounded-2xl border text-center transition-all ${
                      active
                        ? 'bg-yellow-500 border-yellow-500 text-black'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-white/20'
                    }`}
                  >
                    <div className="text-[11px] font-semibold">
                      {i === 0 ? 'Aaj' : i === 1 ? 'Kal' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-extrabold ${active ? 'text-black' : 'text-white'}`}>{d.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Time */}
          <section>
            <h4 className="section-title flex items-center gap-1.5 mb-3">
              <Clock className="w-4 h-4 text-yellow-500" /> Waqt chunein
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => {
                const t = s.getTime();
                const disabled = t < now + 15 * 60000 || takenTimes.has(t);
                const active = slot && slot.getTime() === t;
                return (
                  <button
                    key={t}
                    disabled={disabled}
                    onClick={() => setSlot(s)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-yellow-500 border-yellow-500 text-black'
                        : disabled
                        ? 'bg-transparent border-white/5 text-white/20 line-through'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-white hover:border-yellow-500/50'
                    }`}
                  >
                    {s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </button>
                );
              })}
            </div>
            {slots.every((s) => s.getTime() < now + 15 * 60000) && (
              <p className="text-xs text-[var(--text-muted)] mt-2">Aaj ke slots khatam. Kal ka din chunein.</p>
            )}
          </section>

          {/* Add-ons */}
          {addOnServices.length > 0 && (
            <section>
              <h4 className="section-title flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Saath mein add karein (optional)
              </h4>
              <div className="space-y-2">
                {addOnServices.map((a) => {
                  const added = selectedAddOns.some((x) => x.Service_ID === a.Service_ID);
                  return (
                    <button
                      key={a.Service_ID}
                      onClick={() => toggleAddOn(a)}
                      className={`w-full p-3 rounded-2xl border flex items-center gap-3 text-left transition-all ${
                        added ? 'bg-yellow-500/10 border-yellow-500/60' : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-white/20'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        added ? 'bg-yellow-500 text-black' : 'bg-white/5 text-[var(--text-muted)]'
                      }`}>
                        {added ? <Check className="w-4 h-4" /> : '+'}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold truncate">{a.Service_Name}</span>
                        <span className="block text-[11px] text-[var(--text-muted)]">{a.Duration_Minutes} min</span>
                      </span>
                      <span className="text-sm font-bold text-yellow-400 shrink-0">+{formatRs(a.Price)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Wallet */}
          <label className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
            user.Wallet_Balance > 0 ? 'bg-emerald-500/10 border-emerald-500/30 cursor-pointer' : 'bg-white/[0.02] border-[var(--border-color)] opacity-60'
          }`}>
            <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold">Wallet balance use karein</span>
              <span className="block text-xs text-emerald-300">Available: {formatRs(user.Wallet_Balance)}</span>
            </span>
            <input
              type="checkbox"
              checked={useWallet}
              disabled={user.Wallet_Balance <= 0}
              onChange={(e) => setUseWallet(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 shrink-0"
            />
          </label>

          {/* Bill */}
          <section className="rounded-2xl bg-black/40 border border-[var(--border-color)] p-4 space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Subtotal ({1 + selectedAddOns.length} services)</span>
              <span>{formatRs(subtotal)}</span>
            </div>
            {walletDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Wallet discount</span>
                <span>- {formatRs(walletDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Andaazan waqt</span>
              <span>{duration} min</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-white/10 font-bold">
              <span>Salon par ada karein</span>
              <span className="text-xl gold-gradient-text">{formatRs(finalBill)}</span>
            </div>
            <p className="text-[11px] text-emerald-300 pt-1">
              Haircut complete hone par {formatRs(cashbackPreview)} cashback aap ke wallet mein aaye ga
            </p>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="p-4 border-t border-[var(--border-color)] safe-bottom">
          <button id="confirm-booking" onClick={handleConfirm} disabled={!slot || busy} className="btn-primary w-full py-3.5 text-base">
            {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {slot
              ? `Confirm · ${slot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · ${formatRs(finalBill)}`
              : 'Pehle waqt chunein'}
          </button>
        </div>
      </div>
    </div>
  );
}
