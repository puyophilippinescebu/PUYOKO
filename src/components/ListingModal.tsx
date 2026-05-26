import React from 'react';
import { X, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';
import { cn } from '../lib/utils';

interface ListingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ListingModal: React.FC<ListingModalProps> = ({ property, isOpen, onClose }) => {
  const [currentImage, setCurrentImage] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-on-surface/60 backdrop-blur-md" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative flex h-full max-h-[95vh] md:max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 z-[110] rounded-full bg-white p-2 text-primary shadow-md transition-all hover:bg-surface-muted hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-full w-full flex-col lg:flex-row">
              {/* Image Section */}
              <div className="relative h-[35vh] w-full bg-black lg:h-auto lg:w-1/2">
                <img 
                  src={property.images[currentImage]} 
                  alt={property.title} 
                  className="h-full w-full object-cover"
                />
                
                {property.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    
                    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2 font-mono text-[10px] text-white/60">
                      {property.images.map((_, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "h-1 transition-all rounded-full",
                            idx === currentImage ? "w-8 bg-primary-neon" : "w-2 bg-white/20"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Info Section */}
              <div className="flex h-full flex-1 flex-col overflow-y-auto p-6 lg:p-8 pt-16 lg:pt-16">
                <div className="mb-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {property.tags.map(tag => (
                      <span key={tag} className="bg-primary/10 px-3 py-1 font-display text-[9px] font-extrabold uppercase tracking-widest text-primary rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="mb-2 font-serif text-3xl lg:text-4xl font-bold text-primary leading-tight tracking-wide">{property.title}</h2>
                  <p className="font-display text-2xl lg:text-3xl font-extrabold text-on-surface tracking-tight">{formattedPrice}</p>
                </div>

                {/* Dynamic Grid Columns */}
                {(() => {
                  const hasBed = property.bedrooms > 0;
                  const hasBath = property.bathrooms > 0;
                  const colSpanClass = (hasBed && hasBath) ? "grid-cols-3" : (hasBed || hasBath) ? "grid-cols-2" : "grid-cols-1";

                  return (
                    <div className={`mb-8 grid ${colSpanClass} gap-4 lg:gap-6 rounded-xl border border-outline-variant/30 bg-surface-muted p-4 lg:p-6`}>
                      {hasBed && (
                        <div className="flex flex-col gap-1">
                          <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/50">Bedrooms</span>
                          <div className="flex items-center gap-2">
                            <Bed className="h-4.5 w-4.5 text-primary/70" />
                            <span className="font-sans font-extrabold text-base text-on-surface">{property.bedrooms}</span>
                          </div>
                        </div>
                      )}
                      {hasBath && (
                        <div className="flex flex-col gap-1">
                          <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/50">Bathrooms</span>
                          <div className="flex items-center gap-2">
                            <Bath className="h-4.5 w-4.5 text-primary/70" />
                            <span className="font-sans font-extrabold text-base text-on-surface">{property.bathrooms}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="font-display text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/50">Area</span>
                        <div className="flex items-center gap-2">
                          <Square className="h-4 w-4 text-primary/70" />
                          <span className="font-sans font-extrabold text-base text-on-surface">{property.area} sqm</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="mb-10">
                  <h4 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Location</h4>
                  <div className="mb-6 flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-sans font-bold text-on-surface">{property.city}</p>
                      <p className="font-sans text-sm text-on-surface-variant leading-relaxed">{property.address}</p>
                    </div>
                  </div>
                  
                  {property.landmarks && (
                    <div className="mb-6 rounded-lg bg-primary/5 p-4 border border-primary/10">
                      <h5 className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-primary">Nearby Landmarks</h5>
                      <p className="font-sans text-sm text-on-surface-variant whitespace-pre-line">{property.landmarks}</p>
                    </div>
                  )}

                  {/* Live Google Map */}
                  <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-surface-muted border border-outline-variant/30">
                    <iframe 
                      title="Google Maps"
                      className="h-full w-full border-0"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address + " " + property.city)}&t=m&z=15&output=embed&iwloc=near`}
                      loading="lazy"
                    ></iframe>
                    
                    {property.mapsLink && (
                      <a 
                        href={property.mapsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-mono text-[10px] font-bold text-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on Google Maps
                      </a>
                    )}
                  </div>
                </div>

                <div className="mb-12">
                  <h4 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Description</h4>
                  <p className="font-sans text-sm leading-relaxed text-on-surface-variant">
                    {property.description}
                  </p>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-4">
                  <button className="bg-primary py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-primary-light btn-press">
                    Schedule a Viewing
                  </button>
                  <button className="border-2 border-primary/20 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/5 btn-press">
                    Contact Agent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
