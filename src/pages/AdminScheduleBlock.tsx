import React from 'react';
import { Calendar, Lock, Unlock, Clock, Info, ShieldAlert } from 'lucide-react';
import { useBlockedDates } from '../hooks/useBlockedDates';

export const AdminScheduleBlock: React.FC = () => {
  const { toggleDate, isDateBlocked, blockedDates } = useBlockedDates();

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-page-enter">
      {/* Header card with glassmorphism feel */}
      <div className="bg-white border border-outline/20 rounded-2xl p-6 shadow-sm relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-jade-deep/5 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full select-none font-display">
              Scheduling Configuration
            </span>
            <h1 className="font-serif italic text-3xl text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              Manage Blocked Dates
            </h1>
            <p className="font-sans text-xs text-on-surface-variant max-w-xl leading-relaxed">
              Block specific calendar dates within the public booking range (2 to 14 days in advance) to prevent clients from booking tours. Click a date card to toggle its availability.
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

      {/* Overview Blocked Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-outline/20 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="block font-mono text-[8.5px] uppercase tracking-wider text-on-surface-variant/65">Booking Window</span>
            <span className="font-sans text-sm font-extrabold text-on-surface">13 Days Advanced</span>
          </div>
        </div>

        <div className="bg-white border border-outline/20 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <span className="block font-mono text-[8.5px] uppercase tracking-wider text-on-surface-variant/65">Blocked Dates</span>
            <span className="font-sans text-sm font-extrabold text-red-600">{blockedDates.length} Days Blocked</span>
          </div>
        </div>

        <div className="bg-white border border-outline/20 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Unlock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <span className="block font-mono text-[8.5px] uppercase tracking-wider text-on-surface-variant/65">Available Dates</span>
            <span className="font-sans text-sm font-extrabold text-green-600">
              {Math.max(0, 13 - blockedDates.filter(d => calendarDays.map(formatDateString).includes(d)).length)} Available
            </span>
          </div>
        </div>
      </div>

      {/* Dates Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-on-surface/80 px-1 select-none">
          <Info className="w-4 h-4 text-primary-light" />
          <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Interactive Calendar Grid</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                onClick={() => toggleDate(dateStr)}
                className={`relative flex flex-col items-center justify-between p-5 rounded-2xl border-2 text-center transition-all duration-300 hover:shadow-md cursor-pointer select-none group focus:outline-none ${
                  isBlocked
                    ? 'bg-red-50/50 border-red-500/80 text-red-950 hover:bg-red-50 hover:border-red-600'
                    : 'bg-white border-outline/25 text-on-surface hover:bg-surface-muted hover:border-primary/45'
                }`}
              >
                {/* Visual indicator corner badge */}
                <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isBlocked ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700 group-hover:scale-105'
                }`}>
                  {isBlocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </div>

                <div className="w-full text-left space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className={`block font-mono text-[8px] uppercase tracking-wider font-extrabold transition-colors ${
                      isBlocked ? 'text-red-700' : 'text-on-surface-variant/50 group-hover:text-primary-light'
                    }`}>
                      {dayOfWeek}
                    </span>
                    <span className="block font-display text-3xl font-black tracking-tight leading-none my-1">
                      {dayOfMonth}
                    </span>
                    <span className={`block font-mono text-[8px] uppercase tracking-wider font-extrabold ${
                      isBlocked ? 'text-red-700' : 'text-on-surface-variant/50'
                    }`}>
                      {monthName} {yearVal}
                    </span>
                  </div>

                  {/* Availability Badge */}
                  <div className="pt-4 mt-auto">
                    <span className={`inline-flex items-center gap-1 font-mono text-[7.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                      isBlocked 
                        ? 'bg-red-500/10 text-red-700 border-red-500/20' 
                        : 'bg-green-500/10 text-green-700 border-green-500/20'
                    }`}>
                      {isBlocked ? 'Unavailable' : 'Available'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Warning notice */}
      {blockedDates.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50/50 border border-red-200 p-4 rounded-xl text-red-800 font-sans text-xs">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-red-700 block">System Administrator Warning</span>
            <p>
              Some dates have been blocked. Public users visiting the <strong>Schedule a Tour</strong> page will see these specific days disabled and will be forced to select alternate days off or holiday times.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
