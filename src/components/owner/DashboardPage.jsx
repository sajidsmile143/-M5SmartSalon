import React, { useMemo } from 'react';
import { Banknote, TrendingUp, CalendarDays, Percent, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import BookingCard, { EmptyState } from './BookingCard';
import { formatRs, isSameDay } from '../../lib/format';

function StatCard({ label, value, sub, icon: Icon, tone }) {
  const tones = {
    gold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };
  return (
    <div className="card p-4 md:p-5 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-[var(--text-muted)] leading-snug">{label}</span>
        <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon className="w-4.5 h-4.5" />
        </span>
      </div>
      <p className="text-xl md:text-2xl font-extrabold truncate">{value}</p>
      {sub && <p className="text-[11px] text-[var(--text-dim)] mt-1 truncate">{sub}</p>}
    </div>
  );
}

export default function DashboardPage({ user, users, bookings, onUpdateStatus, inactiveCount, onNavigate, onOpenAddCustomer }) {
  const stats = useMemo(() => {
    const now = new Date();
    const completed = bookings.filter((b) => b.Status === 'Completed');
    const todayDone = completed.filter((b) => isSameDay(b.Booking_Date_Time, now));
    const monthDone = completed.filter((b) => {
      const d = new Date(b.Booking_Date_Time);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const today = bookings.filter((b) => isSameDay(b.Booking_Date_Time, now));

    const visits = {};
    completed.forEach((b) => { visits[b.Customer_ID] = (visits[b.Customer_ID] || 0) + 1; });
    const unique = Object.keys(visits).length;
    const repeat = Object.values(visits).filter((c) => c > 1).length;

    return {
      todayRevenue: todayDone.reduce((s, b) => s + (b.Final_Paid ?? b.Total_Bill), 0),
      monthRevenue: monthDone.reduce((s, b) => s + (b.Final_Paid ?? b.Total_Bill), 0),
      monthCount: monthDone.length,
      todayTotal: today.length,
      todayPending: today.filter((b) => b.Status === 'Pending').length,
      repeatRate: unique ? Math.round((repeat / unique) * 100) : 0,
      repeat,
      unique
    };
  }, [bookings]);

  const todayList = useMemo(
    () => bookings
      .filter((b) => isSameDay(b.Booking_Date_Time, new Date()))
      .sort((a, b) => new Date(a.Booking_Date_Time) - new Date(b.Booking_Date_Time)),
    [bookings]
  );

  const upcomingCount = bookings.filter((b) => b.Status === 'Pending' && new Date(b.Booking_Date_Time) > new Date() && !isSameDay(b.Booking_Date_Time, new Date())).length;

  const greeting = new Date().getHours() < 12 ? 'Subah bakhair' : new Date().getHours() < 17 ? 'Salam' : 'Shaam bakhair';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{greeting}, {user.Name.split(' ')[0]} 👋</p>
          <p className="text-xs text-[var(--text-dim)]">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={onOpenAddCustomer}
          className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+ Add Walk-In Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Aaj ki kamai" value={formatRs(stats.todayRevenue)} sub="Completed bookings se" icon={Banknote} tone="gold" />
        <StatCard label="Is mahine" value={formatRs(stats.monthRevenue)} sub={`${stats.monthCount} haircuts`} icon={TrendingUp} tone="emerald" />
        <StatCard label="Aaj ki appointments" value={stats.todayTotal} sub={`${stats.todayPending} baqi hain`} icon={CalendarDays} tone="blue" />
        <StatCard label="Repeat customers" value={`${stats.repeatRate}%`} sub={`${stats.repeat} / ${stats.unique} dobara aaye`} icon={Percent} tone="purple" />
      </div>

      {inactiveCount > 0 && (
        <button
          onClick={() => onNavigate('retention')}
          className="w-full card card-hover p-4 flex items-center gap-3 text-left border-emerald-500/30 bg-emerald-500/5"
        >
          <span className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold">{inactiveCount} customers 25+ din se nahi aaye</span>
            <span className="block text-xs text-[var(--text-muted)]">Unhein WhatsApp reminder bhejein</span>
          </span>
          <ArrowRight className="w-5 h-5 text-emerald-400 shrink-0" />
        </button>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-yellow-500" /> Aaj ka schedule
          </h2>
          <button onClick={() => onNavigate('appointments')} className="text-xs font-semibold text-yellow-400 hover:underline whitespace-nowrap">
            Sab dekhein{upcomingCount > 0 ? ` (+${upcomingCount} aane wali)` : ''}
          </button>
        </div>

        {todayList.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Aaj koi appointment nahi" text="Nayi bookings yahan khud aa jayengi (har 20 second refresh)" />
        ) : (
          <div className="space-y-3">
            {todayList.map((b) => (
              <BookingCard
                key={b.Booking_ID}
                booking={b}
                customer={users.find((u) => u.User_ID === b.Customer_ID)}
                onUpdateStatus={onUpdateStatus}
                showDate={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
