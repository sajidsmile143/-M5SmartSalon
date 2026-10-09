import React from 'react';
import { Smartphone, LayoutDashboard, MessageSquare, Database, FastForward, RotateCcw, Scissors, Sparkles } from 'lucide-react';

export default function HeaderNavbar({ currentView, setCurrentView, onFastForward, onResetDb, inactiveCount }) {
  return (
    <header className="glass-panel sticky top-0 z-50 px-4 py-3 border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 text-black font-extrabold text-xl">
            M5
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight gold-gradient-text">M5 SmartSalon</h1>
              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Operating System
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Scissors className="w-3 h-3 text-yellow-500" /> Barber Management & Customer Retention Platform
            </p>
          </div>
        </div>

        {/* Central View Switcher Tabs */}
        <nav className="flex items-center bg-[#0d1017] p-1 rounded-2xl border border-[var(--border-color)] overflow-x-auto max-w-full">
          <button
            onClick={() => setCurrentView('customer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentView === 'customer'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-md font-bold'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer PWA App</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-md font-bold'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Barber Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('marketing')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap relative ${
              currentView === 'marketing'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-md font-bold'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Retention</span>
            {inactiveCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5 animate-pulse">
                {inactiveCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('database')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentView === 'database'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-md font-bold'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB & Supabase SQL</span>
          </button>
        </nav>

        {/* Demo Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFastForward}
            title="Fast forward time by 25 days to trigger automated customer retention logic"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+25 Days Demo</span>
          </button>

          <button
            onClick={onResetDb}
            title="Reset database to initial state"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5 border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
