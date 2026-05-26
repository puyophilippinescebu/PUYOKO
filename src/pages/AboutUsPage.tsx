import React from 'react';

import janEricImg from '../../Puyoko Team Pictures/Jan Eric.jpg';
import malouJansonImg from '../../Puyoko Team Pictures/Malou Janson.png';
import janeClaireImg from '../../Puyoko Team Pictures/Jane Claire.jpg';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-gutter mx-auto max-w-container-max">
      {/* Vision & Mission */}
      <section className="mb-32 text-center max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col items-center justify-center gap-3">
          <img src="/puyoko-logo.png" alt="PUYOKO Logo" className="h-32 w-auto object-contain transition-all duration-700 ease-in-out hover:scale-105" />
          <span className="text-primary-light text-xs font-mono tracking-widest uppercase">Our Purpose / 目的</span>
        </div>
        <h1 className="font-display text-5xl font-light text-primary mb-12">
          Vision & <span className="italic-serif text-primary-light">Mission</span>
        </h1>
        <div className="grid md:grid-cols-2 gap-12 text-left">
          <div className="bg-white/50 backdrop-blur-md p-8 border border-outline/20 shadow-lg">
            <h3 className="font-display text-2xl text-primary mb-4">Our Vision</h3>
            <p className="font-sans text-on-surface-variant leading-relaxed">
              To be the premier curator of heritage and modern real estate in the Philippines, 
              connecting individuals with properties that reflect their values, history, and aspirations for the future.
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-md p-8 border border-outline/20 shadow-lg">
            <h3 className="font-display text-2xl text-primary mb-4">Our Mission</h3>
            <p className="font-sans text-on-surface-variant leading-relaxed">
              To provide unparalleled service in the real estate market by blending modern efficiency 
              with a deep appreciation for architectural beauty and cultural heritage. We strive to build lasting legacies for our clients.
            </p>
          </div>
        </div>
      </section>

      {/* Etymology */}
      <section className="mb-32 max-w-4xl mx-auto px-8 py-16 bg-primary text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-jade-deep opacity-40"></div>
        <div className="absolute inset-0 heritage-pattern opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-10 right-10 text-9xl opacity-5 font-serif select-none">住</div>
        <div className="relative z-10 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="text-primary-neon text-xs font-mono tracking-widest uppercase">The Etymology / 词源</span>
          </div>
          <h2 className="font-display text-4xl font-light mb-8">
            Why <span className="italic-serif text-primary-neon">"Puyoko"?</span>
          </h2>
          <p className="font-sans text-white/90 text-lg leading-relaxed max-w-2xl mx-auto">
            In the Visayan language, "Puyo ko" is a simple but powerful statement. It means "I'm staying" or "This is where I live." By naming our estate Puyoko, we turn a brand into a promise. It represents the luxury of embracing our culture: finding a place so deeply aligned with your soul that you never want to leave.
          </p>
        </div>
      </section>

      {/* Owner Story */}
      <section className="mb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square w-64 md:w-80 mx-auto overflow-hidden border border-outline shadow-xl group">
            <img 
              src={janEricImg} 
              alt="Jan Eric Saladaga" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-primary-light text-xs font-mono tracking-widest uppercase">The Founder / 创始人</span>
            </div>
            <h2 className="font-display text-4xl font-light text-primary mb-6">Jan Eric <span className="italic-serif text-primary-light">Saladaga</span></h2>
            <div className="space-y-6 font-sans text-on-surface-variant text-lg leading-relaxed">
              <p>
                Jan Eric Saladaga's journey into real estate began with a profound appreciation for the spaces that define our lives. 
                Starting as a visionary looking to bridge the gap between historic Filipino homes and modern living, 
                he founded Puyoko to redefine what a luxury real estate experience should be.
              </p>
              <p>
                His philosophy is simple: a home is not just a structure, but a canvas for life's most important moments. 
                Under his guidance, Puyoko has grown into a trusted name for discerning clients seeking properties that offer both heritage and modernity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section>
        <div className="text-center mb-16">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="text-primary-light text-xs font-mono tracking-widest uppercase">Our People / 团队</span>
          </div>
          <h2 className="font-display text-4xl font-light text-primary">
            Project <span className="italic-serif text-primary-light">Managers</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Marilou 'Malou' Janson */}
          <div className="text-center group">
            <div className="relative w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full border border-outline/30 shadow-lg">
              <img 
                src={malouJansonImg} 
                alt="Marilou 'Malou' Janson" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="font-display text-2xl text-primary mb-2">Marilou 'Malou' Janson</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-primary-light mb-4">Project Manager</p>
            <p className="font-sans text-on-surface-variant max-w-sm mx-auto mb-4">
              With over a decade of experience in property management, Malou ensures every project is executed with precision and care, maintaining the high standards of Puyoko.
            </p>
            <a href="tel:+639913189665" className="inline-flex items-center gap-2 font-mono text-xs text-primary-light hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.29 6.29l.89-.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +63 991 318 9665
            </a>
          </div>

          {/* Jane Claire Saladaga */}
          <div className="text-center group">
            <div className="relative w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full border border-outline/30 shadow-lg">
              <img 
                src={janeClaireImg} 
                alt="Jane Claire Saladaga" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="font-display text-2xl text-primary mb-2">Jane Claire Saladaga</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-primary-light mb-4">Project Manager</p>
            <p className="font-sans text-on-surface-variant max-w-sm mx-auto mb-4">
              Jane's expertise in architectural coordination and client relations brings a seamless experience to our clients, turning complex visions into reality.
            </p>
            <a href="tel:+639942041835" className="inline-flex items-center gap-2 font-mono text-xs text-primary-light hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6.29 6.29l.89-.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +63 994 204 1835
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
