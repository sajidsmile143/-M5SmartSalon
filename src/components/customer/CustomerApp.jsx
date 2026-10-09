import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  House, CalendarDays, User, Wallet, Clock, Scissors, Gift, Copy, Check, Share2,
  RefreshCw, LogOut, ChevronRight, Sparkles, Phone
} from 'lucide-react';
import BookingSheet from './BookingSheet';
import EditProfileModal from './EditProfileModal';
import StatusBadge from '../StatusBadge';
import { formatRs, formatTime, relativeDay, formatDate, CASHBACK_RATE } from '../../lib/format';

const TABS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: User }
];

export default function CustomerApp({ user, services, myBookings, takenSlots, onCreateBooking, onUpdateProfile, onRefresh, syncing, onLogout }) {
  const [tab, setTab] = useState('home');
  const [bookingService, setBookingService] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const mainServices = services.filter((s) => !s.Is_AddOn);
  const addOnServices = services.filter((s) => s.Is_AddOn);

  const sorted = useMemo(
    () => [...myBookings].sort((a, b) => new Date(b.Booking_Date_Time) - new Date(a.Booking_Date_Time)),
    [myBookings]
  );
  const upcoming = sorted.filter((b) => b.Status === 'Pending').reverse();
  const history = sorted.filter((b) => b.Status !== 'Pending');

  const handleSheetClose = (booked) => {
    setBookingService(null);
    if (booked) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      setTab('bookings');
    }
  };

  return (
    <div className="min-h-dvh flex justify-center bg-[var(--bg-dark)]">
      <div className="w-full max-w-md min-h-dvh flex flex-col relative sm:border-x sm:border-[var(--border-color)]">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-panel border-x-0 border-t-0 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center font-bold text-black shrink-0">
            {user.Name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-muted)]">Assalam o Alaikum 👋</p>
            <h1 className="text-base font-bold truncate">{user.Name}</h1>
          </div>
          <button onClick={onRefresh} className="icon-btn" aria-label="Refresh" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 pt-4 pb-28 space-y-6">
          {tab === 'home' && (
            <HomeTab
              user={user}
              mainServices={mainServices}
              nextBooking={upcoming[0]}
              onBook={setBookingService}
              onSeeBookings={() => setTab('bookings')}
            />
          )}
          {tab === 'bookings' && (
            <BookingsTab upcoming={upcoming} history={history} onBookNew={() => setTab('home')} />
          )}
          {tab === 'profile' && (
            <ProfileTab user={user} history={history} onEdit={() => setIsEditingProfile(true)} onLogout={onLogout} />
          )}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 glass-panel border-x-0 border-b-0 safe-bottom">
          <div className="grid grid-cols-3">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  id={`customer-tab-${id}`}
                  onClick={() => setTab(id)}
                  className={`relative flex flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-colors ${
                    active ? 'text-yellow-400' : 'text-[var(--text-dim)] hover:text-white'
                  }`}
                >
                  {active && <span className="absolute top-0 w-10 h-0.5 rounded-full bg-yellow-400" />}
                  <Icon className="w-5 h-5" />
                  {label}
                  {id === 'bookings' && upcoming.length > 0 && (
                    <span className="absolute top-2 right-[calc(50%-20px)] min-w-4 h-4 px-1 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center">
                      {upcoming.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {bookingService && (
        <BookingSheet
          user={user}
          mainService={bookingService}
          addOnServices={addOnServices}
          takenSlots={takenSlots}
          onClose={handleSheetClose}
          onConfirm={onCreateBooking}
        />
      )}

      {isEditingProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSave={onUpdateProfile}
        />
      )}
    </div>
  );
}

