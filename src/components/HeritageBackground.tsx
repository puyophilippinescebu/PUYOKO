import React from 'react';

export const HeritageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 select-none print:hidden overflow-hidden bg-gradient-to-br from-white via-[#f3faf6] to-[#faf9f4]">
      {/* Watercolor Wash Splashes */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.45]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="watercolorBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="35" />
          </filter>
        </defs>
        {/* Soft light green splash at top left */}
        <circle cx="150" cy="150" r="220" fill="#e2f3e8" filter="url(#watercolorBlur)" />
        {/* Soft pale green splash at bottom left */}
        <circle cx="200" cy="700" r="300" fill="#eef7f2" filter="url(#watercolorBlur)" />
        {/* Soft light sage green splash at center right */}
        <circle cx="1000" cy="400" r="280" fill="#dcede2" filter="url(#watercolorBlur)" />
        {/* Soft cream yellow splash at bottom right */}
        <circle cx="900" cy="800" r="250" fill="#faf6e5" filter="url(#watercolorBlur)" />
      </svg>

      {/* Solihiya Filipino Rattan Pattern Layer */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
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
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
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
      <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50,250 Q200,180 500,230 T1100,200 T1400,220" fill="none" stroke="#1b4332" strokeWidth="1" />
        <path d="M-50,450 Q300,380 600,420 T1200,380 T1450,400" fill="none" stroke="#40916c" strokeWidth="1" />
      </svg>

      {/* Premium Lotus Flower & Leaf Illustrations (Gold outlines, jade/mint fills) */}
      {/* Top Right Lotus */}
      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(940, -40) scale(0.6) md:scale(1.2)" className="opacity-[0.16] md:opacity-[0.24]" style={{ transformOrigin: 'top right' }}>
          {/* Big leaf */}
          <path d="M -50 150 C -120 150, -180 80, -150 0 C -120 -80, 20 -80, 50 0 C 80 80, 20 150, -50 150 Z" fill="#2d4f3e" stroke="#c5a059" strokeWidth="1" />
          {/* Leaf veins */}
          <path d="M -50 0 L -80 60 M -50 0 L -120 20 M -50 0 L -100 -50 M -50 0 L -20 -60 M -50 0 L 10 -20 M -50 0 L 0 50 M -50 0 L -40 100" stroke="#c5a059" strokeWidth="0.5" strokeOpacity="0.7" />
          
          {/* Small leaf */}
          <path d="M -150 50 C -200 50, -220 10, -200 -30 C -180 -70, -100 -60, -80 -20 C -60 20, -100 50, -150 50 Z" fill="#4a7c64" stroke="#c5a059" strokeWidth="1" />
          
          {/* Lotus Flower */}
          <g transform="translate(-80, 40)">
            <path d="M 0 -60 C -30 -30, -40 10, 0 30 C 40 10, 30 -30, 0 -60 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1.2" />
            <path d="M 0 30 C -45 10, -50 -20, -15 -35 C -35 5, -15 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
            <path d="M 0 30 C -70 20, -75 -10, -35 -20 C -55 15, -25 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
            <path d="M 0 30 C 45 10, 50 -20, 15 -35 C 35 5, 15 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
            <path d="M 0 30 C 70 20, 75 -10, 35 -20 C 55 15, 25 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
            <path d="M -10 -25 C -5 -35, 5 -35, 10 -25 C 10 -10, -10 -10, -10 -25 Z" fill="#f5d77f" stroke="#c5a059" strokeWidth="0.8" />
            <circle cx="-3" cy="-22" r="1.2" fill="#c5a059" />
            <circle cx="3" cy="-22" r="1.2" fill="#c5a059" />
            <circle cx="0" cy="-17" r="1.2" fill="#c5a059" />
          </g>
        </g>

        {/* Bottom Left Lotus */}
        <g transform="translate(-40, 580) scale(0.6) md:scale(1.2)" className="opacity-[0.16] md:opacity-[0.24]" style={{ transformOrigin: 'bottom left' }}>
          {/* Big leaf */}
          <path d="M 50 -50 C -20 -50, -80 20, -50 100 C -20 180, 120 180, 150 100 C 180 20, 120 -50, 50 -50 Z" fill="#4a7c64" stroke="#c5a059" strokeWidth="1" />
          <path d="M 50 100 L 20 40 M 50 100 L -20 80 M 50 100 L 0 150 M 50 100 L 80 160 M 50 100 L 110 120 M 50 100 L 120 50 M 50 100 L 80 30" stroke="#c5a059" strokeWidth="0.5" strokeOpacity="0.7" />
          
          {/* Medium leaf */}
          <path d="M 150 20 C 100 20, 80 80, 100 120 C 120 160, 200 150, 220 110 C 240 70, 200 20, 150 20 Z" fill="#2d4f3e" stroke="#c5a059" strokeWidth="1" />
          
          {/* Lotus Flower */}
          <g transform="translate(60, 40) rotate(-10)">
            <path d="M 0 -60 C -30 -30, -40 10, 0 30 C 40 10, 30 -30, 0 -60 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1.2" />
            <path d="M 0 30 C -45 10, -50 -20, -15 -35 C -35 5, -15 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
            <path d="M 0 30 C -70 20, -75 -10, -35 -20 C -55 15, -25 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
            <path d="M 0 30 C 45 10, 50 -20, 15 -35 C 35 5, 15 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
            <path d="M 0 30 C 70 20, 75 -10, 35 -20 C 55 15, 25 25, 0 30 Z" fill="#ffffff" stroke="#c5a059" strokeWidth="1" />
          </g>
        </g>
      </svg>

      {/* Background Watermark Characters (Scaled responsibly for mobile to act as clean stamps) */}
      {/* Character 家 (Home) - Top Right margin */}
      <div className="absolute top-24 right-4 md:right-12 z-0 font-serif select-none pointer-events-none text-primary text-5xl md:text-8xl lg:text-[10rem] opacity-[0.035] transition-all">
        家
      </div>
      {/* Character 美 (Beauty) - Middle Right margin */}
      <div className="absolute top-[45%] right-6 md:right-24 z-0 font-serif select-none pointer-events-none text-primary text-5xl md:text-8xl lg:text-[10rem] opacity-[0.03] transition-all">
        美
      </div>
      {/* Character 祥 (Auspiciousness/Peace) - Lower Left margin */}
      <div className="absolute bottom-28 left-4 md:left-12 z-0 font-serif select-none pointer-events-none text-primary text-5xl md:text-8xl lg:text-[10rem] opacity-[0.035] transition-all">
        祥
      </div>
    </div>
  );
};
