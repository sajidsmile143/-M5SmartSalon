import React, { useState } from 'react';
import { LayoutDashboard, DollarSign, Calendar, Users, Percent, CheckCircle, XCircle, Clock, Phone, Scissors, Sparkles, Filter, Plus, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminDashboard({ bookings, users, services, onUpdateStatus, onAddService, onAddCustomer }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceIsAddOn, setNewServiceIsAddOn] = useState(false);

  // High-Level Analytics Metrics Calculations
  const completedBookings = bookings.filter(b => b.Status === 'Completed');
  
  // Total Revenue
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.Final_Paid || b.Total_Bill), 0);
  
  // Total Appointments
  const totalAppointments = bookings.length;

  // Repeat Customer Percentage (users with > 1 completed booking)
  const completedCustomerCounts = {};
  completedBookings.forEach(b => {
    completedCustomerCounts[b.Customer_ID] = (completedCustomerCounts[b.Customer_ID] || 0) + 1;
  });
  
  const repeatCustomerCount = Object.values(completedCustomerCounts).filter(count => count > 1).length;
  const totalUniqueCustomers = Object.keys(completedCustomerCounts).length;
  const repeatPercentage = totalUniqueCustomers > 0
    ? Math.round((repeatCustomerCount / totalUniqueCustomers) * 100)
    : 0;

  // Total Wallet Cashback Awarded (10% of completed bills)
  const totalCashbackAwarded = Math.round(
    completedBookings.reduce((sum, b) => sum + (b.Total_Bill * 0.1), 0)
  );

  // Filtered Bookings for Timeline
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.Booking_Date_Time) - new Date(a.Booking_Date_Time)
  );

  const displayedBookings = sortedBookings.filter(b => {
    if (filterStatus === 'All') return true;
    return b.Status === filterStatus;
  });

  const handleStatusChange = (booking, newStatus) => {
    onUpdateStatus(booking.Booking_ID, newStatus);
    
    if (newStatus === 'Completed') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    onAddService({
      Service_Name: newServiceName,
      Price: parseInt(newServicePrice, 10),
      Duration_Minutes: parseInt(newServiceDuration, 10),
      Is_AddOn: newServiceIsAddOn,
      Category: newServiceIsAddOn ? 'Add-On' : 'Main Service',
      Icon: newServiceIsAddOn ? '✨' : '✂️'
    });

    setNewServiceName('');
    setNewServicePrice('');
    setShowAddServiceModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
            <LayoutDashboard className="w-4 h-4" /> Barber & Salon Management
          </div>
          <h2 className="text-2xl font-extrabold text-white">Owner & Barber Control Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Live metric tracking, today's appointments timeline & instant 10% wallet cashback rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddServiceModal(true)}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Prompt 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Total Revenue (This Month)
            </span>
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold gold-gradient-text">
            Rs {totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">↑ Live</span> From completed bookings
          </p>
        </div>

        {/* Metric 2: Total Appointments */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Total Appointments
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalAppointments}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            {completedBookings.length} completed • {bookings.filter(b => b.Status === 'Pending').length} pending
          </p>
        </div>

        {/* Metric 3: Repeat Customer Percentage */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Repeat Customer Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300">
            {repeatPercentage}%
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            {repeatCustomerCount} customers booked &gt; 1 times
          </p>
        </div>

        {/* Metric 4: Cashback Awarded */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Wallet Cashback Rewards
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            Rs {totalCashbackAwarded}
          </div>
          <p className="text-[11px] text-emerald-300 mt-1">
            10% cashback credited to customers
          </p>
        </div>

      </div>

      {/* Appointments Timeline Section Header */}
      <div className="glass-card p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Today's Appointment Schedule Timeline
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Sorted by date & time. Mark 'Completed' to trigger 10% Wallet Cashback automatically.
            </p>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 bg-[#0d1017] p-1 rounded-xl border border-[var(--border-color)] overflow-x-auto">
            {['All', 'Pending', 'Completed', 'No-Show'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-yellow-500 text-black font-bold'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Table / Cards */}
        {displayedBookings.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)] space-y-2">
            <Scissors className="w-8 h-8 text-yellow-500/40 mx-auto" />
            <p className="text-sm font-semibold">No bookings found for filter "{filterStatus}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedBookings.map((booking) => {
              const customerUser = users.find(u => u.User_ID === booking.Customer_ID);
              const formattedTime = new Date(booking.Booking_Date_Time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
              const formattedDate = new Date(booking.Booking_Date_Time).toLocaleDateString();

              return (
                <div
                  key={booking.Booking_ID}
                  className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-yellow-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Customer & Time Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-bold text-yellow-400 text-sm shrink-0">
                      {booking.Customer_Name.charAt(0)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{booking.Customer_Name}</h4>
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-yellow-500" /> {booking.Customer_Phone}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] font-medium">
                        Services: <span className="text-white font-semibold">{booking.Service_Names.join(" + ")}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-dim)]">
                        <span>🕒 {formattedTime} ({formattedDate})</span>
                        {customerUser && (
                          <span className="text-emerald-400 font-semibold">
                            💳 Wallet: Rs {customerUser.Wallet_Balance}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Status Controls */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-[var(--text-muted)]">Total Bill</div>
                      <div className="text-base font-extrabold gold-gradient-text">
                        Rs {booking.Total_Bill}
                      </div>
                      {booking.Wallet_Discount > 0 && (
                        <div className="text-[10px] text-emerald-400">
                          (Rs {booking.Wallet_Discount} Wallet Discount)
                        </div>
                      )}
                    </div>

                    {/* Status Badge & Toggles */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                        booking.Status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : booking.Status === 'No-Show'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {booking.Status}
                      </span>

                      {/* Status Actions Buttons */}
                      {booking.Status === 'Pending' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStatusChange(booking, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer"
                            title="Mark Completed (Awards 10% Wallet Cashback)"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(booking, 'No-Show')}
                            className="bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                            title="Mark No-Show"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#12151e] border border-[var(--border-color)] rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-yellow-500" />
              Add New Salon Service
            </h3>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keratin Treatment"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-black/50 border border-[var(--border-color)] rounded-xl p-2.5 text-white outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Price (Rs)</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full bg-black/50 border border-[var(--border-color)] rounded-xl p-2.5 text-white outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full bg-black/50 border border-[var(--border-color)] rounded-xl p-2.5 text-white outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="add-on-toggle"
                  checked={newServiceIsAddOn}
                  onChange={(e) => setNewServiceIsAddOn(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                />
                <label htmlFor="add-on-toggle" className="text-white font-medium cursor-pointer">
                  Is this an Add-On Service? (Shows in 'Enhance Your Session')
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
