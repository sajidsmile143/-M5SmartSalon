import React, { useState } from 'react';
import { UserPlus, X, Phone, User, Scissors, Clock, LoaderCircle, Check } from 'lucide-react';
import { isValidPkMobile, formatPhoneDisplay, formatRs } from '../../lib/format';

export default function AddCustomerModal({ services, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [createBookingNow, setCreateBookingNow] = useState(true);
  const [selectedMainId, setSelectedMainId] = useState(() => {
    const firstMain = services.find((s) => !s.Is_AddOn);
    return firstMain ? firstMain.Service_ID : '';
  });
  const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const mainServices = services.filter((s) => !s.Is_AddOn);
  const addOns = services.filter((s) => s.Is_AddOn);

  const mainService = services.find((s) => s.Service_ID === selectedMainId);
  const chosenAddOns = services.filter((s) => selectedAddOnIds.includes(s.Service_ID));

  const totalBill = (mainService?.Price || 0) + chosenAddOns.reduce((s, a) => s + a.Price, 0);
  const totalMins = (mainService?.Duration_Minutes || 0) + chosenAddOns.reduce((s, a) => s + a.Duration_Minutes, 0);

  const toggleAddOn = (id) => {
    setSelectedAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Customer ka naam likhein');
      return;
    }
    if (!isValidPkMobile(phone)) {
      setError('Sahi mobile number likhein (e.g. 0300 1234567)');
      return;
    }
    if (createBookingNow && !selectedMainId) {
      setError('Koi ek main service select karein');
      return;
    }

    setBusy(true);
    const bookingDetails = createBookingNow
      ? {
          Service_Ids: [selectedMainId, ...selectedAddOnIds],
          Service_Names: [mainService.Service_Name, ...chosenAddOns.map((a) => a.Service_Name)],
          Total_Bill: totalBill
        }
      : null;

    const ok = await onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      bookingDetails
    });
    setBusy(false);
    if (!ok.success) {
      setError(ok.error || 'Customer add nahi ho saka');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[#11141c] border border-[var(--border-color)] rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh] animate-slide-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">New Walk-In Customer</h3>
              <p className="text-xs text-[var(--text-muted)]">Naya client add karein aur schedule mein shamil karein</p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="label" htmlFor="walkin-name">Customer Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                id="walkin-name"
                className="input pl-10"
                required
                placeholder="e.g. Bilal Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="walkin-phone">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                id="walkin-phone"
                className="input pl-10"
                type="tel"
                inputMode="tel"
                required
                placeholder="0300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-[var(--text-dim)] mt-1">
              Customer isi number se login karke apna 10% cashback dekh sakega
            </p>
          </div>

          {/* Toggle Create Appointment */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 accent-yellow-500 cursor-pointer"
              checked={createBookingNow}
              onChange={(e) => setCreateBookingNow(e.target.checked)}
            />
            <span className="text-xs">
              <span className="font-bold text-white block">Aaj ki appointment shamil karein (Immediate Walk-in)</span>
              <span className="text-[var(--text-muted)]">Abhi counter par baitha hai, schedule mein shamil hoga aur complete karne par 10% cashback milega</span>
            </span>
          </label>

          {createBookingNow && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="label">Main Service</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mainServices.map((s) => {
                    const active = selectedMainId === s.Service_ID;
                    return (
                      <button
                        key={s.Service_ID}
                        type="button"
                        onClick={() => setSelectedMainId(s.Service_ID)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          active
                            ? 'bg-yellow-500/15 border-yellow-500 text-white'
                            : 'bg-black/30 border-[var(--border-color)] text-[var(--text-muted)] hover:border-white/20'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{s.Service_Name}</p>
                          <p className="text-[10px] text-[var(--text-dim)]">{s.Duration_Minutes} min</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-400">{formatRs(s.Price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {addOns.length > 0 && (
                <div>
                  <label className="label">Add-Ons (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {addOns.map((a) => {
                      const active = selectedAddOnIds.includes(a.Service_ID);
                      return (
                        <button
                          key={a.Service_ID}
                          type="button"
                          onClick={() => toggleAddOn(a.Service_ID)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                            active
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                              : 'bg-black/30 border-[var(--border-color)] text-[var(--text-muted)] hover:border-white/20'
                          }`}
                        >
                          <span>{active ? '✓' : '+'}</span>
                          <span>{a.Service_Name}</span>
                          <span className="text-yellow-400 font-bold">+{formatRs(a.Price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="rounded-xl bg-black/40 border border-[var(--border-color)] p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[var(--text-muted)]">Total Bill: </span>
                  <span className="text-sm font-extrabold gold-gradient-text">{formatRs(totalBill)}</span>
                </div>
                <div className="text-[var(--text-dim)] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-500" /> {totalMins} min
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
              {error}
            </p>
          )}

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1 text-xs">
              {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
              {createBookingNow ? 'Customer & Booking Add Karein' : 'Sirf Customer Add Karein'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
