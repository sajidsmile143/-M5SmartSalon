import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoginScreen from './components/LoginScreen';
import CustomerApp from './components/customer/CustomerApp';
import OwnerPanel from './components/owner/OwnerPanel';
import Toast from './components/Toast';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_MARKETING_LOGS
} from './db/mockDb';
import {
  normalizePhone,
  formatPhoneDisplay,
  generateId,
  makeReferralCode,
  daysSince,
  RETENTION_DAYS,
  CASHBACK_RATE
} from './lib/format';

const SESSION_KEY = 'm5_session_user_id';
const POLL_MS = 20000;

// When Supabase is configured it is the single source of truth.
// LocalStorage + mock data is only used as an offline/demo fallback.
const loadLocal = (key, seed) => {
  if (isSupabaseConfigured) return [];
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : seed;
};

const mapUser = (u) => ({
  User_ID: u.user_id,
  Name: u.name,
  Phone_Number: u.phone_number,
  Role: u.role,
  Wallet_Balance: parseFloat(u.wallet_balance || 0),
  Referral_Code: u.referral_code,
  Last_Visit_Date: u.last_visit_date || u.created_at
});

const mapService = (s) => ({
  Service_ID: s.service_id,
  Service_Name: s.service_name,
  Price: s.price,
  Duration_Minutes: s.duration_minutes,
  Is_AddOn: s.is_add_on,
  Category: s.category || (s.is_add_on ? 'Add-On' : 'Main Service'),
  Icon: s.is_add_on ? '✨' : '✂️'
});

const mapBooking = (b) => ({
  Booking_ID: b.booking_id,
  Customer_ID: b.customer_id,
  Customer_Name: b.customer_name || 'Customer',
  Customer_Phone: b.customer_phone || '',
  Service_Ids: b.service_ids || [],
  Service_Names: b.service_names || [],
  Total_Bill: b.total_bill,
  Wallet_Discount: b.wallet_discount_used || 0,
  Final_Paid: b.final_paid ?? b.total_bill,
  Booking_Date_Time: b.booking_date_time,
  Status: b.status
});

const mapLog = (l) => ({
  Log_ID: l.log_id,
  Customer_ID: l.customer_id,
  Customer_Name: l.customer_name || 'Customer',
  Customer_Phone: l.customer_phone || '',
  Last_Visit_Date: l.last_visit_date,
  Days_Inactive: l.days_inactive,
  Message_Template: l.message_template || 'Salam! M5 SmartSalon par aap ka intizar hai!',
  Created_At: l.created_at
});

