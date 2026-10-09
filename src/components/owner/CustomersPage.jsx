import React, { useState, useMemo } from 'react';
import { Search, Users, MessageSquare, Phone, Wallet } from 'lucide-react';
import { EmptyState } from './BookingCard';
import { formatRs, daysSince, daysAgoLabel, whatsappLink, RETENTION_DAYS } from '../../lib/format';

const SORTS = [
  { id: 'recent', label: 'Recent' },
  { id: 'inactive', label: 'Zyada din se nahi aaye' },
  { id: 'visits', label: 'Zyada visits' },
  { id: 'wallet', label: 'Wallet' }
];

export default function CustomersPage({ users, bookings, onOpenAddCustomer }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');

  const rows = useMemo(() => {
    const stats = {};
    bookings.forEach((b) => {
      if (b.Status !== 'Completed') return;
      const s = (stats[b.Customer_ID] ||= { visits: 0, spent: 0 });
      s.visits += 1;
      s.spent += b.Final_Paid ?? b.Total_Bill;
    });

    const q = query.trim().toLowerCase();
    const list = users
      .filter((u) => u.Role === 'Customer')
      .filter((u) => !q || u.Name.toLowerCase().includes(q) || u.Phone_Number.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
      .map((u) => ({ ...u, ...(stats[u.User_ID] || { visits: 0, spent: 0 }), days: daysSince(u.Last_Visit_Date) ?? 0 }));

    const sorters = {
      recent: (a, b) => a.days - b.days,
      inactive: (a, b) => b.days - a.days,
      visits: (a, b) => b.visits - a.visits,
      wallet: (a, b) => b.Wallet_Balance - a.Wallet_Balance
    };
    return list.sort(sorters[sort]);
  }, [users, bookings, query, sort]);

  const total = users.filter((u) => u.Role === 'Customer').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input className="input pl-10 py-2.5 text-sm" placeholder="Naam ya number se dhoondein..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input py-2.5 text-sm md:w-56"
        >
          {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-[#11141c]">{s.label}</option>)}
        </select>
        <button
          onClick={onOpenAddCustomer}
          className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 md:ml-auto whitespace-nowrap shrink-0"
        >
          <span>+ Add Customer</span>
        </button>
      </div>

      <p className="text-xs text-[var(--text-muted)]">{rows.length} / {total} customers</p>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="Koi customer nahi mila" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {rows.map((c) => {
            const inactive = c.days >= RETENTION_DAYS;
            return (
              <div key={c.User_ID} className={`card p-4 space-y-3 ${inactive ? 'border-rose-500/25' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center font-bold text-yellow-300 shrink-0">
                    {c.Name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">{c.Name}</h3>
                    <a href={`tel:${c.Phone_Number}`} className="text-xs text-[var(--text-muted)] hover:text-yellow-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.Phone_Number}
                    </a>
                  </div>
                  <a
                    href={whatsappLink(c.Phone_Number)}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-btn text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    title="WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-black/30 py-2">
                    <p className="text-sm font-bold">{c.visits}</p>
                    <p className="text-[10px] text-[var(--text-dim)]">Visits</p>
                  </div>
                  <div className="rounded-xl bg-black/30 py-2 min-w-0">
                    <p className="text-sm font-bold text-emerald-400 truncate px-1 flex items-center justify-center gap-1">
                      <Wallet className="w-3 h-3 shrink-0" />{Math.round(c.Wallet_Balance)}
                    </p>
                    <p className="text-[10px] text-[var(--text-dim)]">Wallet (Rs)</p>
                  </div>
                  <div className="rounded-xl bg-black/30 py-2 min-w-0">
                    <p className="text-sm font-bold truncate px-1">{formatRs(c.spent).replace('Rs ', '')}</p>
                    <p className="text-[10px] text-[var(--text-dim)]">Kharch (Rs)</p>
                  </div>
                </div>

                <p className={`text-xs ${inactive ? 'text-rose-300' : 'text-[var(--text-muted)]'}`}>
                  Aakhri visit: <span className="font-semibold">{daysAgoLabel(c.Last_Visit_Date)}</span>
                  {inactive && ' · Reminder bhejein'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
