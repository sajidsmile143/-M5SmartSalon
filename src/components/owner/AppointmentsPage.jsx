import React, { useState, useMemo } from 'react';
import { Search, CalendarDays } from 'lucide-react';
import BookingCard, { EmptyState } from './BookingCard';
import { formatDate, isSameDay } from '../../lib/format';

const FILTERS = [
  { id: 'upcoming', label: 'Aane wali' },
  { id: 'Pending', label: 'Pending' },
  { id: 'Completed', label: 'Completed' },
  { id: 'No-Show', label: 'No-Show' },
  { id: 'all', label: 'Sab' }
];

export default function AppointmentsPage({ users, bookings, onUpdateStatus }) {
  const [filter, setFilter] = useState('upcoming');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const q = query.trim().toLowerCase();

    let list = bookings.filter((b) => {
      if (filter === 'upcoming') return b.Status === 'Pending' && new Date(b.Booking_Date_Time) >= startOfToday;
      if (filter === 'all') return true;
      return b.Status === filter;
    });

    if (q) {
      list = list.filter((b) =>
        b.Customer_Name.toLowerCase().includes(q) ||
        b.Customer_Phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        b.Service_Names.join(' ').toLowerCase().includes(q)
      );
    }

    const asc = filter === 'upcoming' || filter === 'Pending';
    list.sort((a, b) => (asc ? 1 : -1) * (new Date(a.Booking_Date_Time) - new Date(b.Booking_Date_Time)));

    // Group by calendar day
    const out = [];
    list.forEach((b) => {
      const last = out[out.length - 1];
      if (last && isSameDay(last.date, b.Booking_Date_Time)) last.items.push(b);
      else out.push({ date: b.Booking_Date_Time, items: [b] });
    });
    return out;
  }, [bookings, filter, query]);

  const dayLabel = (iso) => {
    if (isSameDay(iso, new Date())) return 'Aaj';
    const t = new Date(); t.setDate(t.getDate() + 1);
    if (isSameDay(iso, t)) return 'Kal';
    return formatDate(iso);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-[var(--border-color)] overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f.id ? 'bg-yellow-500 text-black' : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative md:ml-auto md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input
            className="input pl-10 py-2.5 text-sm"
            placeholder="Naam, number ya service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Koi booking nahi mili" text="Filter ya search badal kar dekhein" />
      ) : (
        groups.map((g) => (
          <section key={g.date} className="space-y-3">
            <h2 className="section-title flex items-center gap-2">
              {dayLabel(g.date)}
              <span className="text-[var(--text-dim)] normal-case tracking-normal font-medium">· {g.items.length} bookings</span>
            </h2>
            {g.items.map((b) => (
              <BookingCard
                key={b.Booking_ID}
                booking={b}
                customer={users.find((u) => u.User_ID === b.Customer_ID)}
                onUpdateStatus={onUpdateStatus}
                showDate={false}
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
