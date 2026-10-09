import React, { useState } from 'react';
import { Wallet, Gift, Plus, Check, Scissors, Clock, Sparkles, X, ChevronRight, User, ShieldCheck, Share2, Copy, CheckCircle2, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerApp({ users, services, onCreateBooking, activeUser, setActiveUser }) {
  const [selectedMainService, setSelectedMainService] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [useWallet, setUseWallet] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(null);

  // Filter main services vs add-on services
  const mainServices = services.filter(s => !s.Is_AddOn);
  const addOnServices = services.filter(s => s.Is_AddOn);

  // Calculate bill details
  const mainPrice = selectedMainService ? selectedMainService.Price : 0;
  const addOnsPrice = selectedAddOns.reduce((sum, item) => sum + item.Price, 0);
  const subtotal = mainPrice + addOnsPrice;

  // Wallet math
  const availableWallet = activeUser ? activeUser.Wallet_Balance : 0;
  const walletDiscount = useWallet ? Math.min(subtotal, availableWallet) : 0;
  const finalBill = Math.max(0, subtotal - walletDiscount);

  // Total estimated duration
  const totalDuration = (selectedMainService ? selectedMainService.Duration_Minutes : 0) +
    selectedAddOns.reduce((sum, item) => sum + item.Duration_Minutes, 0);

  const handleOpenBooking = (service) => {
    setSelectedMainService(service);
    setSelectedAddOns([]);
    setUseWallet(false);
    setIsCheckoutOpen(true);
  };

  const toggleAddOn = (addOn) => {
    if (selectedAddOns.some(a => a.Service_ID === addOn.Service_ID)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.Service_ID !== addOn.Service_ID));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedMainService) return;

    const allServiceIds = [
      selectedMainService.Service_ID,
      ...selectedAddOns.map(a => a.Service_ID)
    ];

    const allServiceNames = [
      selectedMainService.Service_Name,
      ...selectedAddOns.map(a => a.Service_Name)
    ];

    const newBooking = {
      Customer_ID: activeUser.User_ID,
      Customer_Name: activeUser.Name,
      Customer_Phone: activeUser.Phone_Number,
      Service_Ids: allServiceIds,
      Service_Names: allServiceNames,
      Total_Bill: subtotal,
      Wallet_Discount: walletDiscount,
      Final_Paid: finalBill,
      Booking_Date_Time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      Status: 'Pending'
    };

    onCreateBooking(newBooking, walletDiscount);
    setIsCheckoutOpen(false);

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setBookingSuccessMsg(`Booking Confirmed! Paid Rs ${finalBill} (Saved Rs ${walletDiscount} via Wallet)`);
    setTimeout(() => setBookingSuccessMsg(null), 5000);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(activeUser.Referral_Code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const appContent = (
    <div className="flex flex-col h-full bg-[var(--bg-dark)] text-white font-sans pb-16">
      
      {/* Top App Header & User Profile Selector */}
      <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center font-bold text-black text-sm">
            {activeUser ? activeUser.Name.charAt(0) : 'U'}
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium">Welcome back 👋</p>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              {activeUser?.Name || 'Valued Customer'}
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-medium">
                VIP
              </span>
            </h2>
          </div>
        </div>

        {/* Switch active customer demo user */}
        <select
          value={activeUser?.User_ID}
          onChange={(e) => {
            const selected = users.find(u => u.User_ID === e.target.value);
            if (selected) setActiveUser(selected);
          }}
          className="bg-black/40 border border-[var(--border-color)] text-xs text-yellow-400 px-2 py-1 rounded-lg outline-none font-medium cursor-pointer"
        >
          {users.filter(u => u.Role === 'Customer').map(u => (
            <option key={u.User_ID} value={u.User_ID} className="bg-[#12151e] text-white">
              {u.Name}
            </option>
          ))}
        </select>
      </div>

      {/* Main App Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Success Alert Banner */}
        {bookingSuccessMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{bookingSuccessMsg}</span>
          </div>
        )}

        {/* Prominent Wallet Balance Visual Card */}
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-yellow-500 via-amber-600 to-amber-800 text-black shadow-xl shadow-amber-500/10">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-black" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-black/80">
                M5 Smart Wallet
              </span>
            </div>
            <span className="bg-black/20 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              10% Cashback Active
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold">Rs</span>
            <span className="text-3xl font-extrabold tracking-tight">
              {activeUser?.Wallet_Balance.toLocaleString()}
            </span>
          </div>

          <p className="text-[11px] font-medium text-black/70 mt-1">
            Auto-redeem at checkout or earn 10% back on every haircut!
          </p>
        </div>

        {/* Section Header: Main Salon Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-yellow-500" />
              Select Main Service
            </h3>
            <span className="text-xs text-yellow-400 font-semibold">{mainServices.length} Services</span>
          </div>

          {/* Main Services List */}
          <div className="space-y-3">
            {mainServices.map((service) => (
              <div
                key={service.Service_ID}
                className="glass-card p-4 flex items-center justify-between hover:border-yellow-500/50 transition-all cursor-pointer group"
                onClick={() => handleOpenBooking(service)}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {service.Icon || '✂️'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
                      {service.Service_Name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-yellow-500" /> {service.Duration_Minutes} mins
                      </span>
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[10px]">
                        {service.Category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="text-base font-extrabold gold-gradient-text">
                    Rs {service.Price}
                  </span>
                  <button
                    className="mt-1 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-xl hover:bg-yellow-400 transition-all shadow-md shadow-yellow-500/20 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBooking(service);
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highly Visible "Refer & Earn" Banner */}
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900 border border-purple-500/30">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Refer & Earn Rs 200</span>
              </div>
              <h4 className="text-sm font-extrabold text-white">Invite Friends to M5 Salon</h4>
              <p className="text-xs text-[var(--text-muted)] max-w-[240px]">
                Share your code. When your friend gets a haircut, you both get Rs 200 wallet credit!
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
              🎁
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between gap-2">
            <div className="bg-black/60 border border-purple-500/30 px-3 py-1.5 rounded-xl font-mono text-xs text-purple-300 font-bold tracking-wider">
              {activeUser?.Referral_Code || 'SMART500'}
            </div>
            <button
              onClick={handleCopyReferral}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Summary Sheet & Add-On Modal */}
      {isCheckoutOpen && selectedMainService && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-0 md:p-4">
          <div className="w-full max-w-lg bg-[#12151e] border border-[var(--border-color)] rounded-t-3xl md:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Enhance Your Session
                </h3>
                <p className="text-xs text-[var(--text-muted)]">Select quick add-ons & apply wallet discount</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-white rounded-full bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Main Service Summary */}
            <div className="bg-[var(--bg-surface)] p-3.5 rounded-2xl border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-extrabold">Primary Booking</span>
                <h4 className="text-sm font-bold text-white">{selectedMainService.Service_Name}</h4>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-yellow-500" /> {selectedMainService.Duration_Minutes} mins
                </span>
              </div>
              <span className="text-base font-bold gold-gradient-text">Rs {selectedMainService.Price}</span>
            </div>

            {/* Prompt 3 Add-On Services List */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                Quick Add-On Services (Tap + to add)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {addOnServices.map((addOn) => {
                  const isAdded = selectedAddOns.some(a => a.Service_ID === addOn.Service_ID);
                  return (
                    <div
                      key={addOn.Service_ID}
                      onClick={() => toggleAddOn(addOn)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isAdded
                          ? 'bg-yellow-500/10 border-yellow-500/60'
                          : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${
                          isAdded ? 'bg-yellow-500 text-black font-bold' : 'bg-white/5 text-white'
                        }`}>
                          {isAdded ? <Check className="w-4 h-4" /> : addOn.Icon}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{addOn.Service_Name}</h5>
                          <span className="text-[10px] text-[var(--text-muted)]">{addOn.Duration_Minutes} mins</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-yellow-400">+ Rs {addOn.Price}</span>
                        <button
                          type="button"
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                            isAdded
                              ? 'bg-yellow-500 text-black'
                              : 'bg-white/10 text-white hover:bg-yellow-500 hover:text-black'
                          }`}
                        >
                          {isAdded ? '✓' : '+'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt 3 Wallet Discount Toggle */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Use Wallet Balance</h5>
                  <p className="text-[11px] text-emerald-300">
                    Available: <span className="font-bold">Rs {availableWallet}</span>
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWallet}
                  disabled={availableWallet <= 0}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Final Bill Breakdown */}
            <div className="bg-black/50 p-4 rounded-2xl space-y-2 text-xs border border-[var(--border-color)]">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Subtotal ({1 + selectedAddOns.length} items)</span>
                <span>Rs {subtotal}</span>
              </div>
              
              {useWallet && walletDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Wallet Discount Applied</span>
                  <span>- Rs {walletDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>Estimated Duration</span>
                <span>{totalDuration} minutes</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline text-sm font-extrabold text-white">
                <span>Total Payable</span>
                <span className="text-lg gold-gradient-text">Rs {finalBill}</span>
              </div>
            </div>

            {/* Confirmation Button */}
            <button
              onClick={handleConfirmBooking}
              className="w-full btn-primary text-sm py-3.5 rounded-2xl shadow-xl shadow-yellow-500/20"
            >
              Confirm Appointment • Rs {finalBill}
            </button>

          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="py-6 px-4">
      {/* Device Frame Toggle Header */}
      <div className="max-w-md mx-auto mb-4 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
          <Smartphone className="w-4 h-4 text-yellow-500" />
          PWA Mobile Simulator Mode
        </span>
        <button
          onClick={() => setShowPhoneFrame(!showPhoneFrame)}
          className="text-xs text-yellow-400 hover:underline font-semibold cursor-pointer"
        >
          {showPhoneFrame ? 'Expand Full Screen' : 'Show Phone Frame'}
        </button>
      </div>

      {showPhoneFrame ? (
        <div className="mobile-device-frame animate-fade-in">
          <div className="mobile-notch" />
          <div className="mobile-content">
            {appContent}
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto glass-card overflow-hidden">
          {appContent}
        </div>
      )}
    </div>
  );
}
