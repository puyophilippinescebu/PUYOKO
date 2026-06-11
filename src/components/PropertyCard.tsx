import React from 'react';
import { MapPin, Bed, Bath, Square, Heart, Edit2, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Property } from '../types';
import { cn, normalizeLocation } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, onEdit, onDelete, onArchive }) => {
  const { isAuthenticated } = useAuth();
  const { requests } = useProperties();
  const pendingReq = requests.find(r => r.propertyId === property.id);

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
    <div
      className={cn(
        "group overflow-hidden rounded-sm border border-outline/30 bg-white shadow-sm transition-all duration-500",
        onClick ? "cursor-pointer hover:shadow-2xl hover:border-primary/20" : "cursor-default"
      )}
      onClick={() => onClick?.(property)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {property.images[0]?.startsWith('data:video/') || property.images[0]?.endsWith('.mp4') || property.images[0]?.endsWith('.mov') || property.images[0]?.endsWith('.webm') ? (
          <video
            src={property.images[0]}
            className={cn(
              "h-full w-full object-cover transition-transform duration-1000", 
              onClick && "group-hover:scale-105",
              property.status === 'Unavailable' && "grayscale-[80%] opacity-90"
            )}
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <img
            src={property.images[0]}
            alt={property.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-1000", 
              onClick && "group-hover:scale-110",
              property.status === 'Unavailable' && "grayscale-[80%] opacity-90"
            )}
          />
        )}
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6 bg-white/90 backdrop-blur-md px-3 py-1.5 font-display text-[9px] font-extrabold text-primary uppercase tracking-[0.25em] border border-outline/15 shadow-sm max-w-[85%] truncate" title={`${property.type} / ${normalizeLocation(property.city)}`}>
          {property.type} / {normalizeLocation(property.city)}
        </div>

        {['Archived', 'Unavailable'].includes(property.status) && (
          <div className={cn(
            "absolute left-4 top-12 sm:left-6 sm:top-14 backdrop-blur-md px-3 py-1.5 font-display text-[9px] font-extrabold text-white uppercase tracking-[0.25em] shadow-lg",
            property.status === 'Archived' && "bg-[#4B5563]/90 border border-white/10",
            property.status === 'Unavailable' && "bg-[#5D6B65]/95 border border-white/10"
          )}>
            {property.status}
          </div>
        )}

        {isAuthenticated && pendingReq && pendingReq.status === 'PENDING' && (
          <div 
            className={cn(
              "absolute left-4 bg-amber-600/95 backdrop-blur-md px-3 py-1.5 font-display text-[9px] font-extrabold text-white uppercase tracking-[0.25em] shadow-lg border border-white/10 animate-pulse",
              property.status === 'Archived' ? "top-20 sm:top-22" : "top-12 sm:top-14"
            )}
          >
            Pending {pendingReq.type === 'EDIT' ? 'Edit' : pendingReq.type === 'DELETE' ? 'Delete' : pendingReq.type === 'ARCHIVE' ? 'Archive' : 'Creation'} Approval
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-primary leading-tight tracking-wide mb-1">
              {property.title}
            </h3>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">ID: {property.id}</p>
          </div>
          <button className="text-outline transition-colors hover:text-primary">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-baseline gap-2 flex-wrap min-h-[32px]">
          {property.originalPrice != null && property.originalPrice > 0 && property.originalPrice > property.price && (
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs font-normal text-on-surface-variant/50 line-through decoration-red-500/30">
                {new Intl.NumberFormat(
                  property.currency === 'USD' ? 'en-US' :
                  property.currency === 'EUR' ? 'de-DE' :
                  property.currency === 'JPY' ? 'ja-JP' : 'en-PH',
                  {
                    style: 'currency',
                    currency: property.currency || 'PHP',
                    maximumFractionDigits: 0,
                  }
                ).format(property.originalPrice)}
              </span>
              <span className="font-mono text-[10px] font-extrabold text-red-600 bg-red-50 px-1 py-0.5 rounded leading-none">
                -{Math.round(((property.originalPrice - property.price) / property.originalPrice) * 100)}%
              </span>
            </div>
          )}
          <div className="font-display text-[22px] font-extrabold text-primary tracking-tight">
            {formattedPrice}
            {property.type === 'For Rent' && (
              <span className="text-xs font-semibold text-on-surface-variant/70 lowercase font-sans ml-1">
                / {property.pricePeriod || 'mo'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-outline/10 pt-4 font-sans text-xs font-bold tracking-wide text-on-surface-variant/80">
          <div className="flex items-center gap-4">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-primary/60" />
                <span>{property.bedrooms} Bed</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-primary/60" />
                <span>{property.bathrooms} Bath</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Square className="h-3.5 w-3.5 text-primary/60" />
              <span>{property.area} m²</span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-widest text-primary-light/90">
            Heritage
          </div>
        </div>
      </div>

      {/* Admin Action Toolbar */}
      {isAuthenticated && (onArchive || onEdit || onDelete) && (
        <div className="flex border-t border-outline/10 bg-surface-muted/30">
          {onArchive && (
            <button
              onClick={(e) => { e.stopPropagation(); onArchive(property.id); }}
              className="flex-grow flex items-center justify-center gap-2 py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest text-orange-600 hover:bg-orange-50/50 hover:text-orange-700 transition-colors border-r border-outline/10"
              title={property.status === 'Archived' ? 'Unarchive Property' : 'Archive Property'}
            >
              {property.status === 'Archived' ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              <span>{property.status === 'Archived' ? 'Restore' : 'Archive'}</span>
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(property); }}
              className="flex-grow flex items-center justify-center gap-2 py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors border-r border-outline/10"
              title="Edit Property Details"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
              className="flex-grow flex items-center justify-center gap-2 py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete Property"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
