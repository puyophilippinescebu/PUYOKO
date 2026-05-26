import React from 'react';

export const HeritageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 select-none print:hidden overflow-hidden">
      {/* Heritage Pattern Layer */}
      <div 
        className="absolute inset-0 heritage-pattern opacity-[0.08]" 
        aria-hidden="true" 
      />

      {/* Atmospheric Characters - Natural Tones Style */}
      <div className="absolute top-0 right-0 w-[400px] h-screen opacity-[0.05] flex flex-col justify-between py-20 px-10">
        <div className="text-[24rem] leading-none font-serif text-primary rotate-12">家</div>
        <div className="text-[18rem] leading-none font-serif text-primary -rotate-6 self-end">美</div>
      </div>
      
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] opacity-[0.04] -translate-y-1/2 -rotate-12 px-10">
        <div className="text-[15rem] leading-none font-serif text-primary">祥</div>
      </div>

      {/* Subtle Gradient Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background-warm to-transparent opacity-60" />
    </div>
  );
};
