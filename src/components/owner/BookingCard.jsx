import React from 'react';
import { Phone, Clock, CircleCheck, CircleX, Wallet } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { formatRs, formatTime, relativeDay, CASHBACK_RATE } from '../../lib/format';

export default function BookingCard({ booking, customer, onUpdateStatus, showDate = true }) {
  const cashback = Math.round(booking.Total_Bill * CASHBACK_RATE);

  const markNoShow = () => {
    if (window.confirm(`${booking.Customer_Name} ko No-Show mark karein?`)) {
      onUpdateStatus(booking.Booking_ID, 'No-Show');
    }
  };

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Time block */}
      <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:w-20 shrink-0 sm:text-center">
        <span className="text-base font-extrabold text-white">{formatTime(booking.Booking_Date_Time)}</span>
        {showDate && <span className="text-xs text-[var(--text-muted)]">{relativeDay(booking.Booking_Date_Time)}</span>}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 sm:border-l sm:border-[var(--border-color)] sm:pl-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold">{booking.Customer_Name}</h3>
          <a href={`tel:${booking.Customer_Phone}`} className="text-xs text-[var(--text-muted)] hover:text-yellow-400 flex items-center gap-1">
            <Phone className="w-3 h-3" /> {booking.Customer_Phone}
          </a>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-1 break-words">{booking.Service_Names.join(' + ')}</p>
        {customer && (
          <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Wallet: {formatRs(customer.Wallet_Balance)}
          </p>
        )}
      </div>

      {/* Bill + actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
        <div className="sm:text-right">
          <p className="text-base font-extrabold gold-gradient-text">{formatRs(booking.Final_Paid)}</p>
          {booking.Wallet_Discount > 0 ? (
            <p className="text-[11px] text-emerald-400">Wallet -{formatRs(booking.Wallet_Discount)}</p>
          ) : (
            <p className="text-[11px] text-[var(--text-dim)]">Cash le lein</p>
          )}
        </div>

        {booking.Status === 'Pending' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStatus(booking.Booking_ID, 'Completed')}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              title={`Complete karein (+${formatRs(cashback)} cashback)`}
            >
              <CircleCheck className="w-4 h-4" /> Complete
            </button>
            <button
              onClick={markNoShow}
              className="h-9 w-9 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center justify-center transition-colors"
              title="No-Show"
              aria-label="No-Show"
            >
              <CircleX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <StatusBadge status={booking.Status} />
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Clock, title, text, action }) {
  return (
    <div className="card p-8 text-center space-y-2">
      <Icon className="w-9 h-9 text-yellow-500/40 mx-auto" />
      <p className="text-sm font-semibold">{title}</p>
      {text && <p className="text-xs text-[var(--text-muted)]">{text}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
