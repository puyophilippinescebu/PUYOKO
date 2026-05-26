import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Clock, Calendar, MapPin, Tag, BookOpen } from 'lucide-react';
import { BlogPost, EventPost } from '../contexts/MediaContext';

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BlogPost | EventPost | null;
  type: 'blog' | 'event';
}

function isBlog(item: BlogPost | EventPost): item is BlogPost {
  return (item as BlogPost).content !== undefined;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ isOpen, onClose, item, type }) => {
  // Lock background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-jade-deep/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-3xl bg-white shadow-2xl flex flex-col max-h-[92vh] rounded-sm border border-outline/20 overflow-hidden">

        {/* Hero Image */}
        <div className="relative h-56 sm:h-72 w-full shrink-0 overflow-hidden bg-surface-muted">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-jade-deep/80 via-jade-deep/20 to-transparent" />

          {/* Category badge */}
          <span className={`absolute top-4 left-4 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.25em] font-display shadow-sm
            ${type === 'blog'
              ? 'bg-white/95 backdrop-blur-md text-primary border border-outline/10'
              : 'bg-primary text-white'
            }`}>
            {type === 'blog' ? (item as BlogPost).category : (item as EventPost).category}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-lg active:scale-95 border-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug drop-shadow-md">
              {item.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {type === 'blog' && isBlog(item) ? (
            /* ── BLOG ARTICLE VIEW ── */
            <div>
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-display font-extrabold uppercase tracking-widest text-on-surface-variant/50 mb-6 pb-6 border-b border-outline/10">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary/60" />
                  {item.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  {item.readTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary/60" />
                  {item.date}
                </span>
              </div>

              {/* Excerpt */}
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6 italic border-l-2 border-primary/30 pl-4 text-primary/80">
                {item.excerpt}
              </p>

              {/* Full Content */}
              <div className="font-sans text-sm text-on-surface leading-relaxed whitespace-pre-line space-y-4">
                {item.content.split('...').map((para, i) => (
                  <p key={i}>{para.trim()}{i < item.content.split('...').length - 1 ? '...' : ''}</p>
                ))}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-outline/10 flex flex-wrap gap-2 items-center">
                  <Tag className="w-3.5 h-3.5 text-primary/50" />
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-primary/5 border border-primary/15 text-primary px-3 py-1 rounded-sm font-mono text-[9px] uppercase tracking-widest font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── EVENT VIEW ── */
            <div>
              {/* Event details block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-outline/10">
                <div className="flex items-start gap-3 bg-primary/5 rounded p-4 border border-primary/10">
                  <Calendar className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-primary/60 block mb-0.5">Date & Time</span>
                    <span className="font-sans text-sm font-semibold text-on-surface">
                      {(item as EventPost).date}
                    </span>
                    <span className="font-sans text-xs text-on-surface-variant block">
                      {(item as EventPost).time}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-primary/5 rounded p-4 border border-primary/10">
                  <MapPin className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-primary/60 block mb-0.5">Location</span>
                    <span className="font-sans text-sm font-semibold text-on-surface">
                      {(item as EventPost).location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="font-sans text-sm text-on-surface leading-relaxed mb-8">
                {(item as EventPost).description}
              </p>

              {/* Highlights */}
              {(item as EventPost).highlights && (item as EventPost).highlights.length > 0 && (
                <div>
                  <h4 className="font-display text-[10px] font-extrabold uppercase tracking-[0.3em] text-primary mb-4">
                    Event Highlights
                  </h4>
                  <ul className="space-y-3">
                    {(item as EventPost).highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="font-sans text-sm text-on-surface leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-outline/10 px-8 py-4 flex justify-end bg-surface/50 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-mono text-[9px] uppercase tracking-widest hover:bg-primary-light transition-all active:scale-95 cursor-pointer rounded-sm shadow-md border-0 outline-none"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
