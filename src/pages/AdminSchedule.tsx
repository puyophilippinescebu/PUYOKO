import React, { useState, useEffect } from 'react';
import { Calendar, Lock, Unlock, Clock, Info, ShieldAlert, UserCheck, Phone, User, Check, CheckCircle2 } from 'lucide-react';
import { useBlockedDates } from '../hooks/useBlockedDates';

export const AdminSchedule: React.FC = () => {
  const { toggleDate, isDateBlocked, blockedDates } = useBlockedDates();

  // Agent configuration states (persisted in localStorage with cross-tab synchronization)
  const [agentName, setAgentName] = useState(() => localStorage.getItem('puyoko_agent_name') || 'Claire Jane');
  const [agentPhone, setAgentPhone] = useState(() => localStorage.getItem('puyoko_agent_phone') || '+63 912 345 6789');
  
  // Visual states
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [nameInput, setNameInput] = useState(agentName);
  const [phoneInput, setPhoneInput] = useState(agentPhone);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'puyoko_agent_name' && e.newValue) {
        setAgentName(e.newValue);
        setNameInput(e.newValue);
      }
      if (e.key === 'puyoko_agent_phone' && e.newValue) {
        setAgentPhone(e.newValue);
        setPhoneInput(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim() || 'Claire Jane';
    const cleanPhone = phoneInput.trim() || '+63 912 345 6789';
    
    localStorage.setItem('puyoko_agent_name', cleanName);
    localStorage.setItem('puyoko_agent_phone', cleanPhone);
    setAgentName(cleanName);
    setAgentPhone(cleanPhone);
    
    // Trigger storage event manually to notify other pages in the same window
    window.dispatchEvent(new Event('storage'));

    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  // Exact same Manila Standard Time (PST, UTC+8) date generator as public ScheduleTourWizard
  const getPSTDates = () => {
    const dates = [];
    const now = new Date();
    
    // Shift now to UTC then to Philippine Time (UTC+8)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const pstOffset = 8;
    const pstTime = new Date(utc + (3600000 * pstOffset));
    
    // Generate dates: 2 days advanced up to 14 days maximum (13 dates total)
    for (let i = 2; i <= 14; i++) {
      const d = new Date(pstTime);
      d.setDate(pstTime.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const calendarDays = getPSTDates();

  const formatDateString = (d: Date) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-page-enter">
      {/* Header section */}
      <div className="bg-white border border-outline/20 rounded-2xl p-6 shadow-sm relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-jade-deep/5 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full select-none font-display">
              Tour Control Dashboard
            </span>
            <h1 className="font-serif italic text-3xl text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              Private Tour Scheduling Setup
            </h1>
            <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
              Configure the assigned Tour Specialist displayed to clients and manage unavailable calendar booking dates. Standardized automatic ranges conform strictly to Manila Standard Time.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-jade-deep/5 border border-jade-deep/10 px-4 py-3 rounded-xl shrink-0">
            <Clock className="w-5 h-5 text-primary-light" />
            <div>
              <span className="block font-mono text-[8px] uppercase tracking-wider text-on-surface-variant/70 leading-none">Timezone Locked</span>
              <span className="font-sans text-xs font-bold text-primary">Manila Time (PST, UTC+8)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Agent Config (Left) vs Calendar Blocks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Representative Info Setup (4 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-outline/25 rounded-2xl p-6 shadow-sm space-y-6 relative">
            <div className="flex items-center gap-2 pb-4 border-b border-outline/10 select-none">
              <UserCheck className="w-5 h-5 text-primary-light" />
              <h2 className="font-serif text-lg font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tour Representative Profile
              </h2>
            </div>

            {/* Editable Form */}
            <form onSubmit={handleSaveAgent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9.5px] font-mono uppercase tracking-widest text-on-surface-variant/80 font-bold">Assigned Specialist Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/50" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Claire Jane"
                    className="w-full bg-[#f8faf8] border border-outline/35 text-on-surface px-10 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs font-sans"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9.5px] font-mono uppercase tracking-widest text-on-surface-variant/80 font-bold">Representative Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/50" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. +63 912 345 6789"
                    className="w-full bg-[#f8faf8] border border-outline/35 text-on-surface px-10 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs font-sans"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-light text-white font-sans text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Representative Details
              </button>
            </form>

            {/* Micro saved notification */}
            {showSavedNotification && (
              <div className="absolute top-2 right-4 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm text-[10px] font-mono uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span>Details Saved</span>
              </div>
            )}
          </div>

          {/* Premium "Preview Card" visual mockup showing front-end appearance */}
          <div className="bg-gradient-to-br from-jade-deep to-primary-dark border border-white/10 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden select-none min-h-[200px] flex flex-col justify-between group">
            <div className="absolute inset-0 heritage-pattern opacity-5 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-primary-neon/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[7px] tracking-[0.4em] uppercase text-primary-neon font-black block mb-0.5">Assigned Specialist</span>
                <h3 className="font-serif italic text-xl text-white font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {agentName}
                </h3>
                <span className="font-mono text-[8px] tracking-widest text-white/50 uppercase block mt-0.5">Premium Estates Specialist</span>
              </div>
              <img src="/puyoko-logo.png" alt="logo" className="w-9 h-9 object-contain brightness-0 invert opacity-45 shrink-0" />
            </div>

            <div className="space-y-2 pt-6 border-t border-white/10 mt-6 text-white/80 font-mono text-[9px] tracking-wider">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-primary-neon" />
                <span>{agentPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-primary-neon" />
                <span>Available for Scheduled Tours (09:00 am - 04:00 pm)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Blocked Dates Grid Configuration (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-outline/25 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-outline/10 select-none">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-light" />
              <h2 className="font-serif text-lg font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                Toggle Blocked Booking Dates
              </h2>
            </div>
            
            {/* Quick Summary status pill */}
            <span className="font-mono text-[8px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-700 px-2 py-0.5 rounded-full border border-red-500/25">
              {blockedDates.length} Days Blocked
            </span>
          </div>

          <div className="flex items-start gap-2 bg-[#f4f6f4] p-3 rounded-xl text-on-surface-variant font-sans text-[11px] leading-relaxed select-none">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Dates below reflect standard online booking availability constraints (**2 to 14 days advanced**). Click a date card to lock or unlock availability dynamically.
            </p>
          </div>

          {/* Automatic Calendar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {calendarDays.map((date, index) => {
              const dateStr = formatDateString(date);
              const isBlocked = isDateBlocked(dateStr);
              
              const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayOfMonth = date.getDate().toString().padStart(2, '0');
              const monthName = date.toLocaleDateString('en-US', { month: 'short' });
              const yearVal = date.getFullYear();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDate(dateStr)}
                  className={`relative flex flex-col items-start justify-between p-4 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-sm cursor-pointer select-none group focus:outline-none ${
                    isBlocked
                      ? 'bg-red-50/50 border-red-500/60 text-red-950 hover:bg-red-50 hover:border-red-600'
                      : 'bg-white border-outline/25 text-on-surface hover:bg-surface-muted hover:border-primary/45'
                  }`}
                >
                  <div className="w-full flex justify-between items-start">
                    <span className={`block font-mono text-[7.5px] uppercase tracking-wider font-extrabold transition-colors ${
                      isBlocked ? 'text-red-700' : 'text-on-surface-variant/50 group-hover:text-primary-light'
                    }`}>
                      {dayOfWeek}
                    </span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      isBlocked ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'
                    }`}>
                      {isBlocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <span className="block font-display text-2xl font-black tracking-tight leading-none mt-2 mb-1">
                    {dayOfMonth}
                  </span>
                  
                  <span className={`block font-mono text-[7.5px] uppercase tracking-wider font-extrabold ${
                    isBlocked ? 'text-red-700' : 'text-on-surface-variant/50'
                  }`}>
                    {monthName} {yearVal}
                  </span>

                  <div className="pt-3 mt-auto w-full border-t border-outline/5">
                    <span className={`inline-flex items-center gap-1 font-mono text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                      isBlocked 
                        ? 'bg-red-500/10 text-red-700 border-red-500/15' 
                        : 'bg-green-500/10 text-green-700 border-green-500/15'
                    }`}>
                      {isBlocked ? 'Blocked' : 'Available'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* System status warning if blocks exist */}
          {blockedDates.length > 0 && (
            <div className="flex items-start gap-3 bg-red-50/50 border border-red-200 p-4 rounded-xl text-red-800 font-sans text-xs">
              <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-mono text-[8.5px] uppercase tracking-wider font-extrabold text-red-700 block">System Administrator Warning</span>
                <p className="text-[11px] text-red-900/80">
                  Dates marked as <strong>Blocked</strong> will be disabled immediately in the public calendar. The booking wizard automatically pre-selects the first unblocked day on load.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