/* ---------------- Home ---------------- */
function HomeTab({ user, mainServices, nextBooking, onBook, onSeeBookings }) {
  return (
    <>
      {/* Wallet */}
      <section className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 text-black shadow-xl shadow-amber-500/10 animate-fade-in">
        <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 bg-white/20 rounded-full blur-2xl" />
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black/75">
            <Wallet className="w-4 h-4" /> M5 Wallet
          </span>
          <span className="bg-black/15 text-[10px] font-extrabold px-2 py-0.5 rounded-full">10% Cashback</span>
        </div>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-sm font-bold">Rs</span>
          <span className="text-4xl font-extrabold tracking-tight">{Math.round(user.Wallet_Balance).toLocaleString()}</span>
        </div>
        <p className="text-xs font-medium text-black/70 mt-1">Agli booking par discount ke liye use karein</p>
      </section>

      {/* Next appointment */}
      {nextBooking && (
        <button
          onClick={onSeeBookings}
          className="w-full card card-hover p-4 flex items-center gap-3 text-left animate-fade-in"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] text-yellow-400 font-bold leading-none">{relativeDay(nextBooking.Booking_Date_Time)}</span>
            <span className="text-xs font-extrabold leading-tight mt-0.5">{formatTime(nextBooking.Booking_Date_Time).replace(' ', '')}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-yellow-400 font-bold">Agli appointment</p>
            <p className="text-sm font-semibold truncate">{nextBooking.Service_Names.join(' + ')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-dim)] shrink-0" />
        </button>
      )}

      {/* Services */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-yellow-500" /> Services
          </h2>
          <span className="text-xs text-[var(--text-dim)]">{mainServices.length} available</span>
        </div>

        {mainServices.length === 0 ? (
          <p className="card p-6 text-center text-sm text-[var(--text-muted)]">Abhi koi service available nahi.</p>
        ) : (
          <div className="space-y-3">
            {mainServices.map((s) => (
              <div key={s.Service_ID} className="card card-hover p-3.5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-xl shrink-0">
                  {s.Icon || '✂️'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold leading-snug line-clamp-2">{s.Service_Name}</h3>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-yellow-500" /> {s.Duration_Minutes} min
                    <span className="mx-1 text-white/10">•</span>
                    <span className="font-bold text-yellow-400">{formatRs(s.Price)}</span>
                  </p>
                </div>
                <button
                  id={`book-${s.Service_ID}`}
                  onClick={() => onBook(s)}
                  className="btn-primary text-xs px-3.5 py-2 rounded-xl shrink-0"
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ReferralCard user={user} />
    </>
  );
}

/* ---------------- Bookings ---------------- */
function BookingsTab({ upcoming, history, onBookNew }) {
  return (
    <>
      <section>
        <h2 className="section-title mb-3">Aane wali appointments</h2>
        {upcoming.length === 0 ? (
          <div className="card p-6 text-center space-y-3">
            <CalendarDays className="w-8 h-8 text-yellow-500/50 mx-auto" />
            <p className="text-sm text-[var(--text-muted)]">Koi upcoming booking nahi</p>
            <button onClick={onBookNew} className="btn-primary text-sm px-4 py-2">Booking karein</button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => <CustomerBookingCard key={b.Booking_ID} booking={b} highlight />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title mb-3">Pichli visits</h2>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">Abhi tak koi visit nahi.</p>
        ) : (
          <div className="space-y-3">
            {history.map((b) => <CustomerBookingCard key={b.Booking_ID} booking={b} />)}
          </div>
        )}
      </section>
    </>
  );
}

function CustomerBookingCard({ booking, highlight }) {
  const cashback = Math.round(booking.Total_Bill * CASHBACK_RATE);
  return (
    <div className={`card p-4 space-y-3 ${highlight ? 'border-yellow-500/30' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold leading-snug">{booking.Service_Names.join(' + ')}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {relativeDay(booking.Booking_Date_Time)}, {formatTime(booking.Booking_Date_Time)}
          </p>
        </div>
        <StatusBadge status={booking.Status} />
      </div>
      <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
        <span className="text-[var(--text-muted)]">
          Bill: <span className="text-white font-semibold">{formatRs(booking.Final_Paid)}</span>
          {booking.Wallet_Discount > 0 && <span className="text-emerald-400"> (wallet -{formatRs(booking.Wallet_Discount)})</span>}
        </span>
        {booking.Status === 'Completed' && (
          <span className="text-emerald-400 font-semibold whitespace-nowrap">+{formatRs(cashback)} cashback</span>
        )}
        {booking.Status === 'Pending' && (
          <span className="text-yellow-300/80 whitespace-nowrap">+{formatRs(cashback)} milega</span>
        )}
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */
function ProfileTab({ user, history, onEdit, onLogout }) {
  const completed = history.filter((b) => b.Status === 'Completed');
  const totalCashback = completed.reduce((s, b) => s + Math.round(b.Total_Bill * CASHBACK_RATE), 0);
  const lastVisit = completed[0]?.Booking_Date_Time;

  return (
    <>
      <section className="card p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center font-extrabold text-black text-xl shrink-0">
            {user.Name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold truncate text-white">{user.Name}</h2>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-yellow-500" /> {user.Phone_Number}
            </p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="btn-secondary text-xs px-3 py-1.5 rounded-xl border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 shrink-0"
        >
          Edit Profile
        </button>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Wallet', value: formatRs(user.Wallet_Balance), cls: 'text-yellow-400' },
          { label: 'Visits', value: completed.length, cls: 'text-white' },
          { label: 'Cashback', value: formatRs(totalCashback), cls: 'text-emerald-400' }
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`text-base font-extrabold truncate ${s.cls}`}>{s.value}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </section>

      {lastVisit && (
        <p className="text-xs text-[var(--text-muted)] text-center">Aakhri visit: {formatDate(lastVisit)}</p>
      )}

      <section className="card p-4 space-y-3">
        <h3 className="section-title flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-yellow-500" /> Cashback kaise kaam karta hai
        </h3>
        <ol className="space-y-2 text-sm text-[var(--text-muted)]">
          <li className="flex gap-2"><span className="text-yellow-400 font-bold">1.</span> App se booking karein</li>
          <li className="flex gap-2"><span className="text-yellow-400 font-bold">2.</span> Haircut complete hone par bill ka 10% wallet mein</li>
          <li className="flex gap-2"><span className="text-yellow-400 font-bold">3.</span> Agli booking par wallet se discount lein</li>
        </ol>
      </section>

      <ReferralCard user={user} />

      <button id="logout" onClick={onLogout} className="btn-secondary w-full text-rose-300 border-rose-500/20 hover:border-rose-500/40">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </>
  );
}

/* ---------------- Referral ---------------- */
function ReferralCard({ user }) {
  const [copied, setCopied] = useState(false);
  const code = user.Referral_Code || '';
  const shareText = `M5 SmartSalon par booking karein aur har haircut par 10% cashback payen! Mera referral code: ${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); } catch { /* cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <section className="rounded-3xl p-5 bg-gradient-to-br from-purple-950/80 via-indigo-950/70 to-slate-900 border border-purple-500/30">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
            <Gift className="w-4 h-4" /> Dosto ko invite karein
          </p>
          <h3 className="text-base font-bold mt-1">Apna referral code share karein</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">🎁</div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 min-w-0 bg-black/50 border border-purple-500/30 px-3 py-2.5 rounded-xl font-mono text-sm text-purple-200 font-bold tracking-wider truncate">
          {code}
        </div>
        <button onClick={copy} className="icon-btn border-purple-500/30 text-purple-200" aria-label="Copy code">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button onClick={share} className="h-[38px] px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold flex items-center gap-1.5 shrink-0 transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </section>
  );
}
