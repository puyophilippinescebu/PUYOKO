import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFormModal } from '../components/PropertyFormModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { Property } from '../types';
import { cn } from '../lib/utils';
import { useProperties } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ChevronDown, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Custom Dropdown ──────────────────────────────────────────────────────────
interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-6 py-[22px] text-left outline-none"
      >
        <span className="text-[10px] font-mono text-outline uppercase tracking-widest shrink-0">{label} /</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary truncate flex-1">
          {value}
        </span>
        <ChevronDown
          className={cn('h-3 w-3 text-outline/50 transition-transform duration-300 shrink-0', open && 'rotate-180')}
        />
      </button>

      {/* Panel */}
      <div
        className={cn(
          'absolute top-[calc(100%+2px)] left-0 z-50 min-w-[220px] bg-white border border-outline/20 shadow-2xl overflow-hidden origin-top',
          'transition-all duration-200',
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
        )}
      >
        {/* Panel header */}
        <div className="px-6 py-2.5 border-b border-outline/10 bg-surface/50">
          <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-outline">{label}</span>
        </div>

        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => { onChange(opt); setOpen(false); }}
            className={cn(
              'w-full text-left px-6 py-3.5 font-mono text-[10px] uppercase tracking-widest',
              'flex items-center gap-3 transition-all duration-150',
              i < options.length - 1 && 'border-b border-outline/[0.07]',
              value === opt
                ? 'bg-primary text-white'
                : 'text-on-surface hover:bg-primary/5 hover:text-primary hover:pl-8'
            )}
          >
            {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { properties, loading, addProperty, updateProperty, deleteProperty } = useProperties();

  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const [listingType, setListingType] = useState<string>('All Properties');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [listingType, selectedCity, searchQuery]);

  const [videoUrlInput, setVideoUrlInput] = useState(localStorage.getItem('puyoko_homepage_video_url') || '');

  const handleSaveVideoUrl = () => {
    localStorage.setItem('puyoko_homepage_video_url', videoUrlInput.trim());
    // Dispatch storage event so LandingPage (same window) can react immediately if opened
    window.dispatchEvent(new Event('storage'));
    alert('Homepage video URL successfully updated!');
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (!isAuthenticated && p.status === 'Archived') return false;
      const matchesType = listingType === 'All Properties' || p.type === listingType;
      const matchesCity = selectedCity === 'All Cities' || p.city === selectedCity;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCity && matchesSearch;
    });
  }, [properties, listingType, selectedCity, searchQuery, isAuthenticated]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cities = ['All Cities', ...Array.from(new Set(properties.map(p => p.city)))];
  const types = ['All Properties', 'For Sale', 'For Rent'];

  return (
    <div className="mx-auto max-w-container-max px-gutter py-10 md:py-20">
      {/* Admin Video URL Configuration Card */}
      {isAuthenticated && (
        <div className="mb-10 rounded-sm border border-outline/30 bg-white/95 frosted-jade p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-display text-sm font-bold text-primary uppercase tracking-wider">Homepage Video Showcase Config</h3>
          </div>
          <p className="font-sans text-xs text-on-surface-variant mb-4 leading-relaxed">
            Paste a video URL from **YouTube**, **TikTok**, or **Facebook** to dynamically feature a video player on your homepage. 
            Leave the field completely empty to hide the homepage video section.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.tiktok.com/@user/video/..."
              value={videoUrlInput}
              onChange={e => setVideoUrlInput(e.target.value)}
              className="flex-grow border-b border-outline/30 bg-transparent py-2.5 px-3 focus:border-primary outline-none text-xs font-sans transition-colors"
            />
            <button
              onClick={handleSaveVideoUrl}
              className="bg-primary text-white px-8 py-3.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-primary-light active:scale-95 shrink-0"
            >
              Update Video URL
            </button>
          </div>
        </div>
      )}



      {/* Filter Engine */}
      <section className="mb-10 md:mb-16">
        <div className="border border-outline/30 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center">
            {/* Search (Always visible, spans 1 grid column on desktop) */}
            <div className="relative border-b md:border-b-0 md:border-r border-outline/10 px-6 py-[22px] md:col-span-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-outline z-10" />
              <input
                type="text"
                placeholder="Search Archive..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-8 font-mono text-[10px] uppercase tracking-widest outline-none"
              />
            </div>

            {/* Mobile Filter Toggle Button (Hidden on desktop) */}
            <div className="flex md:hidden items-center justify-between px-6 py-4 border-b border-outline/10 bg-surface-muted/30">
              <button
                onClick={() => setShowFiltersMobile(s => !s)}
                className="w-full flex items-center justify-between text-left font-mono text-[10px] font-bold uppercase tracking-widest text-primary"
              >
                <span>{showFiltersMobile ? "Hide Filter Options" : "Show Filter Options (City, Type)"}</span>
                <ChevronDown className={cn("h-4 w-4 text-outline transition-transform duration-300", showFiltersMobile && "rotate-180")} />
              </button>
            </div>

            {/* Collapsible Filters Container (City, Type, Reset) */}
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-3 md:col-span-3 items-center",
              !showFiltersMobile && "hidden md:grid"
            )}>
              {/* City */}
              <FilterDropdown
                label="City"
                value={selectedCity}
                options={cities}
                onChange={setSelectedCity}
                className="border-b md:border-b-0 md:border-r border-outline/10"
              />

              {/* Type */}
              <FilterDropdown
                label="Type"
                value={listingType}
                options={types}
                onChange={setListingType}
                className="border-b md:border-b-0 md:border-r border-outline/10"
              />

              {/* Reset */}
              <div className="px-6 py-4 md:py-0">
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCity('All Cities'); setListingType('All Properties'); }}
                  className="w-full bg-primary text-white py-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:bg-primary-light active:scale-95"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Header */}
      <div ref={resultsRef} className="scroll-mt-24 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="font-display text-xl sm:text-2xl font-black text-primary">
          {loading ? 'Loading...' : `${filteredProperties.length} Estates Found`}
        </h3>
        {isAuthenticated && (
          <button
            onClick={() => { setEditingProperty(undefined); setIsFormOpen(true); }}
            className="self-start sm:self-auto flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-primary-light transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Property</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {paginatedProperties.map(prop => (
          <PropertyCard
            key={prop.id}
            property={prop}
            onClick={() => navigate(`/property/${prop.id}`)}
            onEdit={p => { setEditingProperty(p); setIsFormOpen(true); }}
            onDelete={() => setPropertyToDelete(prop)}
            onArchive={() => updateProperty({ ...prop, status: prop.status === 'Archived' ? 'Active' : 'Archived' })}
          />
        ))}
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-2">
          {/* Previous Page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-sm border border-outline/20 bg-white font-mono text-xs uppercase tracking-widest text-primary transition-all",
              "hover:border-primary hover:bg-primary/5 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-sm font-mono text-xs transition-all active:scale-95",
                currentPage === page
                  ? "bg-primary font-bold text-white shadow-md shadow-primary/20"
                  : "border border-outline/20 bg-white text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5"
              )}
            >
              {page}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-sm border border-outline/20 bg-white font-mono text-xs uppercase tracking-widest text-primary transition-all",
              "hover:border-primary hover:bg-primary/5 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {filteredProperties.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 text-center">
          <p className="mb-2 font-display text-lg font-bold text-on-surface-variant">No estates match your criteria</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCity('All Cities'); }}
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      )}

      <PropertyFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingProperty(undefined); }}
        onSave={data => {
          if (editingProperty) updateProperty({ ...editingProperty, ...data });
          else addProperty(data);
        }}
        initialData={editingProperty}
      />

      <DeleteConfirmationModal
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        propertyName={propertyToDelete?.title}
        onConfirm={() => { if (propertyToDelete) deleteProperty(propertyToDelete.id); }}
      />
    </div>
  );
};
