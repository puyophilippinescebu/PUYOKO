import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Bath, Square, BookOpen, ArrowRight, User, Clock } from 'lucide-react';
import { cn, getVideoEmbedUrl } from '../lib/utils';
import { useProperties } from '../contexts/PropertiesContext';
import { useMedia } from '../contexts/MediaContext';
import { ContactForm } from '../components/ContactForm';
import janEricImg1 from '../../Puyoko Team Pictures/Jan Eric Profile.jpeg';
import janEricImg2 from '../../Puyoko Team Pictures/Jan Eric Profile 2.jpeg';
import mainPhotoImg from '../../Puyo Main Photo.jpg';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState(localStorage.getItem('puyoko_homepage_video_url') || '');
  const { properties, loading: propertiesLoading } = useProperties();
  const { blogs, loading: mediaLoading } = useMedia();

  const latestBlog = blogs && blogs.length > 0 ? blogs[0] : null;

  const [currentJanEricPhoto, setCurrentJanEricPhoto] = useState(0);
  const janEricPhotos = [janEricImg1, janEricImg2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJanEricPhoto((prev) => (prev + 1) % janEricPhotos.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full">
              <button 
                onClick={() => navigate('/properties')}
                className="group relative overflow-hidden bg-primary text-white px-6 md:px-12 py-4 md:py-5 font-mono text-[11px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-500 hover:shadow-xl hover:shadow-primary/30 btn-press text-center shrink-0 w-full md:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-light via-primary to-primary-light opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 bg-[length:200%_auto] group-hover:animate-gradient-x" />
                <span className="relative z-10">Check Properties</span>
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="px-6 md:px-8 py-4 md:py-5 border border-primary/20 font-mono text-[11px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary hover:bg-primary/5 transition-all active:scale-95 text-center shrink-0 w-full md:w-auto"
              >
                Contact Us
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

      {/* Schedule / Contact 2-Column Promo Section */}
      <section className="py-24 bg-white jade-wash-bg border-b border-outline/10 select-none overflow-hidden relative">
        {/* Faded Jade Landscape Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url('/jade-bg.jpg')` }}
        />
        <div className="mx-auto max-w-container-max px-gutter grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          {/* Column 1: Schedule Tour */}
          <div 
            onClick={() => navigate('/schedule')}
            className="group relative flex flex-col items-center p-10 bg-white hover:bg-[#E8F3EF] rounded-lg border border-[#a5c1b5]/35 hover:border-primary-light/45 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 cursor-pointer text-center"
          >
            {/* Animated Gradient Icon Container */}
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 shadow-md group-hover:scale-110 group-hover:shadow-primary/20 mb-6">
              {/* Default background (soft jade tint) */}
              <div className="absolute inset-0 bg-[#E8F3EF] border border-primary/10 transition-opacity duration-500 group-hover:opacity-0" />
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-primary to-primary-neon opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              {/* Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 w-7 h-7 text-primary transition-colors duration-500 group-hover:text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            
            <h3 className="font-serif text-xl font-bold text-primary mb-3 group-hover:text-primary-light transition-colors duration-300">Schedule Tour</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed max-w-sm mb-5">
              Have you found the right estate for you? Schedule an on-site or online tour with us to learn more.
            </p>
            <button 
              className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary group-hover:text-primary-light border-b border-primary/20 group-hover:border-primary-light/50 pb-0.5 transition-all duration-300 flex items-center gap-1 cursor-pointer"
            >
              Schedule Now <span className="transform transition-transform duration-300 group-hover:translate-x-1">&gt;</span>
            </button>
          </div>

          {/* Column 2: Contact Us */}
          <div 
            onClick={() => navigate('/contact')}
            className="group relative flex flex-col items-center p-10 bg-white hover:bg-[#E8F3EF] rounded-lg border border-[#a5c1b5]/35 hover:border-primary-light/45 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 cursor-pointer text-center"
          >
            {/* Animated Gradient Icon Container */}
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 shadow-md group-hover:scale-110 group-hover:shadow-primary/20 mb-6">
              {/* Default background (soft jade tint) */}
              <div className="absolute inset-0 bg-[#E8F3EF] border border-primary/10 transition-opacity duration-500 group-hover:opacity-0" />
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-primary to-primary-neon opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              {/* Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 w-7 h-7 text-primary transition-colors duration-500 group-hover:text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            
            <h3 className="font-serif text-xl font-bold text-primary mb-3 group-hover:text-primary-light transition-colors duration-300">Contact Us</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed max-w-sm mb-5">
              Puyoko is ready to help you in your home buying experience. Get in touch with our team today!
            </p>
            <button 
              className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary group-hover:text-primary-light border-b border-primary/20 group-hover:border-primary-light/50 pb-0.5 transition-all duration-300 flex items-center gap-1 cursor-pointer"
            >
              Contact Us Now <span className="transform transition-transform duration-300 group-hover:translate-x-1">&gt;</span>
            </button>
          </div>
        </div>
      </section>

      {/* Services Module - Natural Tones Design Layout */}
      <section className="bg-primary text-white pt-24 pb-32 relative">
        {/* Curvy Top Divider */}
        <div className="absolute bottom-full left-0 w-full overflow-hidden leading-none flex items-end -mb-[2px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px] md:h-[120px] text-primary fill-current translate-y-[2px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
        <div className="absolute top-10 right-10 text-9xl opacity-5 font-serif select-none">和</div>
        <div className="mx-auto max-w-container-max px-gutter grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="text-primary-neon text-xs font-mono tracking-[0.4em] uppercase">SERVICES / 服务</span>
              <div className="h-[1px] w-20 bg-primary-neon/30"></div>
            </div>
            <h2 className="font-display text-5xl font-light mb-8 text-white">Our Core <span className="italic-serif text-primary-neon">Services</span></h2>
            <div className="space-y-6 font-sans text-lg text-white/80 leading-relaxed max-w-md">
              <p>
                Puyoko Premium Estates offers a comprehensive suite of real estate solutions. From lease properties and contractual operations to strategic advertising and alliances, we ensure seamless transactions and preservation.
              </p>
              <p>
                We collaborate with Cebu's top-tier accredited brokers and design visionaries to deliver high-production results that honor Visayan heritage.
              </p>
            </div>
            <button 
              onClick={() => navigate('/about/services')}
              className="mt-12 px-10 py-4 border border-white/30 font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-primary transition-all active:scale-95 cursor-pointer"
            >
              Explore Services / 探索服务
            </button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 space-y-10">
            <h3 className="uppercase tracking-[0.4em] text-xs font-bold text-primary-neon">Ecosystem / 服务体系</h3>
            <div className="space-y-8">
              {[
                { name: "Lease Properties", val: "Accredited Realty" },
                { name: "Contractual Operations", val: "Silent Luxury" },
                { name: "Digital Advertising & Lead Generation", val: "Strategic Reach" },
                { name: "Property Stewardship & Maintenance", val: "Preserving Legacy" },
                { name: "Partnership & Alliances", val: "Tailored Solutions" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-base font-display font-light tracking-wide text-white/90">{item.name}</span>
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

      {/* Dynamic Latest Journal Section */}
      <section className="mx-auto max-w-container-max px-gutter py-24 select-none">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-primary-light text-xs font-mono tracking-[0.4em] uppercase block mb-3">LATEST JOURNAL / 资讯</span>
          <h2 className="font-display text-3xl md:text-5xl font-light text-primary mb-4 leading-tight">
            Featured <span className="italic-serif text-primary-light">Insight</span>
          </h2>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
            Stay informed with our most recent market updates, buying guides, and Visayan design aesthetics.
          </p>
        </div>

        {mediaLoading ? (
          /* High-Fidelity Skeleton Loader */
          <div className="bg-white border border-outline/25 rounded-sm overflow-hidden grid md:grid-cols-2 gap-0 shadow-lg animate-pulse">
            <div className="aspect-[16/10] md:aspect-auto bg-surface-muted min-h-[300px]" />
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
              <div className="h-4 bg-outline/20 w-1/4 rounded" />
              <div className="h-8 bg-outline/20 w-3/4 rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-outline/20 w-full rounded" />
                <div className="h-4 bg-outline/20 w-5/6 rounded" />
              </div>
              <div className="h-10 bg-outline/20 w-1/3 rounded mt-4" />
            </div>
          </div>
        ) : latestBlog ? (
          /* Premium Interactive Card Showcase */
          <div 
            onClick={() => navigate('/media?tab=blogs')}
            className="bg-white border border-outline/25 rounded-sm overflow-hidden grid md:grid-cols-2 gap-0 group hover:shadow-2xl hover:border-primary/20 transition-all duration-500 cursor-pointer relative"
          >
            {/* Visual Column */}
            <div className="relative overflow-hidden bg-surface-muted aspect-[16/10] md:aspect-auto min-h-[350px]">
              <img 
                src={latestBlog.image} 
                alt={latestBlog.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-[9px] font-extrabold uppercase font-display tracking-widest text-primary shadow-sm border border-outline/10">
                {latestBlog.category}
              </span>
            </div>

            {/* Content & Details Column */}
            <div className="p-8 md:p-12 flex flex-col justify-center relative">
              {/* Decorative Chinese character in background */}
              <div className="absolute right-8 bottom-4 text-[120px] font-serif text-primary/5 select-none pointer-events-none group-hover:text-primary/10 transition-colors duration-500">
                墨
              </div>

              {/* Meta information */}
              <div className="flex items-center gap-4 text-[9px] font-display font-extrabold uppercase tracking-widest text-on-surface-variant/40 mb-4 z-10">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary/50" /> {latestBlog.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary/50" /> {latestBlog.readTime}
                </span>
              </div>

              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4 leading-snug group-hover:text-primary-light transition-colors duration-300 z-10">
                {latestBlog.title}
              </h3>
              
              <p className="font-sans text-sm text-on-surface-variant/90 leading-relaxed mb-6 max-w-xl z-10">
                {latestBlog.excerpt}
              </p>

              <div className="border-t border-outline/10 pt-6 flex justify-between items-center mt-4 z-10">
                <span className="text-xs font-mono text-primary/50 uppercase tracking-widest">{latestBlog.date}</span>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigate('/media?tab=blogs'); 
                  }}
                  className="flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-widest text-primary hover:text-primary-light transition-all hover:gap-2.5 active:scale-95 border-0 bg-transparent outline-none cursor-pointer"
                >
                  Read Full Article <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Fallback State */
          <div className="flex h-64 flex-col items-center justify-center rounded-sm border border-dashed border-outline-variant/30 text-center p-8 bg-white/50">
            <BookOpen className="w-8 h-8 text-primary/40 mb-3 animate-pulse" />
            <p className="font-display text-lg font-bold text-on-surface-variant">No featured insights published yet</p>
          </div>
        )}
      </section>



      {/* Footer Biography Section */}
      <section className="py-24 px-gutter border-t border-outline/20 bg-background-warm/50">
        <div className="mx-auto max-w-container-max grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 max-w-sm mx-auto lg:mx-0 relative z-10">
            <div className="aspect-[3/4] overflow-hidden border border-outline shadow-xl relative min-h-[400px] bg-[#E8F3EF]">
              {janEricPhotos.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt="Jan Eric Saladaga" 
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-1500 ease-in-out",
                    currentJanEricPhoto === idx ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                  )}
                />
              ))}
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 font-serif italic text-xl shadow-lg z-20">
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
                Started building his brand at 22 while on his internship, his journey into real estate began with a profound appreciation for the local spaces in Cebu. Starting as a visionary looking to bridge the gap between historic Filipino homes and modern living, he founded Puyoko to redefine what a luxury real estate experience should be.
              </p>
              <p>
                His philosophy is simple: a home is not just a structure, but a canvas for life's most important moments. Under his guidance, Puyoko has grown into a trusted name for discerning clients seeking properties that offer both heritage and modernity.
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
