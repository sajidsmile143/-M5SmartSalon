import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  LayoutDashboard, CalendarDays, Scissors, Users, MessageSquare, Database, LogOut, RefreshCw
} from 'lucide-react';
import DashboardPage from './DashboardPage';
import AppointmentsPage from './AppointmentsPage';
import ServicesPage from './ServicesPage';
import CustomersPage from './CustomersPage';
import RetentionPage from './RetentionPage';
import AddCustomerModal from './AddCustomerModal';
import { daysSince, RETENTION_DAYS } from '../../lib/format';

// Developer-only database viewer (never shipped to owners in production builds)
const DatabaseInspector = import.meta.env.DEV ? lazy(() => import('../DatabaseInspector')) : null;

export default function OwnerPanel(props) {
  const { user, users, bookings, marketingLogs, onLogout, onRefresh, syncing, onAddCustomer } = props;
  const [page, setPage] = useState('dashboard');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const pendingCount = bookings.filter((b) => b.Status === 'Pending').length;
  const inactiveCount = useMemo(
    () => users.filter((u) => u.Role === 'Customer' && (daysSince(u.Last_Visit_Date) ?? 0) >= RETENTION_DAYS).length,
    [users]
  );

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', short: 'Bookings', icon: CalendarDays, badge: pendingCount },
    { id: 'customers', label: 'Customers', short: 'Clients', icon: Users },
    { id: 'services', label: 'Services', short: 'Services', icon: Scissors },
    { id: 'retention', label: 'WhatsApp Retention', short: 'WhatsApp', icon: MessageSquare, badge: inactiveCount },
    ...(DatabaseInspector ? [{ id: 'database', label: 'Database (Dev)', short: 'DB', icon: Database, devOnly: true }] : [])
  ];
  const mobileNav = NAV.filter((n) => !n.devOnly);
  const current = NAV.find((n) => n.id === page) || NAV[0];

  const renderPage = () => {
    switch (page) {
      case 'appointments': return <AppointmentsPage {...props} />;
      case 'customers': return <CustomersPage {...props} onOpenAddCustomer={() => setIsAddCustomerOpen(true)} />;
      case 'services': return <ServicesPage {...props} />;
      case 'retention': return <RetentionPage {...props} />;
      case 'database':
        return DatabaseInspector ? (
          <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">Loading...</p>}>
            <DatabaseInspector users={users} services={props.services} bookings={bookings} marketingLogs={marketingLogs} />
          </Suspense>
        ) : null;
      default:
        return (
          <DashboardPage
            {...props}
            inactiveCount={inactiveCount}
            onNavigate={setPage}
            onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-dvh flex bg-[var(--bg-dark)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-[var(--border-color)] bg-[#0c0f16] z-30">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border-color)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 flex items-center justify-center font-extrabold text-black text-sm">M5</div>
          <div className="min-w-0">
            <p className="font-bold leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>SmartSalon</p>
            <p className="text-[11px] text-yellow-400 font-semibold">Owner Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon, badge, devOnly }) => {
            const active = page === id;
            return (
              <button
                key={id}
                id={`owner-nav-${id}`}
                onClick={() => setPage(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5 border border-transparent'
                } ${devOnly ? 'mt-4 opacity-70' : ''}`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1 text-left truncate">{label}</span>
                {badge > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-yellow-500 text-black text-[11px] font-bold flex items-center justify-center">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center font-bold text-yellow-300 shrink-0">
              {user.Name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.Name}</p>
              <p className="text-[11px] text-[var(--text-dim)]">{user.Role}</p>
            </div>
            <button onClick={onLogout} className="icon-btn" title="Logout" aria-label="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col">
        <header className="sticky top-0 z-20 glass-panel border-x-0 border-t-0 h-16 px-4 md:px-6 flex items-center gap-3">
          <div className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 flex items-center justify-center font-extrabold text-black text-sm shrink-0">M5</div>
          <h1 className="flex-1 min-w-0 text-lg md:text-xl font-bold truncate">{current.label}</h1>
          <button onClick={onRefresh} className="icon-btn" title="Refresh data" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="icon-btn lg:hidden" title="Logout" aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 pb-28 lg:pb-8 animate-fade-in" key={page}>
          {renderPage()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-panel border-x-0 border-b-0 safe-bottom">
        <div className="grid grid-cols-5">
          {mobileNav.map(({ id, short, icon: Icon, badge }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                  active ? 'text-yellow-400' : 'text-[var(--text-dim)]'
                }`}
              >
                {active && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-yellow-400" />}
                <Icon className="w-5 h-5" />
                {short}
                {badge > 0 && (
                  <span className="absolute top-1.5 left-1/2 ml-1.5 min-w-4 h-4 px-1 rounded-full bg-yellow-500 text-black text-[9px] font-bold flex items-center justify-center">{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {isAddCustomerOpen && (
        <AddCustomerModal
          services={props.services}
          onClose={() => setIsAddCustomerOpen(false)}
          onSubmit={onAddCustomer}
        />
      )}
    </div>
  );
}
