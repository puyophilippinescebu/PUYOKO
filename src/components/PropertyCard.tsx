import React from 'react';
import { MapPin, Bed, Bath, Square, Heart, Edit2, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { Property } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, onEdit, onDelete, onArchive }) => {
  const { isAuthenticated } = useAuth();
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
      className="group cursor-pointer overflow-hidden rounded-sm border border-outline/30 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-primary/20"
      onClick={() => onClick?.(property)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute left-6 top-6 bg-white/90 backdrop-blur-md px-3 py-1.5 font-display text-[9px] font-extrabold text-primary uppercase tracking-[0.25em] border border-outline/15 shadow-sm">
          {property.type} / {property.city}
        </div>

        {property.status === 'Archived' && (
          <div className="absolute left-6 top-14 bg-red-600/90 backdrop-blur-md px-3 py-1.5 font-display text-[9px] font-extrabold text-white uppercase tracking-[0.25em] shadow-lg">
            Archived
          </div>
        )}

        {isAuthenticated && (
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onArchive?.(property.id); }}
              title={property.status === 'Archived' ? 'Unarchive' : 'Archive'}
              className="bg-white/90 backdrop-blur-md p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors shadow-lg active:scale-95"
            >
              {property.status === 'Archived' ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(property); }}
              className="bg-white/90 backdrop-blur-md p-2 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-lg active:scale-95"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(property.id); }}
              className="bg-white/90 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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

        <div className="mb-4 font-display text-[22px] font-extrabold text-primary tracking-tight">
          {formattedPrice}{property.type === 'For Rent' ? '/mo' : ''}
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
    </div>
  );
};
