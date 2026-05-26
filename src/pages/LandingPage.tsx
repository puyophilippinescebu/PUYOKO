import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactForm } from '../components/ContactForm';
import { cn } from '../lib/utils';
import janEricImg from '../../Puyoko Team Pictures/Jan Eric.jpg';
import mainPhotoImg from '../../Puyo Main Photo.jpg';

// Helper to parse YouTube, TikTok, Facebook URLs
function getVideoEmbedUrl(url: string) {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. YouTube
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    let videoId = '';
    if (trimmed.includes('watch?v=')) {
      videoId = trimmed.split('watch?v=')[1]?.split('&')[0];
    } else if (trimmed.includes('youtu.be/')) {
      videoId = trimmed.split('youtu.be/')[1]?.split('?')[0];
    } else if (trimmed.includes('embed/')) {
      videoId = trimmed.split('embed/')[1]?.split('?')[0];
    } else if (trimmed.includes('shorts/')) {
      videoId = trimmed.split('shorts/')[1]?.split('?')[0];
    }
    return videoId ? { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${videoId}`, isVertical: trimmed.includes('shorts/') } : null;
  }

  // 2. TikTok
  if (trimmed.includes('tiktok.com')) {
    let videoId = '';
    if (trimmed.includes('/video/')) {
      videoId = trimmed.split('/video/')[1]?.split('?')[0];
    }
    return { 
      type: 'tiktok', 
      embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : `https://www.tiktok.com/embed/v2/test`,
      isVertical: true 
    };
  }

  // 3. Facebook
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0&mute=0`,
      isVertical: false
    };
  }

  return null;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState(localStorage.getItem('puyoko_homepage_video_url') || '');

  useEffect(() => {
    const handleStorage = () => {
      setVideoUrl(localStorage.getItem('puyoko_homepage_video_url') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const videoEmbedData = getVideoEmbedUrl(videoUrl);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-[#E8F3EF] opacity-40" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 clip-path-polygon lg:block hidden" />
        
        <div className="mx-auto max-w-container-max px-gutter relative z-10 flex md:grid md:grid-cols-2 gap-4 md:gap-20 items-center py-6 md:py-0 w-full overflow-hidden">
          {/* Left Column (Content) */}
          <div className="w-[62%] md:w-auto flex-shrink-0">
            <div className="mb-4 md:mb-8 flex flex-col items-start gap-2 md:gap-4">
              <img src="/puyoko-logo.png" alt="PUYOKO Logo" className="h-12 md:h-28 w-auto object-contain transition-all duration-700 ease-in-out hover:scale-105" />
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-primary-light text-[8px] md:text-xs font-mono tracking-[0.4em] uppercase">Selection / 祥安</span>
                <div className="h-[1px] w-8 md:w-20 bg-primary/20"></div>
              </div>
            </div>
            <h1 className="mb-4 md:mb-8 font-display text-xl md:text-8xl font-light leading-[1.15] text-primary whitespace-nowrap md:whitespace-normal">
              The Art of <br/>
              <span className="italic-serif text-primary-light text-2xl md:text-8xl block mt-0.5 md:mt-0">Bahay na Bato</span>
            </h1>
            <p className="mb-6 md:mb-12 max-w-xs md:max-w-md font-sans text-[9px] md:text-lg text-on-surface-variant leading-relaxed">
              Experience the architectural beauty of local housing & real estate with the soft, ethereal brushstrokes of modern minimalist design.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 md:gap-6 w-full">
              <button 
                onClick={() => navigate('/properties')}
                className="group relative overflow-hidden bg-primary text-white px-4 md:px-12 py-3 md:py-5 font-mono text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-500 hover:shadow-xl hover:shadow-primary/30 btn-press text-center shrink-0 w-full md:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-light via-primary to-primary-light opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 bg-[length:200%_auto] group-hover:animate-gradient-x" />
                <span className="relative z-10">Check Properties</span>
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="px-3 md:px-8 py-3 md:py-5 border border-primary/20 font-mono text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary hover:bg-primary/5 transition-all active:scale-95 text-center shrink-0 w-full md:w-auto"
              >
                The Story
              </button>
            </div>
          </div>
          
          {/* Right Column (Hero Photo) */}
          <div className="w-[38%] md:w-auto flex-shrink-0 relative aspect-[4/5] overflow-hidden rounded-sm border border-outline shadow-xl md:shadow-2xl group">
            <img 
              src={mainPhotoImg} 
              alt="Cebu Luxury Estate" 
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 text-lg md:text-5xl text-white/40 font-serif leading-none italic select-none">山水</div>
          </div>
        </div>
      </section>

      {/* Contact Form Section (Upper Half) */}
      <ContactForm />

      {/* Materials Module - Natural Tones Design Layout */}
      <section className="bg-primary text-white pt-24 pb-32 relative mt-16 md:mt-24">
        {/* Curvy Top Divider */}
        <div className="absolute bottom-full left-0 w-full overflow-hidden leading-none flex items-end">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px] md:h-[120px] text-primary fill-current">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
        <div className="absolute top-10 right-10 text-9xl opacity-5 font-serif select-none">和</div>
        <div className="mx-auto max-w-container-max px-gutter grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="text-primary-neon text-xs font-mono tracking-[0.4em] uppercase">PUYOKO / 祥</span>
              <div className="h-[1px] w-20 bg-primary-neon/30"></div>
            </div>
            <h2 className="font-display text-5xl font-light mb-8 text-white">Rooted in <span className="italic-serif text-primary-neon">Permanence</span></h2>
            <div className="space-y-6 font-sans text-lg text-white/80 leading-relaxed max-w-md">
              <p>
                Started from humble freelance marketing solutions, we have blossomed into Cebu's premier boutique real estate agency.
              </p>
              <p>
                Serving families who value both the heavy foundations of the past and the light, glass-filled future of Cebuano living.
              </p>
            </div>
            <button 
              onClick={() => navigate('/about')}
              className="mt-12 px-10 py-4 border border-white/30 font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-primary transition-all active:scale-95"
            >
              Details / 细节
            </button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 space-y-10">
            <h3 className="uppercase tracking-[0.4em] text-xs font-bold text-primary-neon">Materials / 材料</h3>
            <div className="space-y-8">
              {[
                { name: "Capiz Shell / 窗", val: "78% Integrated" },
                { name: "Narra Wood / 木", val: "Sustainable Sourced" },
                { name: "Adobe Stone / 石", val: "Local Extraction" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-lg italic-serif">{item.name}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary-neon">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Video Showcase */}
      {videoEmbedData && (
        <section className="py-20 px-gutter bg-[#e8f3ef]/30 border-t border-b border-outline/10 mt-16 md:mt-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-primary-light text-xs font-mono tracking-widest uppercase mb-4 block">Featured Showcase / 视频</span>
            <h2 className="font-display text-4xl font-light text-primary mb-12">
              Experience the Puyoko <span className="italic-serif text-primary-light">Vibe</span>
            </h2>
            <div className={cn(
              "mx-auto overflow-hidden rounded-2xl border border-outline/20 shadow-2xl bg-black relative",
              videoEmbedData.isVertical ? "max-w-[340px] aspect-[9/16]" : "w-full aspect-video"
            )}>
              <iframe
                src={videoEmbedData.embedUrl}
                title="Puyoko Video Showcase"
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mx-auto max-w-container-max px-gutter py-24">
        <div className="relative overflow-hidden rounded-2xl bg-jade-deep px-12 py-20 text-center text-white md:px-24">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-6 font-display text-4xl font-black md:text-5xl">Invest in Cebu's Prosperity</h2>
            <p className="mb-10 font-sans text-lg text-white/80 leading-relaxed">
              Whether you are looking for a heritage home or a modern estate, our team is ready to guide you home.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button 
                onClick={() => navigate('/contact')}
                className="group relative overflow-hidden bg-primary px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-500 hover:shadow-xl hover:shadow-primary/30 btn-press active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-light via-primary to-primary-light opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 bg-[length:200%_auto] group-hover:animate-gradient-x" />
                <span className="relative z-10">Schedule a Visit</span>
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="border border-white/30 bg-white/5 px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest backdrop-blur-sm transition-all hover:bg-white/10 btn-press active:scale-95"
              >
                Contact an Agent
              </button>
            </div>
          </div>
          {/* Internal pattern */}
          <div className="heritage-pattern absolute inset-0 opacity-10" />
        </div>
      </section>

      {/* Footer Biography Section */}
      <section className="py-24 px-gutter border-t border-outline/20 bg-background-warm/50">
        <div className="mx-auto max-w-container-max grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 max-w-sm mx-auto lg:mx-0 relative">
            <div className="aspect-[3/4] overflow-hidden border border-outline shadow-xl">
              <img 
                src={janEricImg} 
                alt="Jan Eric Saladaga" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 font-serif italic text-xl shadow-lg">
              "Building Legacies."
            </div>
          </div>
          <div className="lg:col-span-8 lg:pl-12">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-primary-light text-xs font-mono tracking-widest uppercase">Founder & Visionary</span>
            </div>
            <h2 className="font-display text-4xl font-light text-primary mb-6">Jan Eric <span className="italic-serif text-primary-light">Saladaga</span></h2>
            <div className="space-y-6 font-sans text-on-surface-variant text-lg leading-relaxed">
              <p>
                As the founder of Puyoko, Jan Eric brings a unique perspective to Cebu's real estate market. 
                Combining a deep respect for Filipino heritage with a sharp eye for modern architectural potential, 
                he has built a platform dedicated to properties that tell a story.
              </p>
              <p>
                Under his leadership, Puyoko transcends traditional real estate brokerage, acting instead as a curator 
                of spaces where history and future prosperity intersect seamlessly.
              </p>
            </div>
            <button 
              onClick={() => navigate('/about')}
              className="mt-10 border border-primary/20 text-primary px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-colors active:scale-95"
            >
              Read Full Story
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
