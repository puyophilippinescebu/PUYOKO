import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFormModal } from '../components/PropertyFormModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { Property } from '../types';
import { cn, normalizeLocation } from '../lib/utils';
import { useProperties } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Home,
  RotateCcw,
  SlidersHorizontal,
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Custom Dropdown ──────────────────────────────────────────────────────────
interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange, icon, className }) => {
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
    <div ref={ref} className={cn('relative group', className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-6 py-[16px] text-left outline-none hover:bg-primary/[0.02] transition-colors duration-300"
      >
        {icon && <div className="text-primary/60 group-hover:text-primary transition-colors shrink-0">{icon}</div>}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[8px] font-mono text-outline uppercase tracking-[0.2em] mb-0.5">{label}</span>
          <span className="font-sans text-[11px] font-bold text-primary truncate">
            {value}
          </span>
        </div>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-outline/50 transition-transform duration-300 shrink-0', open && 'rotate-180')}
        />
      </button>

      {/* Panel */}
      <div
        className={cn(
          'absolute top-[calc(100%+6px)] left-0 z-50 min-w-[240px] bg-white/95 backdrop-blur-md border border-outline/25 shadow-2xl rounded-sm overflow-hidden origin-top',
          'transition-all duration-300 ease-out',
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
        )}
      >
        {/* Panel header */}
        <div className="px-6 py-3 border-b border-outline/10 bg-primary/[0.02]">
          <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-primary/75">{label} / Options</span>
        </div>

        <div className="py-1">
          {options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                'w-full text-left px-6 py-3.5 font-mono text-[9px] uppercase tracking-widest',
                'flex items-center gap-2.5 transition-all duration-300',
                value === opt
                  ? 'bg-primary text-white font-extrabold'
                  : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary hover:pl-8'
              )}
            >
              {value === opt ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-primary/10 shrink-0 transition-all" />
              )}
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userEmail } = useAuth();
  const { properties, loading, addProperty, updateProperty, deleteProperty, syncAllPropertiesToSheets, submitPropertyRequest } = useProperties();

  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const isAllowedToEdit = (property: Property) => {
    if (!isAuthenticated || !userEmail) return false;
    if (userEmail === 'puyophilippinescebu@gmail.com') return true;
    return !property.createdBy || property.createdBy === userEmail;
  };

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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSaveVideoUrl = () => {
    localStorage.setItem('puyoko_homepage_video_url', videoUrlInput.trim());
    // Dispatch storage event so LandingPage (same window) can react immediately if opened
    window.dispatchEvent(new Event('storage'));
    alert('Homepage video URL successfully updated!');
  };

  const handleSyncAll = async () => {
    setSyncStatus('loading');
    try {
      await syncAllPropertiesToSheets();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 5000);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
      alert('Failed to sync properties to Google Sheets. Check your VITE_GOOGLE_SCRIPT_URL deployment.');
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (!isAuthenticated && p.status === 'Archived') return false;
      const matchesType = listingType === 'All Properties' || p.type === listingType;
      const matchesCity = selectedCity === 'All Cities' || normalizeLocation(p.city) === selectedCity;
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

  const cities = ['All Cities', ...Array.from(new Set(properties.map(p => normalizeLocation(p.city)))).filter(Boolean).sort()];
  const types = ['All Properties', 'For Sale', 'For Rent'];

  return (
    <div className="mx-auto max-w-container-max px-gutter py-10 md:py-20">
      {/* Admin Control Panel Card */}
      {isAuthenticated && (
        <div className="mb-10 rounded-sm border border-outline/30 bg-white/95 frosted-jade p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-outline/20">
          {/* Section 1: Video Config */}
          <div className="pb-6 md:pb-0 md:pr-8">
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
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                value={videoUrlInput}
                onChange={e => setVideoUrlInput(e.target.value)}
                className="flex-grow border-b border-outline/30 bg-transparent py-2.5 px-3 focus:border-primary outline-none text-xs font-sans transition-colors"
              />
              <button
                onClick={handleSaveVideoUrl}
                className="bg-primary text-white px-6 py-3.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-primary-light active:scale-95 shrink-0"
              >
                Update Video URL
              </button>
            </div>
          </div>

          {/* Section 2: Google Sheets Sync */}
          <div className="pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h3 className="font-display text-sm font-bold text-primary uppercase tracking-wider">Google Sheets Property Sync</h3>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mb-4 leading-relaxed">
                Sync all properties in the database to the Google Sheet tab (**Property Update**). 
                Future creations, modifications, and deletions will sync automatically in the background.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap mt-2">
              <button
                onClick={handleSyncAll}
                disabled={syncStatus === 'loading'}
                className={cn(
                  "bg-primary text-white px-6 py-3.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shrink-0 disabled:opacity-60 flex items-center gap-2",
                  syncStatus === 'loading' ? 'cursor-wait' : 'hover:bg-primary-light'
                )}
              >
                {syncStatus === 'loading' && <RefreshCw className="h-3 w-3 animate-spin" />}
                {syncStatus === 'loading' ? 'Syncing...' : 'Sync All Properties'}
              </button>
              
              {syncStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-green-600 font-mono text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                  <Check className="h-4 w-4" />
                  Synced Successfully
                </div>
              )}
              {syncStatus === 'error' && (
                <div className="flex items-center gap-1.5 text-red-600 font-mono text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                  <AlertTriangle className="h-4 w-4" />
                  Sync Failed
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Filter Engine */}
      <section className="mb-10 md:mb-16">
        <div className="border border-outline/35 bg-white/90 backdrop-blur-md rounded-lg shadow-lg shadow-primary/5 transition-all duration-300 relative z-30">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center">
            {/* Search (Always visible, spans 1 grid column on desktop) */}
            <div className="relative border-b md:border-b-0 md:border-r border-outline/10 px-6 py-[16px] md:col-span-1 group hover:bg-primary/[0.02] transition-colors duration-300 flex items-center gap-3">
              <Search className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[8px] font-mono text-outline uppercase tracking-[0.2em] mb-0.5">Search Keyword</span>
                <input
                  type="text"
                  placeholder="Search Archive..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent font-sans text-[11px] font-bold text-primary placeholder-outline/40 outline-none"
                />
              </div>
            </div>

            {/* Mobile Filter Toggle Button (Hidden on desktop) */}
            <div className="flex md:hidden items-center justify-between px-6 py-[18px] border-b border-outline/10 bg-primary/[0.01]">
              <button
                onClick={() => setShowFiltersMobile(s => !s)}
                className="w-full flex items-center justify-between text-left font-mono text-[9px] font-extrabold uppercase tracking-widest text-primary outline-none"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary/60" />
                  {showFiltersMobile ? "Hide Filter Options" : "Show Filter Options (City, Type)"}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-primary/50 transition-transform duration-300", showFiltersMobile && "rotate-180")} />
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
                icon={<MapPin className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />}
                className="border-b md:border-b-0 md:border-r border-outline/10"
              />

              {/* Type */}
              <FilterDropdown
                label="Type"
                value={listingType}
                options={types}
                onChange={setListingType}
                icon={<Home className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />}
                className="border-b md:border-b-0 md:border-r border-outline/10"
              />

              {/* Reset / Status Button */}
              <div className="px-6 py-4 md:py-0">
                {searchQuery !== '' || selectedCity !== 'All Cities' || listingType !== 'All Properties' ? (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCity('All Cities'); setListingType('All Properties'); }}
                    className="group relative w-full overflow-hidden bg-primary text-white py-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] transition-all duration-500 hover:shadow-lg hover:shadow-primary/30 btn-press active:scale-95 cursor-pointer rounded-sm border-0 outline-none flex items-center justify-center gap-1.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-light via-primary to-primary-light opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 bg-[length:200%_auto] group-hover:animate-gradient-x" />
                    <span className="relative z-10 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Filters
                    </span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full border border-outline/20 bg-primary/[0.02] text-outline/50 py-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] cursor-not-allowed rounded-sm flex items-center justify-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    No Active Filters
                  </button>
                )}
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
            onEdit={isAllowedToEdit(prop) ? p => { setEditingProperty(p); setIsFormOpen(true); } : undefined}
            onDelete={isAllowedToEdit(prop) ? () => setPropertyToDelete(prop) : undefined}
            onArchive={isAllowedToEdit(prop) ? () => {
              if (userEmail === 'puyophilippinescebu@gmail.com') {
                updateProperty({ ...prop, status: prop.status === 'Archived' ? 'Active' : 'Archived' });
              } else {
                submitPropertyRequest({
                  type: 'ARCHIVE',
                  propertyId: prop.id,
                  propertyName: prop.title,
                  requestedBy: userEmail || 'unknown-agent'
                });
                alert('Request Submitted: Your request to archive this listing has been submitted to the Director.');
              }
            } : undefined}
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
          if (editingProperty) {
            if (userEmail === 'puyophilippinescebu@gmail.com') {
              updateProperty({ ...editingProperty, ...data });
            } else {
              submitPropertyRequest({
                type: 'EDIT',
                propertyId: editingProperty.id,
                propertyName: editingProperty.title,
                requestedBy: userEmail || 'unknown-agent',
                proposedData: data
              });
              alert('Request Submitted: Your edits have been submitted to the Director for approval.');
            }
          } else {
            addProperty(data);
          }
        }}
        initialData={editingProperty}
      />

      <DeleteConfirmationModal
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        propertyName={propertyToDelete?.title}
        onConfirm={() => {
          if (propertyToDelete) {
            if (userEmail === 'puyophilippinescebu@gmail.com') {
              deleteProperty(propertyToDelete.id);
            } else {
              submitPropertyRequest({
                type: 'DELETE',
                propertyId: propertyToDelete.id,
                propertyName: propertyToDelete.title,
                requestedBy: userEmail || 'unknown-agent'
              });
              alert('Request Submitted: Your request to delete this listing has been submitted to the Director.');
            }
          }
        }}
      />
    </div>
  );
};
