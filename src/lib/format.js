// Shared formatting & helper utilities for M5 SmartSalon

export const formatRs = (n) => `Rs ${Math.round(Number(n) || 0).toLocaleString('en-PK')}`;

export const daysSince = (iso) => {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
};

/** Converts any Pakistani number format to digits like 923001234567 */
export const normalizePhone = (phone = '') => {
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('0092')) d = d.slice(2);
  if (d.startsWith('0')) d = '92' + d.slice(1);
  if (d.length === 10 && d.startsWith('3')) d = '92' + d;
  return d;
};

export const isValidPkMobile = (phone) => {
  const d = normalizePhone(phone);
  return d.length === 12 && d.startsWith('923');
};

/** 923001234567 -> "+92 300 1234567" */
export const formatPhoneDisplay = (phone) => {
  const d = normalizePhone(phone);
  if (d.length !== 12) return phone;
  return `+92 ${d.slice(2, 5)} ${d.slice(5)}`;
};

export const generateId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const makeReferralCode = (name = '') => {
  const base = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) || 'M5';
  return `${base}${Math.floor(100 + Math.random() * 900)}`;
};

export const isSameDay = (a, b) => {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
};

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const relativeDay = (iso) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(iso, today)) return 'Aaj';
  if (isSameDay(iso, tomorrow)) return 'Kal';
  if (isSameDay(iso, yesterday)) return 'Kal (guzra)';
  return formatDate(iso);
};

export const daysAgoLabel = (iso) => {
  const d = daysSince(iso);
  if (d === null) return 'Kabhi nahi';
  if (d <= 0) return 'Aaj';
  if (d === 1) return '1 din pehle';
  return `${d} din pehle`;
};

export const whatsappLink = (phone, text = '') => {
  const d = normalizePhone(phone);
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export const RETENTION_DAYS = 25;
export const CASHBACK_RATE = 0.1;
