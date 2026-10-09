import React, { useState } from 'react';
import { MessageSquare, AlertTriangle, Send, Phone, Calendar, Clock, Sparkles, Code, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function RetentionWhatsAppCenter({ users, marketingLogs, onTriggerRetentionCheck }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [sentLogs, setSentLogs] = useState({});

  // Filter inactive customers >= 25 days
  const inactiveUsers = users.filter(u => {
    if (u.Role !== 'Customer' || !u.Last_Visit_Date) return false;
    const days = Math.floor((Date.now() - new Date(u.Last_Visit_Date).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 25;
  });

  const handleSendWhatsApp = (log) => {
    // Generate WhatsApp direct link format
    const cleanPhone = log.Customer_Phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(log.Message_Template);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    // Open WhatsApp tab
    window.open(waUrl, '_blank');

    setSentLogs(prev => ({ ...prev, [log.Log_ID]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" /> Prompt 5: Automated Retention & Marketing Engine
          </div>
          <h2 className="text-2xl font-extrabold text-white">25-Day Automated WhatsApp Retention</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Auto-calculates Days_Inactive. Fires alert in Marketing_Logs & creates WhatsApp webhook payloads when customer reaches 25 inactive days.
          </p>
        </div>

        <button
          onClick={onTriggerRetentionCheck}
          className="btn-secondary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Run Retention Engine Scan</span>
        </button>
      </div>

      {/* Highlights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-card p-5 border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              25+ Days Inactive Customers
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">
            {inactiveUsers.length} Customers
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Eligible for automated WhatsApp re-engagement offer
          </p>
        </div>

        <div className="glass-card p-5 border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Generated Marketing Logs
            </span>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {marketingLogs.length} Alerts
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Logged in Marketing_Logs table with webhook payloads
          </p>
        </div>

        <div className="glass-card p-5 border-yellow-500/30 bg-yellow-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
              Cashback Retention Incentive
            </span>
            <MessageSquare className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-extrabold gold-gradient-text">
            10% Wallet Cashback
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Auto-credited on completed haircut to ensure repeat visit
          </p>
        </div>

      </div>

      {/* Marketing Logs & Webhook Payloads List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Log Entries */}
        <div className="lg:col-span-7 glass-card p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Automated Retention Alerts Queue
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Table: Marketing_Logs
            </span>
          </h3>

          {marketingLogs.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold">No inactive customers past 25 days!</p>
              <p className="text-xs">Use the "+25 Days Demo" button at top to advance time and test.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {marketingLogs.map((log) => {
                const isSelected = selectedLog?.Log_ID === log.Log_ID;
                const isSent = sentLogs[log.Log_ID];

                return (
                  <div
                    key={log.Log_ID}
                    onClick={() => setSelectedLog(log)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-500/10 border-yellow-500/60 shadow-lg'
                        : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{log.Customer_Name}</h4>
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {log.Days_Inactive} Days Inactive
                          </span>
                        </div>
                        
                        <p className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-yellow-500" /> {log.Customer_Phone}
                        </p>

                        <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5 mt-2 italic">
                          "{log.Message_Template}"
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendWhatsApp(log);
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSent ? 'Sent ✓' : 'Send WhatsApp'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="text-[10px] text-yellow-400 hover:underline flex items-center gap-1"
                        >
                          <Code className="w-3 h-3" /> View Webhook JSON
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Webhook JSON Payload Inspector */}
        <div className="lg:col-span-5 glass-card p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-yellow-500" />
              Webhook Payload Inspector
            </h3>
            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded font-mono">
              JSON Event
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            This webhook payload can be automatically pushed to Twilio, UltraMsg, or Green API for instant automated WhatsApp delivery.
          </p>

          <div className="flex-1 bg-black/80 p-4 rounded-2xl border border-[var(--border-color)] font-mono text-xs text-yellow-300 overflow-x-auto">
            {selectedLog ? (
              <pre className="whitespace-pre-wrap">
{JSON.stringify(
  {
    event: "CUSTOMER_INACTIVE_25_DAYS_ALERT",
    log_id: selectedLog.Log_ID,
    customer_id: selectedLog.Customer_ID,
    customer_name: selectedLog.Customer_Name,
    phone_number: selectedLog.Customer_Phone,
    days_inactive: selectedLog.Days_Inactive,
    last_visit_date: selectedLog.Last_Visit_Date,
    incentive_offer: "10% Wallet Cashback Bonus",
    webhook_url: "https://api.m5smartsalon.com/webhooks/whatsapp-reminder",
    payload: {
      to: selectedLog.Customer_Phone,
      type: "template",
      template_name: "salon_retention_discount",
      language: "ur_PK",
      body_text: selectedLog.Message_Template
    },
    triggered_at: new Date().toISOString()
  },
  null,
  2
)}
              </pre>
            ) : (
              <div className="h-48 flex items-center justify-center text-[var(--text-dim)] italic">
                Click any log on the left to inspect its live Webhook JSON payload.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
