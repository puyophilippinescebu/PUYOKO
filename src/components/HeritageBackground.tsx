import React from 'react';

export const HeritageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 select-none print:hidden overflow-hidden bg-gradient-to-br from-white via-[#f3faf6] to-[#faf9f4]">
      {/* Solihiya Filipino Rattan Pattern Layer */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.022]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="solihiya" width="50" height="50" patternUnits="userSpaceOnUse">
            {/* Horizontal & Vertical lines */}
            <line x1="0" y1="12.5" x2="50" y2="12.5" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            <line x1="0" y1="37.5" x2="50" y2="37.5" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            <line x1="12.5" y1="0" x2="12.5" y2="50" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            <line x1="37.5" y1="0" x2="37.5" y2="50" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            {/* Diagonal lines */}
            <line x1="0" y1="0" x2="50" y2="50" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            <line x1="50" y1="0" x2="0" y2="50" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            {/* Diamond weave connectors */}
            <line x1="25" y1="0" x2="50" y2="25" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            <line x1="0" y1="25" x2="25" y2="50" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            <line x1="25" y1="0" x2="0" y2="25" stroke="#1b4332" strokeWidth="0.75" fill="none" />
            <line x1="50" y1="25" x2="25" y2="50" stroke="#1b4332" strokeWidth="0.75" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#solihiya)" />
      </svg>

      {/* Atmospheric Soft Clouds Layer */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        
        {/* Top Left Cloud cluster */}
        <g transform="translate(80, 50) scale(1.1)">
          <path d="M 30 60 C 40 40, 70 30, 100 40 C 120 20, 160 20, 180 40 C 200 30, 230 40, 240 60 C 255 70, 255 90, 240 100 C 220 110, 50 110, 30 100 C 15 90, 15 70, 30 60 Z" fill="#40916c" filter="url(#softBlur)" />
          <path d="M 60 70 C 70 55, 90 50, 110 55 C 120 45, 140 45, 150 55 C 160 50, 180 55, 190 70 C 200 75, 200 85, 190 90 C 180 95, 80 95, 60 90 C 50 85, 50 75, 60 70 Z" fill="#95d5b2" filter="url(#softBlur)" />
        </g>

        {/* Top Right Cloud cluster */}
        <g transform="translate(900, 100) scale(1.4)">
          <path d="M 30 60 C 40 40, 70 30, 100 40 C 120 20, 160 20, 180 40 C 200 30, 230 40, 240 60 C 255 70, 255 90, 240 100 C 220 110, 50 110, 30 100 C 15 90, 15 70, 30 60 Z" fill="#1b4332" filter="url(#softBlur)" />
        </g>

        {/* Mid Left Cloud cluster */}
        <g transform="translate(-50, 400) scale(0.9)">
          <path d="M 30 60 C 40 40, 70 30, 100 40 C 120 20, 160 20, 180 40 C 200 30, 230 40, 240 60 C 255 70, 255 90, 240 100 C 220 110, 50 110, 30 100 C 15 90, 15 70, 30 60 Z" fill="#95d5b2" filter="url(#softBlur)" />
        </g>

        {/* Bottom Right Cloud cluster */}
        <g transform="translate(850, 550) scale(1.2)">
          <path d="M 30 60 C 40 40, 70 30, 100 40 C 120 20, 160 20, 180 40 C 200 30, 230 40, 240 60 C 255 70, 255 90, 240 100 C 220 110, 50 110, 30 100 C 15 90, 15 70, 30 60 Z" fill="#40916c" filter="url(#softBlur)" />
        </g>
      </svg>

      {/* Subtle Ethereal Accent Lines (Landscape flow) */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50,250 Q200,180 500,230 T1100,200 T1400,220" fill="none" stroke="#1b4332" strokeWidth="1" />
        <path d="M-50,450 Q300,380 600,420 T1200,380 T1450,400" fill="none" stroke="#40916c" strokeWidth="1" />
      </svg>
    </div>
  );
};
