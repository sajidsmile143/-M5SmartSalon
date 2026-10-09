import React, { useState, useMemo } from 'react';
import { RefreshCw, Send, Check, MessageSquare, TriangleAlert, Phone, LoaderCircle, Info } from 'lucide-react';
import { EmptyState } from './BookingCard';
import { daysSince, whatsappLink, RETENTION_DAYS } from '../../lib/format';

const SENT_KEY = 'm5_sent_logs';

export default function RetentionPage({ users, marketingLogs, onRunRetentionScan }) {
  const [scanning, setScanning] = useState(false);
  const [sent, setSent] = useState(() => JSON.parse(localStorage.getItem(SENT_KEY) || '{}'));

  const inactiveCustomers = useMemo(
    () => users.filter((u) => u.Role === 'Customer' && (daysSince(u.Last_Visit_Date) ?? 0) >= RETENTION_DAYS),
    [users]
  );

  // Latest alert per customer, only for customers who are still inactive
  const queue = useMemo(() => {
    const latest = {};
    marketingLogs.forEach((l) => {
      const prev = latest[l.Customer_ID];
      if (!prev || new Date(l.Created_At || 0) > new Date(prev.Created_At || 0)) latest[l.Customer_ID] = l;
    });
    const stillInactive = new Set(inactiveCustomers.map((u) => u.User_ID));
    return Object.values(latest)
      .filter((l) => stillInactive.has(l.Customer_ID))
      .sort((a, b) => b.Days_Inactive - a.Days_Inactive);
  }, [marketingLogs, inactiveCustomers]);

  const notQueued = inactiveCustomers.filter((u) => !queue.some((l) => l.Customer_ID === u.User_ID)).length;

  const scan = async () => {
    setScanning(true);
    await onRunRetentionScan();
    setScanning(false);
  };

  const send = (log) => {
    window.open(whatsappLink(log.Customer_Phone, log.Message_Template), '_blank');
    const next = { ...sent, [log.Log_ID]: true };
    setSent(next);
    localStorage.setItem(SENT_KEY, JSON.stringify(next));
  };

  const sentCount = queue.filter((l) => sent[l.Log_ID]).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-[var(--text-muted)] flex-1">
          Jo customer {RETENTION_DAYS} din se nahi aaya, us ke liye WhatsApp message tayar hota hai. Ek click se bhejein.
        </p>
        <button id="run-scan" onClick={scan} disabled={scanning} className="btn-primary text-sm px-4 py-2.5 shrink-0">
          {scanning ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Customers check karein
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 min-w-0">
          <TriangleAlert className="w-5 h-5 text-rose-400 mb-2" />
          <p className="text-2xl font-extrabold text-rose-300">{inactiveCustomers.length}</p>
          <p className="text-[11px] text-[var(--text-muted)] leading-snug">{RETENTION_DAYS}+ din se nahi aaye</p>
        </div>
        <div className="card p-4 min-w-0">
          <MessageSquare className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-2xl font-extrabold text-yellow-300">{queue.length - sentCount}</p>
          <p className="text-[11px] text-[var(--text-muted)] leading-snug">Bhejne baqi</p>
        </div>
        <div className="card p-4 min-w-0">
          <Check className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-extrabold text-emerald-300">{sentCount}</p>
          <p className="text-[11px] text-[var(--text-muted)] leading-snug">Bhej diye</p>
        </div>
      </div>

      {notQueued > 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-100">
          <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <span className="flex-1">{notQueued} customers ke message abhi tayar nahi. Upar wala button dabayein.</span>
        </div>
      )}

      {queue.length === 0 ? (
        <EmptyState
          icon={Check}
          title="Sab customers active hain 🎉"
          text={`Koi bhi customer ${RETENTION_DAYS} din se ghair-haazir nahi`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {queue.map((log) => {
            const isSent = sent[log.Log_ID];
            const days = daysSince(users.find((u) => u.User_ID === log.Customer_ID)?.Last_Visit_Date) ?? log.Days_Inactive;
            return (
              <div key={log.Log_ID} className={`card p-4 flex flex-col gap-3 ${isSent ? 'opacity-70' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center font-bold text-rose-300 shrink-0">
                    {log.Customer_Name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">{log.Customer_Name}</h3>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {log.Customer_Phone}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                    {days} din
                  </span>
                </div>

                <p className="text-sm text-slate-300 bg-black/30 border border-white/5 rounded-xl p-3 leading-relaxed break-words">
                  {log.Message_Template}
                </p>

                <button
                  onClick={() => send(log)}
                  className={`h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    isSent
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isSent ? <><Check className="w-4 h-4" /> Bhej diya (dobara bhejein)</> : <><Send className="w-4 h-4" /> WhatsApp par bhejein</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