export default function App() {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const [users, setUsers] = useState(() => loadLocal('m5_users', INITIAL_USERS));
  const [services, setServices] = useState(() => loadLocal('m5_services', INITIAL_SERVICES));
  const [bookings, setBookings] = useState(() => loadLocal('m5_bookings', INITIAL_BOOKINGS));
  const [marketingLogs, setMarketingLogs] = useState(() => loadLocal('m5_marketing_logs', INITIAL_MARKETING_LOGS));

  const [sessionUserId, setSessionUserId] = useState(() => localStorage.getItem(SESSION_KEY));

  const currentUser = useMemo(
    () => users.find((u) => u.User_ID === sessionUserId) || null,
    [users, sessionUserId]
  );

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Runs a Supabase write and surfaces errors (supabase-js never throws on DB errors)
  const dbWrite = useCallback(async (label, query) => {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await query;
      if (error) {
        console.error(`${label} error:`, error);
        showToast(`${label} save nahi hua: ${error.message}`, 'error');
        return false;
      }
      return true;
    } catch (e) {
      console.error(`${label} error:`, e);
      showToast(`${label} save nahi hua (internet check karein)`, 'error');
      return false;
    }
  }, [showToast]);

  // ---------- Load data from Supabase ----------
  const fetchAll = useCallback(async ({ silent = false } = {}) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!silent) setSyncing(true);
    try {
      const [u, s, b, l] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('services').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('marketing_logs').select('*')
      ]);
      const firstError = u.error || s.error || b.error || l.error;
      if (firstError) {
        console.error('Supabase fetch error:', firstError);
        if (!silent) showToast(`Data load nahi hua: ${firstError.message}`, 'error');
      }
      if (!u.error) setUsers((u.data || []).map(mapUser));
      if (!s.error) setServices((s.data || []).map(mapService));
      if (!b.error) setBookings((b.data || []).map(mapBooking));
      if (!l.error) setMarketingLogs((l.data || []).map(mapLog));
    } catch (e) {
      console.error('Supabase fetch error:', e);
      if (!silent) showToast('Server se connect nahi ho saka', 'error');
    } finally {
      setSyncing(false);
      setReady(true);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh so the owner sees new bookings without reloading
  useEffect(() => {
    if (!isSupabaseConfigured || !sessionUserId) return;
    const id = setInterval(() => fetchAll({ silent: true }), POLL_MS);
    return () => clearInterval(id);
  }, [sessionUserId, fetchAll]);

  // Offline fallback persistence
  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('m5_users', JSON.stringify(users));
    localStorage.setItem('m5_services', JSON.stringify(services));
    localStorage.setItem('m5_bookings', JSON.stringify(bookings));
    localStorage.setItem('m5_marketing_logs', JSON.stringify(marketingLogs));
  }, [users, services, bookings, marketingLogs]);

  // ---------- Auth ----------
  const startSession = (userId) => {
    localStorage.setItem(SESSION_KEY, userId);
    setSessionUserId(userId);
  };

  const handleLogin = (phone) => {
    const target = normalizePhone(phone);
    const found = users.find((u) => normalizePhone(u.Phone_Number) === target);
    if (!found) return { ok: false, error: 'Is number se koi account nahi mila. Naya account banayein.' };
    startSession(found.User_ID);
    showToast(`Khush aamdeed, ${found.Name}!`);
    return { ok: true };
  };

  const handleSignup = async (name, phone) => {
    const target = normalizePhone(phone);
    if (users.some((u) => normalizePhone(u.Phone_Number) === target)) {
      return { ok: false, error: 'Ye number pehle se registered hai. Login karein.' };
    }
    const newUser = {
      User_ID: generateId('usr'),
      Name: name.trim(),
      Phone_Number: formatPhoneDisplay(phone),
      Role: 'Customer',
      Wallet_Balance: 0,
      Referral_Code: makeReferralCode(name),
      Last_Visit_Date: new Date().toISOString()
    };
    const ok = await dbWrite('Account', supabase?.from('users').insert([{
      user_id: newUser.User_ID,
      name: newUser.Name,
      phone_number: newUser.Phone_Number,
      role: 'Customer',
      wallet_balance: 0,
      referral_code: newUser.Referral_Code,
      last_visit_date: newUser.Last_Visit_Date
    }]));
    if (!ok) return { ok: false, error: 'Account nahi ban saka. Dobara koshish karein.' };
    setUsers((prev) => [...prev, newUser]);
    startSession(newUser.User_ID);
    showToast(`Account ban gaya! Khush aamdeed, ${newUser.Name}`);
    return { ok: true };
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionUserId(null);
  };

  // ---------- Customer: Update Profile Name ----------
  const handleUpdateProfile = async (newName) => {
    if (!currentUser) return false;
    const ok = await dbWrite('Profile', supabase?.from('users').update({ name: newName }).eq('user_id', currentUser.User_ID));
    if (!ok) return false;

    setUsers((prev) => prev.map((u) => (u.User_ID === currentUser.User_ID ? { ...u, Name: newName } : u)));
    // Also update customer_name across their bookings in state
    setBookings((prev) => prev.map((b) => (b.Customer_ID === currentUser.User_ID ? { ...b, Customer_Name: newName } : b)));
    showToast('Profile update ho gayi!');
    return true;
  };

  // ---------- Owner: Add Walk-in Customer & Optional Booking ----------
  const handleAddCustomerWalkIn = async ({ name, phone, bookingDetails }) => {
    const targetPhone = normalizePhone(phone);
    let targetUser = users.find((u) => normalizePhone(u.Phone_Number) === targetPhone);

    if (!targetUser) {
      // Create new customer
      const newUser = {
        User_ID: generateId('usr'),
        Name: name.trim(),
        Phone_Number: formatPhoneDisplay(phone),
        Role: 'Customer',
        Wallet_Balance: 0,
        Referral_Code: makeReferralCode(name),
        Last_Visit_Date: new Date().toISOString()
      };

      const ok = await dbWrite('Customer Add', supabase?.from('users').insert([{
        user_id: newUser.User_ID,
        name: newUser.Name,
        phone_number: newUser.Phone_Number,
        role: 'Customer',
        wallet_balance: 0,
        referral_code: newUser.Referral_Code,
        last_visit_date: newUser.Last_Visit_Date
      }]));

      if (!ok) return { success: false, error: 'Customer create nahi ho saka.' };
      setUsers((prev) => [...prev, newUser]);
      targetUser = newUser;
    }

    // If walk-in booking is requested
    if (bookingDetails) {
      const booking = {
        Booking_ID: generateId('bk'),
        Customer_ID: targetUser.User_ID,
        Customer_Name: targetUser.Name,
        Customer_Phone: targetUser.Phone_Number,
        Service_Ids: bookingDetails.Service_Ids,
        Service_Names: bookingDetails.Service_Names,
        Total_Bill: bookingDetails.Total_Bill,
        Wallet_Discount: 0,
        Final_Paid: bookingDetails.Total_Bill,
        Booking_Date_Time: new Date().toISOString(),
        Status: 'Pending'
      };

      const ok = await dbWrite('Walk-in Booking', supabase?.from('bookings').insert([{
        booking_id: booking.Booking_ID,
        customer_id: booking.Customer_ID,
        customer_name: booking.Customer_Name,
        customer_phone: booking.Customer_Phone,
        service_ids: booking.Service_Ids,
        service_names: booking.Service_Names,
        total_bill: booking.Total_Bill,
        wallet_discount_used: 0,
        final_paid: booking.Final_Paid,
        booking_date_time: booking.Booking_Date_Time,
        status: 'Pending'
      }]));

      if (!ok) return { success: false, error: 'Customer add hua magar booking nahi ban saki.' };
      setBookings((prev) => [booking, ...prev]);
      showToast(`${targetUser.Name} ki walk-in booking add ho gayi! ✂️`);
    } else {
      showToast(`${targetUser.Name} customer list mein add ho gaya!`);
    }

    return { success: true };
  };

  // ---------- Customer: create booking ----------
  const handleCreateBooking = async (data, walletUsed) => {
    const booking = { Booking_ID: generateId('bk'), ...data, Status: 'Pending' };
    const customer = users.find((u) => u.User_ID === data.Customer_ID);
    const newWallet = Math.max(0, (customer?.Wallet_Balance || 0) - walletUsed);

    const ok = await dbWrite('Booking', supabase?.from('bookings').insert([{
      booking_id: booking.Booking_ID,
      customer_id: booking.Customer_ID,
      customer_name: booking.Customer_Name,
      customer_phone: booking.Customer_Phone,
      service_ids: booking.Service_Ids,
      service_names: booking.Service_Names,
      total_bill: booking.Total_Bill,
      wallet_discount_used: walletUsed,
      final_paid: booking.Final_Paid,
      booking_date_time: booking.Booking_Date_Time,
      status: 'Pending'
    }]));
    if (!ok) return false;

    setBookings((prev) => [booking, ...prev]);

    if (walletUsed > 0) {
      setUsers((prev) => prev.map((u) => (u.User_ID === data.Customer_ID ? { ...u, Wallet_Balance: newWallet } : u)));
      await dbWrite('Wallet', supabase?.from('users').update({ wallet_balance: newWallet }).eq('user_id', data.Customer_ID));
    }
    showToast('Booking confirm ho gayi! ✂️');
    return true;
  };

  // ---------- Owner: complete / no-show ----------
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const booking = bookings.find((b) => b.Booking_ID === bookingId);
    if (!booking || booking.Status !== 'Pending') return;
    const customer = users.find((u) => u.User_ID === booking.Customer_ID);

    const ok = await dbWrite('Status', supabase?.from('bookings').update({ status: newStatus }).eq('booking_id', bookingId));
    if (!ok) return;

    setBookings((prev) => prev.map((b) => (b.Booking_ID === bookingId ? { ...b, Status: newStatus } : b)));
    if (!customer) return;

    if (newStatus === 'Completed') {
      // 10% cashback on the full bill + reset retention clock
      const cashback = Math.round(booking.Total_Bill * CASHBACK_RATE);
      const nowIso = new Date().toISOString();
      const newWallet = customer.Wallet_Balance + cashback;
      setUsers((prev) => prev.map((u) => (
        u.User_ID === customer.User_ID ? { ...u, Wallet_Balance: newWallet, Last_Visit_Date: nowIso } : u
      )));
      await dbWrite('Cashback', supabase?.from('users')
        .update({ wallet_balance: newWallet, last_visit_date: nowIso })
        .eq('user_id', customer.User_ID));
      showToast(`Complete! ${customer.Name} ko Rs ${cashback} cashback mil gaya`);
    }

    if (newStatus === 'No-Show' && booking.Wallet_Discount > 0) {
      // Return wallet money that was reserved for this booking
      const newWallet = customer.Wallet_Balance + booking.Wallet_Discount;
      setUsers((prev) => prev.map((u) => (u.User_ID === customer.User_ID ? { ...u, Wallet_Balance: newWallet } : u)));
      await dbWrite('Wallet refund', supabase?.from('users').update({ wallet_balance: newWallet }).eq('user_id', customer.User_ID));
      showToast(`No-Show mark ho gaya. Rs ${booking.Wallet_Discount} wallet mein wapas`, 'info');
    } else if (newStatus === 'No-Show') {
      showToast('No-Show mark ho gaya', 'info');
    }
  };

  // ---------- Owner: 25-day retention scan ----------
  const runRetentionScan = async () => {
    const newLogs = [];
    for (const user of users) {
      if (user.Role !== 'Customer') continue;
      const days = daysSince(user.Last_Visit_Date) ?? RETENTION_DAYS + 1;
      if (days < RETENTION_DAYS) continue;

      // One alert per customer per inactive streak (since their last visit)
      const alreadyAlerted = marketingLogs.some((l) =>
        l.Customer_ID === user.User_ID &&
        new Date(l.Created_At || 0).getTime() >= new Date(user.Last_Visit_Date || 0).getTime()
      );
      if (alreadyAlerted) continue;

      const log = {
        Log_ID: generateId('log'),
        Customer_ID: user.User_ID,
        Customer_Name: user.Name,
        Customer_Phone: user.Phone_Number,
        Last_Visit_Date: user.Last_Visit_Date,
        Days_Inactive: days,
        Message_Template: `Salam ${user.Name}! 💈 M5 SmartSalon par aap ki pichli visit ko ${days} din ho gaye hain. Aaj hi appointment book karein aur apna Rs ${Math.round(user.Wallet_Balance)} wallet balance use karein! Har haircut par 10% cashback. Referral Code: ${user.Referral_Code}`,
        Created_At: new Date().toISOString()
      };

      const ok = await dbWrite('Marketing log', supabase?.from('marketing_logs').insert([{
        log_id: log.Log_ID,
        customer_id: log.Customer_ID,
        customer_name: log.Customer_Name,
        customer_phone: log.Customer_Phone,
        last_visit_date: log.Last_Visit_Date,
        days_inactive: log.Days_Inactive,
        message_template: log.Message_Template
      }]));
      if (ok) newLogs.push(log);
    }

    if (newLogs.length > 0) {
      setMarketingLogs((prev) => [...newLogs, ...prev]);
      showToast(`${newLogs.length} naye customers ke liye WhatsApp message tayar`);
    } else {
      showToast('Koi naya inactive customer nahi mila', 'info');
    }
  };

  // ---------- Owner: services ----------
  const handleSaveService = async (service) => {
    const isEdit = Boolean(service.Service_ID);
    const record = {
      ...service,
      Service_ID: service.Service_ID || generateId('srv'),
      Category: service.Is_AddOn ? 'Add-On' : (service.Category || 'Main Service'),
      Icon: service.Is_AddOn ? '✨' : '✂️'
    };
    const row = {
      service_name: record.Service_Name,
      price: record.Price,
      duration_minutes: record.Duration_Minutes,
      is_add_on: record.Is_AddOn,
      category: record.Category
    };
    const ok = isEdit
      ? await dbWrite('Service', supabase?.from('services').update(row).eq('service_id', record.Service_ID))
      : await dbWrite('Service', supabase?.from('services').insert([{ service_id: record.Service_ID, ...row }]));
    if (!ok) return false;

    setServices((prev) => (isEdit
      ? prev.map((s) => (s.Service_ID === record.Service_ID ? record : s))
      : [...prev, record]));
    showToast(isEdit ? 'Service update ho gayi' : 'Nayi service add ho gayi');
    return true;
  };

  const handleDeleteService = async (serviceId) => {
    const ok = await dbWrite('Service delete', supabase?.from('services').delete().eq('service_id', serviceId));
    if (!ok) return;
    setServices((prev) => prev.filter((s) => s.Service_ID !== serviceId));
    showToast('Service hata di gayi', 'info');
  };

  // ---------- Render ----------
  if (!ready) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-extrabold text-black text-xl animate-pulse">
          M5
        </div>
        <p className="text-sm text-[var(--text-muted)]">Salon data load ho raha hai...</p>
      </div>
    );
  }

  let screen;
  if (!currentUser) {
    screen = <LoginScreen users={users} onLogin={handleLogin} onSignup={handleSignup} />;
  } else if (currentUser.Role === 'Customer') {
    screen = (
      <CustomerApp
        user={currentUser}
        services={services}
        myBookings={bookings.filter((b) => b.Customer_ID === currentUser.User_ID)}
        takenSlots={bookings.filter((b) => b.Status === 'Pending').map((b) => b.Booking_Date_Time)}
        onCreateBooking={handleCreateBooking}
        onUpdateProfile={handleUpdateProfile}
        onRefresh={() => fetchAll()}
        syncing={syncing}
        onLogout={handleLogout}
      />
    );
  } else {
    screen = (
      <OwnerPanel
        user={currentUser}
        users={users}
        services={services}
        bookings={bookings}
        marketingLogs={marketingLogs}
        onUpdateStatus={handleUpdateBookingStatus}
        onSaveService={handleSaveService}
        onDeleteService={handleDeleteService}
        onAddCustomer={handleAddCustomerWalkIn}
        onRunRetentionScan={runRetentionScan}
        onRefresh={() => fetchAll()}
        syncing={syncing}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      {screen}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
