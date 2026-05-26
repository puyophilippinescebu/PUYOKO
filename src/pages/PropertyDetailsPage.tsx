import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight, ExternalLink, Link as LinkIcon, Check, X } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';
import { cn } from '../lib/utils';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, loading } = useProperties();
  const [currentImage, setCurrentImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const property = properties.find(p => p.id === id);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, property]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="font-mono text-xs uppercase tracking-widest text-primary animate-pulse">Loading Estate...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-surface gap-6">
        <div className="font-display text-3xl font-black text-primary">Estate Not Found</div>
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Portfolio
        </button>
      </div>
    );
  }

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % property.images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);

  const formattedPrice = new Intl.NumberFormat(
    property.currency === 'USD' ? 'en-US' :
    property.currency === 'EUR' ? 'de-DE' :
    property.currency === 'JPY' ? 'ja-JP' : 'en-PH',
    {
      style: 'currency',
      currency: property.currency || 'PHP',
      maximumFractionDigits: 0,
    }
  ).format(property.price);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-outline-variant/30"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-full bg-surface-muted px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-outline-variant/30 active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <LinkIcon className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Photos Section */}
        <div className="mb-6 animate-fade-in">
          {/* Mobile Swipeable Gallery */}
          <div className="md:hidden relative w-full h-[35vh] min-h-[260px] bg-surface-muted rounded-2xl overflow-hidden shadow-sm">
            <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none">
              {property.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="w-full h-full flex-shrink-0 snap-start cursor-pointer"
                  onClick={() => { setCurrentImage(idx); setIsLightboxOpen(true); }}
                >
                  <img 
                    src={img} 
                    alt={`${property.title} - ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Gallery Indicator */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider">
              {property.images.length} Photos (Tap to Zoom)
            </div>
          </div>

          {/* Desktop/Tablet Grid Collage */}
          <div className="hidden md:grid h-[35vh] min-h-[260px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl bg-surface-muted shadow-sm">
            {property.images.length >= 5 ? (
              <>
                <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
                <img onClick={() => { setCurrentImage(1); setIsLightboxOpen(true); }} src={property.images[1]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
                <img onClick={() => { setCurrentImage(2); setIsLightboxOpen(true); }} src={property.images[2]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
                <img onClick={() => { setCurrentImage(3); setIsLightboxOpen(true); }} src={property.images[3]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
                <img onClick={() => { setCurrentImage(4); setIsLightboxOpen(true); }} src={property.images[4]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
              </>
            ) : property.images.length >= 3 ? (
              <>
                <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
                <img onClick={() => { setCurrentImage(1); setIsLightboxOpen(true); }} src={property.images[1]} alt={property.title} className="col-span-2 row-span-1 h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
                <img onClick={() => { setCurrentImage(2); setIsLightboxOpen(true); }} src={property.images[2]} alt={property.title} className="col-span-2 row-span-1 h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
              </>
            ) : property.images.length === 2 ? (
              <>
                <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
                <img onClick={() => { setCurrentImage(1); setIsLightboxOpen(true); }} src={property.images[1]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
              </>
            ) : (
              <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0] || ''} alt={property.title} className="col-span-4 row-span-2 h-full w-full object-cover transition-transform hover:scale-[1.02] duration-300 cursor-pointer" />
            )}
          </div>
        </div>

        {/* Info Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap gap-2">
              {property.tags.map(tag => (
                <span key={tag} className="rounded bg-primary/10 px-3 py-1.5 font-display text-[9px] font-extrabold uppercase tracking-widest text-primary">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mb-2 font-serif text-3xl sm:text-4xl font-bold text-primary leading-tight tracking-wide">
              {property.title}
            </h1>
            <p className="mb-4 font-display text-2xl font-extrabold text-on-surface tracking-tight">
              {formattedPrice}
            </p>

            {/* Dynamic Grid Columns */}
            {(() => {
              const hasBed = property.bedrooms > 0;
              const hasBath = property.bathrooms > 0;
              const colSpanClass = (hasBed && hasBath) ? "grid-cols-3" : (hasBed || hasBath) ? "grid-cols-2" : "grid-cols-1";
              
              return (
                <div className={`mb-5 grid ${colSpanClass} gap-4 rounded-xl border border-outline-variant/30 bg-surface-muted py-4 px-6`}>
                  {hasBed && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/50">Bedrooms</span>
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-primary/70" />
                        <span className="font-sans font-extrabold text-base text-on-surface">{property.bedrooms}</span>
                      </div>
                    </div>
                  )}
                  {hasBath && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/50">Bathrooms</span>
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-primary/70" />
                        <span className="font-sans font-extrabold text-base text-on-surface">{property.bathrooms}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/50">Area</span>
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary/70" />
                      <span className="font-sans font-extrabold text-base text-on-surface">{property.area} sqm</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mb-6">
              <h4 className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Description</h4>
              <p className="font-sans text-sm leading-relaxed text-on-surface-variant">{property.description}</p>
            </div>

            <div>
              <h4 className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Location</h4>
              <div className="mb-4 flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-sans font-bold text-sm text-on-surface">{property.city}</p>
                  <p className="font-sans text-sm text-on-surface-variant">{property.address}</p>
                </div>
              </div>
 
              {property.landmarks && (
                <div className="mb-4 rounded-lg bg-primary/5 p-4 border border-primary/10">
                  <h5 className="mb-1 font-display text-[9px] font-bold uppercase tracking-widest text-primary">Nearby Landmarks</h5>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">{property.landmarks}</p>
                </div>
              )}
            </div>
          </div>
 
          {/* Sidebar / Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 flex flex-col gap-4">
              <div className="group relative w-full overflow-hidden rounded-2xl bg-surface-muted border border-outline-variant/30 aspect-square lg:aspect-auto lg:h-[280px]">
                <iframe
                  title="Google Maps"
                  className="absolute inset-0 h-full w-full border-0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address + ' ' + property.city)}&t=m&z=15&output=embed&iwloc=near`}
                  loading="lazy"
                />
                {property.mapsLink && (
                  <a
                    href={property.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 font-mono text-[9px] font-bold text-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Maps
                  </a>
                )}
              </div>
 
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full rounded-full bg-primary py-3.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-primary-light active:scale-95"
                >
                  Schedule Viewing
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full rounded-full border-2 border-primary/20 py-3.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/5 active:scale-95"
                >
                  Contact Agent
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && createPortal(
        <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-[#07090e]/95 backdrop-blur-md transition-all duration-300" onClick={() => setIsLightboxOpen(false)}>
          {/* Close button at top-left, matching clean Messenger layout */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute left-6 top-6 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-all cursor-pointer active:scale-90"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Centered Image with beautiful rounded-2xl corners & subtle borders */}
          <div className="relative max-h-[75vh] max-w-[95vw] md:max-h-[80vh] md:max-w-[85vw] flex items-center justify-center p-1 rounded-2xl border border-white/10 bg-black/40 shadow-2xl select-none" onClick={(e) => e.stopPropagation()}>
            <img
              src={property.images[currentImage]}
              alt={property.title}
              className="max-h-[73vh] max-w-[93vw] md:max-h-[78vh] md:max-w-[83vw] object-contain rounded-xl"
            />
          </div>

          {property.images.length > 1 && (
            <>
              {/* Desktop Side Navigation Arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
              
              {/* Desktop Indicator */}
              <div className="hidden md:block absolute bottom-8 font-mono text-xs tracking-widest text-white/70">
                {currentImage + 1} / {property.images.length}
              </div>

              {/* Mobile Controller Toolbar */}
              <div className="absolute bottom-8 flex md:hidden items-center gap-6 bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-mono text-xs font-bold tracking-widest text-white/90 min-w-[40px] text-center">
                  {currentImage + 1} / {property.images.length}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
