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
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Home,
  RotateCcw,
  SlidersHorizontal,
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
  light?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange, icon, className, light }) => {
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
        className="w-full flex items-center gap-3 px-6 py-[16px] text-left outline-none hover:bg-white/5 transition-colors duration-300"
      >
        {icon && <div className={cn(light ? "text-white/80 group-hover:text-white" : "text-primary/60 group-hover:text-primary", "transition-colors shrink-0")}>{icon}</div>}
        <div className="flex flex-col flex-1 min-w-0">
          <span className={cn(light ? "text-white/60" : "text-outline", "text-[8px] font-mono uppercase tracking-[0.2em] mb-0.5")}>{label}</span>
          <span className={cn(light ? "text-white" : "text-primary", "font-sans text-[11px] font-bold truncate")}>
            {value}
          </span>
        </div>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-300 shrink-0', light ? 'text-white/60' : 'text-outline/50', open && 'rotate-180')}
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

const SkeletonCard: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-sm border border-outline/25 bg-white shadow-sm flex flex-col h-[380px] animate-pulse">
      <div className="aspect-[16/10] bg-outline/10 w-full animate-shimmer" />
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 bg-outline/10 rounded w-2/3" />
          <div className="h-3 bg-outline/10 rounded w-1/3" />
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-outline/10 rounded w-full" />
            <div className="h-3 bg-outline/10 rounded w-5/6" />
          </div>
        </div>
        <div className="h-4 bg-outline/15 rounded w-1/4 mt-4" />
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userEmail, role } = useAuth();
  const { 
    properties, 
    loading, 
    addProperty, 
    updateProperty, 
    deleteProperty, 
    submitPropertyRequest,
    requests,
    rejectPropertyRequest,
    updatePropertyRequestProposedData,
    archivePropertyRequest,
    unarchivePropertyRequest,
    unsyncedRequestsCount,
    unsyncedPropertiesCount,
    syncUnsyncedRequests,
    syncUnsyncedProperties,
    lastSyncError
  } = useProperties();

  const [syncingRequests, setSyncingRequests] = useState(false);
  const [syncingProperties, setSyncingProperties] = useState(false);

  const handleRetrySyncRequests = async () => {
    setSyncingRequests(true);
    try {
      await syncUnsyncedRequests();
      alert('Unsynced requests synchronization complete.');
    } finally {
      setSyncingRequests(false);
    }
  };

  const handleRetrySyncProperties = async () => {
    setSyncingProperties(true);
    try {
      await syncUnsyncedProperties();
      alert('Unsynced properties synchronization complete.');
    } finally {
      setSyncingProperties(false);
    }
  };

  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const isAllowedToEdit = (property: Property) => {
    if (!isAuthenticated || !userEmail) return false;
    if (role === 'director') return true;
    if ((property as any).isPendingCreation) return true;
    return property.createdBy === userEmail;
  };

  const [listingType, setListingType] = useState<string>('All Properties');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Active' | 'Sold' | 'Archived'>('Active');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset page when filters or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [listingType, selectedCity, searchQuery, activeTab]);



  const agentPendingCreations = useMemo(() => {
    if (!isAuthenticated || !userEmail) return [];
    
    // Filter requests of type 'CREATE' that belong to the current agent
    return requests
      .filter(r => r.type === 'CREATE' && r.requestedBy === userEmail)
      .map(r => ({
        ...r.proposedData,
        id: r.propertyId,
        isPendingCreation: true,
        images: r.proposedData?.images || []
      } as unknown as Property));
  }, [requests, isAuthenticated, userEmail]);

  const mergedProperties = useMemo(() => {
    return [...agentPendingCreations, ...properties];
  }, [properties, agentPendingCreations]);

  const filteredProperties = useMemo(() => {
    return mergedProperties.filter(p => {
      if (!isAuthenticated) {
        if (p.status === 'Archived' || p.status === 'Sold') return false;
      } else {
        if (activeTab === 'Active') {
          if (p.status === 'Sold' || p.status === 'Archived') return false;
        } else if (activeTab === 'Sold') {
          if (p.status !== 'Sold') return false;
        } else if (activeTab === 'Archived') {
          if (p.status !== 'Archived') return false;
        }
      }
      const matchesType = listingType === 'All Properties' || p.type === listingType;
      const matchesCity = selectedCity === 'All Cities' || normalizeLocation(p.city) === selectedCity;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCity && matchesSearch;
    });
  }, [mergedProperties, listingType, selectedCity, searchQuery, isAuthenticated, activeTab]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cities = ['All Cities', ...Array.from(new Set(mergedProperties.map(p => normalizeLocation(p.city)))).filter(Boolean).sort()];
  const types = ['All Properties', 'For Sale', 'For Rent'];

  return (
    <div className="mx-auto max-w-container-max px-gutter py-10 md:py-20">
      {/* Synchronization Diagnostics Banner */}
      {(unsyncedRequestsCount > 0 || unsyncedPropertiesCount > 0) && (
        <div className="mb-8 p-5 rounded-lg border border-amber-300 bg-amber-50/90 text-amber-950 text-xs font-sans shadow-md space-y-3 animate-pulse relative z-50">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Database Synchronization Delay / 数据库未同步警告</h4>
              <p className="leading-relaxed">
                You have locally saved items that could not be uploaded to Supabase. This happens when there is a connection issue, or if Row Level Security (RLS) is blocking the writes.
              </p>
              {lastSyncError && (
                <div className="bg-black/5 p-2 rounded font-mono text-[10px] break-all border border-black/5 text-red-800">
                  Last Database Error: {lastSyncError}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4 pt-1 flex-wrap">
            {unsyncedRequestsCount > 0 && (
              <button
                disabled={syncingRequests}
                onClick={handleRetrySyncRequests}
                className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors rounded-sm active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                {syncingRequests ? 'Syncing...' : `Retry Syncing ${unsyncedRequestsCount} Pending Request(s)`}
              </button>
            )}
            {unsyncedPropertiesCount > 0 && (
              <button
                disabled={syncingProperties}
                onClick={handleRetrySyncProperties}
                className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors rounded-sm active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                {syncingProperties ? 'Syncing...' : `Retry Syncing ${unsyncedPropertiesCount} Direct Property Listing(s)`}
              </button>
            )}
          </div>
        </div>
      )}




      {/* Admin Status Tabs */}
      {isAuthenticated && (
        <div className="flex border-b border-outline/20 mb-8 overflow-x-auto gap-8 scrollbar-none">
          {(['Active', 'Sold', 'Archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 font-mono text-[10px] font-bold uppercase tracking-widest border-b-2 outline-none transition-all cursor-pointer whitespace-nowrap",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-outline/65 hover:text-primary hover:border-outline/40"
              )}
            >
              {tab} Listings ({
                tab === 'Active'
                  ? mergedProperties.filter(p => p.status !== 'Sold' && p.status !== 'Archived').length
                  : mergedProperties.filter(p => p.status === tab).length
              })
            </button>
          ))}
        </div>
      )}

      {/* Filter Engine */}
      <section className="mb-10 md:mb-16">
        <div className="border border-outline/35 bg-white/90 backdrop-blur-md rounded-lg shadow-lg shadow-primary/5 transition-all duration-300 relative z-30">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center">
            {/* Search (Always visible, spans 1 grid column on desktop) */}
            <div className="relative border-b md:border-b-0 md:border-r border-outline/10 px-6 py-[16px] md:col-span-1 group hover:bg-primary/[0.02] transition-colors duration-300 flex items-center gap-3 rounded-l-lg">
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

            {/* Filters Container (City, Type, Reset) - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 md:col-span-3 items-center bg-gradient-to-r from-primary to-primary-light text-white rounded-r-lg">
              {/* City */}
              <FilterDropdown
                label="City"
                value={selectedCity}
                options={cities}
                onChange={setSelectedCity}
                icon={<MapPin className="h-4 w-4 text-white/80 group-hover:text-white transition-colors" />}
                className="border-b md:border-b-0 md:border-r border-white/10"
                light={true}
              />

              {/* Type */}
              <FilterDropdown
                label="Type"
                value={listingType}
                options={types}
                onChange={setListingType}
                icon={<Home className="h-4 w-4 text-white/80 group-hover:text-white transition-colors" />}
                className="border-b md:border-b-0 md:border-r border-white/10"
                light={true}
              />

              {/* Reset / Status Button */}
              <div className="px-6 py-4 md:py-0">
                {searchQuery !== '' || selectedCity !== 'All Cities' || listingType !== 'All Properties' ? (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCity('All Cities'); setListingType('All Properties'); }}
                    className="group relative w-full overflow-hidden bg-white text-primary py-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:shadow-white/10 btn-press active:scale-95 cursor-pointer rounded-sm border-0 outline-none flex items-center justify-center gap-1.5"
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Filters
                    </span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full border border-white/20 bg-white/5 text-white/50 py-3.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] cursor-not-allowed rounded-sm flex items-center justify-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
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
        {loading && paginatedProperties.length === 0 ? (
          Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
        ) : (
          paginatedProperties.map(prop => {
            const isPending = (prop as any).isPendingCreation;
            const matchingReq = isPending ? requests.find(r => r.propertyId === prop.id && r.type === 'CREATE') : undefined;
            return (
              <PropertyCard
                key={prop.id}
                property={prop}
                onClick={isPending ? undefined : () => navigate(`/property/${prop.id}`)}
                onEdit={isAllowedToEdit(prop) ? p => { setEditingProperty(prop); setIsFormOpen(true); } : undefined}
                onDelete={isAllowedToEdit(prop) ? (isPending ? (matchingReq?.status === 'ARCHIVED' ? () => setPropertyToDelete(prop) : undefined) : () => setPropertyToDelete(prop)) : undefined}
                onArchive={isAllowedToEdit(prop) ? (isPending ? async () => {
                  if (matchingReq) {
                    if (matchingReq.status === 'ARCHIVED') {
                      await unarchivePropertyRequest(prop.id);
                      alert('Pending creation restored and submitted to Director for approval.');
                    } else {
                      await archivePropertyRequest(prop.id);
                      alert('Pending creation archived on your dashboard. Removed from Director approvals queue.');
                    }
                  }
                } : async () => {
                  if (role === 'director') {
                    updateProperty({ ...prop, status: prop.status === 'Archived' ? 'Active' : 'Archived' });
                  } else {
                    const success = await submitPropertyRequest({
                      type: 'ARCHIVE',
                      propertyId: prop.id,
                      propertyName: prop.title,
                      requestedBy: userEmail || 'unknown-agent'
                    });
                    if (success) {
                      alert('Request Submitted: Your request to archive this listing has been submitted to the Director.');
                    }
                  }
                }) : undefined}
              />
            );
          })
        )}
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
        onSave={async data => {
          if (editingProperty) {
            const isPending = (editingProperty as any).isPendingCreation;
            if (isPending) {
              const success = await updatePropertyRequestProposedData(editingProperty.id, data);
              if (success) {
                alert('Request Updated: Your pending property creation details have been updated.');
              }
            } else if (role === 'director') {
              await updateProperty({ ...editingProperty, ...data });
            } else {
              const success = await submitPropertyRequest({
                type: 'EDIT',
                propertyId: editingProperty.id,
                propertyName: editingProperty.title,
                requestedBy: userEmail || 'unknown-agent',
                proposedData: data
              });
              if (success) {
                alert('Request Submitted: Your edits have been submitted to the Director for approval.');
              }
            }
          } else {
            if (role === 'director') {
              await addProperty(data);
            } else {
              const propertyId = `PK-${Math.floor(Math.random() * 9000) + 1000}`;
              const success = await submitPropertyRequest({
                type: 'CREATE',
                propertyId: propertyId,
                propertyName: data.title,
                requestedBy: userEmail || 'unknown-agent',
                proposedData: {
                  ...data,
                  status: data.status || 'Active',
                  createdBy: userEmail || 'unknown-agent'
                }
              });
              if (success) {
                alert('Request Submitted: Your new property posting has been submitted to the Director for approval.');
              }
            }
          }
        }}
        initialData={editingProperty}
      />

      <DeleteConfirmationModal
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        propertyName={propertyToDelete?.title}
        onConfirm={async () => {
          if (propertyToDelete) {
            const isPending = (propertyToDelete as any).isPendingCreation;
            if (isPending) {
              const req = requests.find(r => r.propertyId === propertyToDelete.id && r.type === 'CREATE');
              if (req) {
                await rejectPropertyRequest(req.id);
                alert('Pending creation deleted successfully.');
              }
            } else if (role === 'director') {
              deleteProperty(propertyToDelete.id);
            } else {
              const success = await submitPropertyRequest({
                type: 'DELETE',
                propertyId: propertyToDelete.id,
                propertyName: propertyToDelete.title,
                requestedBy: userEmail || 'unknown-agent'
              });
              if (success) {
                alert('Request Submitted: Your request to delete this listing has been submitted to the Director.');
              }
            }
          }
        }}
      />
    </div>
  );
};
