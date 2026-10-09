import React, { useState } from 'react';
import { Database, Copy, Check, Table, Code, Sparkles, Layers } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../db/mockDb';

export default function DatabaseInspector({ users, services, bookings, marketingLogs }) {
  const [activeTab, setActiveTab] = useState('users');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
            <Database className="w-4 h-4" /> Prompt 1: Relational Database Architecture
          </div>
          <h2 className="text-2xl font-extrabold text-white">Database Inspector & Supabase SQL</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Inspect live relational state for Users, Services, Bookings, and Marketing_Logs tables
          </p>
        </div>

        <button
          onClick={handleCopySql}
          className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/20"
        >
          {copiedSql ? (
            <>
              <Check className="w-4 h-4 text-black" />
              <span>Supabase SQL Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Supabase SQL Schema</span>
            </>
          )}
        </button>
      </div>

      {/* Relational Table Selector Tabs */}
      <div className="flex items-center gap-2 bg-[#0d1017] p-1.5 rounded-2xl border border-[var(--border-color)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>1. Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>2. Services ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>3. Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'marketing'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>4. Marketing_Logs ({marketingLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sql'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Supabase SQL Script</span>
        </button>
      </div>

      {/* Active Table Viewer */}
      <div className="glass-card p-5 overflow-x-auto">
        {activeTab === 'users' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[var(--text-muted)]">
              Table: Users (UUID, Name, Phone_Number, Role, Wallet_Balance, Referral_Code, Last_Visit_Date)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[var(--text-muted)] uppercase text-[10px]">
                  <th className="p-3">User_ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone_Number</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Wallet_Balance</th>
                  <th className="p-3">Referral_Code</th>
                  <th className="p-3">Last_Visit_Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white font-mono">
                {users.map((u) => (
                  <tr key={u.User_ID} className="hover:bg-white/5">
                    <td className="p-3 text-yellow-400 font-bold">{u.User_ID}</td>
                    <td className="p-3 font-sans font-semibold text-white">{u.Name}</td>
                    <td className="p-3 text-[var(--text-muted)]">{u.Phone_Number}</td>
                    <td className="p-3">
                      <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px]">
                        {u.Role}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">Rs {u.Wallet_Balance}</td>
                    <td className="p-3 text-purple-300 font-bold">{u.Referral_Code}</td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(u.Last_Visit_Date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[var(--text-muted)]">
              Table: Services (Service_ID, Service_Name, Price, Duration_Minutes, Is_AddOn)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[var(--text-muted)] uppercase text-[10px]">
                  <th className="p-3">Service_ID</th>
                  <th className="p-3">Service_Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Is_AddOn</th>
                  <th className="p-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white font-mono">
                {services.map((s) => (
                  <tr key={s.Service_ID} className="hover:bg-white/5">
                    <td className="p-3 text-yellow-400 font-bold">{s.Service_ID}</td>
                    <td className="p-3 font-sans font-semibold text-white">
                      {s.Icon} {s.Service_Name}
                    </td>
                    <td className="p-3 gold-gradient-text font-bold">Rs {s.Price}</td>
                    <td className="p-3 text-[var(--text-muted)]">{s.Duration_Minutes} mins</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.Is_AddOn
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {s.Is_AddOn ? 'TRUE (Add-On)' : 'FALSE (Main)'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{s.Category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[var(--text-muted)]">
              Table: Bookings (Booking_ID, Customer_ID, Service_Ids, Total_Bill, Booking_Date_Time, Status)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[var(--text-muted)] uppercase text-[10px]">
                  <th className="p-3">Booking_ID</th>
                  <th className="p-3">Customer_ID</th>
                  <th className="p-3">Services</th>
                  <th className="p-3">Total_Bill</th>
                  <th className="p-3">Wallet_Used</th>
                  <th className="p-3">Final_Paid</th>
                  <th className="p-3">Booking_Date_Time</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white font-mono">
                {bookings.map((b) => (
                  <tr key={b.Booking_ID} className="hover:bg-white/5">
                    <td className="p-3 text-yellow-400 font-bold">{b.Booking_ID}</td>
                    <td className="p-3 text-[var(--text-muted)]">{b.Customer_Name} ({b.Customer_ID})</td>
                    <td className="p-3 font-sans text-white font-medium">
                      {b.Service_Names ? b.Service_Names.join(", ") : b.Service_Ids.join(", ")}
                    </td>
                    <td className="p-3 gold-gradient-text font-bold">Rs {b.Total_Bill}</td>
                    <td className="p-3 text-emerald-400">Rs {b.Wallet_Discount || 0}</td>
                    <td className="p-3 text-white font-bold">Rs {b.Final_Paid || b.Total_Bill}</td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(b.Booking_Date_Time).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.Status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : b.Status === 'No-Show'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {b.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[var(--text-muted)]">
              Table: Marketing_Logs (Log_ID, Customer_ID, Last_Visit_Date, Days_Inactive)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[var(--text-muted)] uppercase text-[10px]">
                  <th className="p-3">Log_ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Days_Inactive</th>
                  <th className="p-3">Last_Visit_Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white font-mono">
                {marketingLogs.map((l) => (
                  <tr key={l.Log_ID} className="hover:bg-white/5">
                    <td className="p-3 text-yellow-400 font-bold">{l.Log_ID}</td>
                    <td className="p-3 font-sans font-semibold text-white">{l.Customer_Name}</td>
                    <td className="p-3 text-[var(--text-muted)]">{l.Customer_Phone}</td>
                    <td className="p-3 text-rose-400 font-extrabold">{l.Days_Inactive} Days</td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(l.Last_Visit_Date).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        {l.Status || 'Alert Triggered'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                Supabase PostgreSQL Migration Script
              </h3>
              <button
                onClick={handleCopySql}
                className="btn-secondary text-xs py-1 px-3 rounded-lg flex items-center gap-1.5"
              >
                {copiedSql ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
            <pre className="p-4 bg-black/80 rounded-2xl border border-[var(--border-color)] text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}
