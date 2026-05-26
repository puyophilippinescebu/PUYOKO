import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

        {/* Collage */}
        <div className="mb-10 grid h-[50vh] min-h-[400px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl bg-surface-muted">
          {property.images.length >= 5 ? (
            <>
              <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
              <img onClick={() => { setCurrentImage(1); setIsLightboxOpen(true); }} src={property.images[1]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
              <img onClick={() => { setCurrentImage(2); setIsLightboxOpen(true); }} src={property.images[2]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
              <img onClick={() => { setCurrentImage(3); setIsLightboxOpen(true); }} src={property.images[3]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
              <img onClick={() => { setCurrentImage(4); setIsLightboxOpen(true); }} src={property.images[4]} alt={property.title} className="h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
            </>
          ) : property.images.length >= 3 ? (
            <>
              <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
              <img onClick={() => { setCurrentImage(1); setIsLightboxOpen(true); }} src={property.images[1]} alt={property.title} className="col-span-2 row-span-1 h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
              <img onClick={() => { setCurrentImage(2); setIsLightboxOpen(true); }} src={property.images[2]} alt={property.title} className="col-span-2 row-span-1 h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
            </>
          ) : property.images.length === 2 ? (
            <>
              <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
              <img onClick={() => { setCurrentImage(1); setIsLightboxOpen(true); }} src={property.images[1]} alt={property.title} className="col-span-2 row-span-2 h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
            </>
          ) : (
            <img onClick={() => { setCurrentImage(0); setIsLightboxOpen(true); }} src={property.images[0] || ''} alt={property.title} className="col-span-4 row-span-2 h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer" />
          )}
        </div>

        {/* Info Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap gap-2">
              {property.tags.map(tag => (
                <span key={tag} className="rounded bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mb-2 font-display text-4xl sm:text-5xl font-black text-primary leading-tight">
              {property.title}
            </h1>
            <p className="mb-8 font-display text-3xl font-bold text-on-surface">
              {formattedPrice}
            </p>

            <div className="mb-10 grid grid-cols-3 gap-4 rounded-xl border border-outline-variant/30 bg-surface-muted p-6">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Bedrooms</span>
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-primary" />
                  <span className="font-sans font-bold text-lg">{property.bedrooms}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Bathrooms</span>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-primary" />
                  <span className="font-sans font-bold text-lg">{property.bathrooms}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Area</span>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-primary" />
                  <span className="font-sans font-bold text-lg">{property.area} sqm</span>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-on-surface">Description</h4>
              <p className="font-sans text-base leading-relaxed text-on-surface-variant">{property.description}</p>
            </div>

            <div>
              <h4 className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-on-surface">Location</h4>
              <div className="mb-6 flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-sans font-bold text-base text-on-surface">{property.city}</p>
                  <p className="font-sans text-base text-on-surface-variant">{property.address}</p>
                </div>
              </div>

              {property.landmarks && (
                <div className="mb-6 rounded-lg bg-primary/5 p-5 border border-primary/10">
                  <h5 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">Nearby Landmarks</h5>
                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{property.landmarks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Map */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 flex flex-col gap-6">
              <div className="group relative w-full overflow-hidden rounded-2xl bg-surface-muted border border-outline-variant/30 aspect-square lg:aspect-auto lg:h-[400px]">
                <iframe
                  title="Google Maps"
                  className="absolute inset-0 h-full w-full border-0 grayscale transition-all duration-700 group-hover:grayscale-0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address + ' ' + property.city)}&t=m&z=15&output=embed&iwloc=near`}
                  loading="lazy"
                />
                {property.mapsLink && (
                  <a
                    href={property.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-mono text-[10px] font-bold text-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Maps
                  </a>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full rounded-full bg-primary py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-primary-light active:scale-95"
                >
                  Schedule Viewing
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full rounded-full border-2 border-primary/20 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/5 active:scale-95"
                >
                  Contact Agent
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={property.images[currentImage]}
            alt={property.title}
            className="max-h-[90vh] max-w-[90vw] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {property.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
              
              <div className="absolute bottom-6 font-mono text-sm tracking-widest text-white/70">
                {currentImage + 1} / {property.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
