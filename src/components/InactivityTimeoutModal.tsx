import React, { useEffect } from 'react';
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

interface InactivityTimeoutModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  maxSeconds: number;
  onStayLoggedIn: () => void;
  onLogOutNow: () => void;
}

export const InactivityTimeoutModal: React.FC<InactivityTimeoutModalProps> = ({
  isOpen,
  secondsRemaining,
  maxSeconds,
  onStayLoggedIn,
  onLogOutNow,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Play a subtle gentle alert sound or focus the button
      const activeElement = document.activeElement as HTMLElement;
      return () => {
        if (activeElement) activeElement.focus();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate percentage of progress circle
  const percentage = (secondsRemaining / maxSeconds) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none">
      {/* Dark Blur Overlay */}
      <div 
        className="fixed inset-0 bg-jade-deep/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onStayLoggedIn}
      />

      {/* Glassmorphic Modal Card */}
      <div className="relative w-full max-w-md bg-white/95 border border-outline/10 p-8 shadow-2xl rounded-2xl transform transition-all duration-300 scale-100 opacity-100 flex flex-col items-center text-center">
        {/* Animated Countdown Visual */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Background Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-surface-muted fill-none"
              strokeWidth="6"
            />
            {/* Ticking Animated Progress Ring */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-primary fill-none transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner Icon / Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-extrabold text-primary leading-none">
              {secondsRemaining}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-on-surface-variant mt-1">
              seconds
            </span>
          </div>
        </div>

        {/* Warning Icon Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono text-[9px] uppercase tracking-widest font-bold mb-4 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          Inactivity Warning
        </div>

        {/* Modal Title */}
        <h2 className="font-display text-2xl font-bold text-primary mb-2">
          Are you still there?
        </h2>

        {/* Modal Description */}
        <p className="font-sans text-sm text-on-surface-variant mb-8 max-w-[280px] leading-relaxed">
          Your admin session is about to expire due to inactivity. You will be signed out to protect your account.
        </p>

        {/* Actions Button Row */}
        <div className="flex flex-col sm:flex-row w-full gap-3">
          <button
            onClick={onLogOutNow}
            className="flex-1 order-2 sm:order-1 py-3.5 px-4 flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-200/50 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
          <button
            onClick={onStayLoggedIn}
            className="flex-1 order-1 sm:order-2 py-3.5 px-4 flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white bg-primary hover:bg-primary-light rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Keep Working
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
