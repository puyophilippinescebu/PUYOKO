import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Bath, Square, ChevronRight, Hammer, Flame, LayoutGrid, Heart, Edit2, Trash2, Archive, ArchiveRestore, Plus } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import { PropertyFormModal } from '../components/PropertyFormModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { Property } from '../types';
import { cn } from '../lib/utils';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { properties, loading, addProperty, updateProperty, deleteProperty } = useProperties();
  const [activeTab, setActiveTab] = useState<'All' | 'Under Construction' | 'Preselling'>('All');

  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Filter properties to only show projects ("Under Construction" or "Preselling")
  const projectList = useMemo(() => {
    return properties.filter(p => p.status === 'Under Construction' || p.status === 'Preselling');
  }, [properties]);

  const filteredProjects = useMemo(() => {
    if (activeTab === 'All') return projectList;
    return projectList.filter(p => p.status === activeTab);
  }, [projectList, activeTab]);

  // Helper to generate consistent progress percentage based on Property ID
  const getProgressVal = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (sum % 40) + 50; // Returns between 50% and 90%
  };

  // Helper to get construction update text based on progress
  const getProgressUpdateText = (progress: number) => {
    if (progress < 65) return "Foundation complete. Structural framing ongoing.";
    if (progress < 80) return "Exterior walls & roofing complete. Plastering ongoing.";
    return "Interior finishing, tiling & plumbing installations ongoing.";
  };

  // Helper to generate realistic payment terms based on ID
  const getPaymentTerms = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const options = [
      "₱15,000/month • No Downpayment • 0% Interest (36 mos)",
      "10% Downpayment • 90% Bank Financing • 5% Launch Discount",
      "₱20,000 reservation fee • Flexi-pay scheme available",
      "No Spot Downpayment • 0% Interest Spread over 24 Months"
    ];
    return options[sum % options.length];
  };

  return (
    <div className="mx-auto max-w-container-max px-gutter py-16">
      {/* Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <span className="text-primary-light text-xs font-mono tracking-[0.4em] uppercase block mb-3">Portfolio / 項目</span>
        <h1 className="font-display text-4xl sm:text-5xl font-light text-primary mb-4 leading-tight">
          Estates & <span className="italic-serif text-primary-light">Projects</span>
        </h1>
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
          Explore our premier real estate developments in Cebu. Filter between pre-selling investment opportunities and ongoing construction projects.
        </p>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="mb-12 flex justify-center">
        <div className="border border-outline/30 bg-white/80 backdrop-blur-sm p-1 rounded-sm flex gap-1 shadow-sm">
          {[
            { label: 'All Projects', value: 'All', icon: LayoutGrid },
            { label: 'Under Construction', value: 'Under Construction', icon: Hammer },
            { label: 'Preselling', value: 'Preselling', icon: Flame }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer border-0 outline-none",
                  isActive
                    ? "bg-primary text-white shadow-md scale-[1.02]"
                    : "text-on-surface-variant/70 hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header & Add Button */}
      <div className="mb-10 flex items-center justify-between border-b border-outline/10 pb-6">
        <h3 className="font-display text-2xl font-bold text-primary">
          {loading ? 'Loading...' : `${filteredProjects.length} Projects Active`}
        </h3>
        {isAuthenticated && (
          <button
            onClick={() => { setEditingProperty(undefined); setIsFormOpen(true); }}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-primary-light transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="font-mono text-xs uppercase tracking-widest text-primary animate-pulse">Loading Projects...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 text-center p-8 bg-white/50">
          <p className="mb-2 font-display text-lg font-bold text-on-surface-variant">No projects found in this category</p>
          <p className="font-sans text-xs text-on-surface-variant/70 max-w-sm mb-4">
            New pre-selling estates and developments are curated regularly. Add properties with status "Preselling" or "Under Construction" in the Admin Panel to feature them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map(project => {
            const progress = getProgressVal(project.id);
            const updateText = getProgressUpdateText(progress);
            const paymentTerms = getPaymentTerms(project.id);
            
            const formattedPrice = new Intl.NumberFormat(
              project.currency === 'USD' ? 'en-US' :
              project.currency === 'EUR' ? 'de-DE' :
              project.currency === 'JPY' ? 'ja-JP' : 'en-PH',
              {
                style: 'currency',
                currency: project.currency || 'PHP',
                maximumFractionDigits: 0,
              }
            ).format(project.price);

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/property/${project.id}`)}
                className={cn(
                  "group cursor-pointer overflow-hidden rounded-sm border border-outline/30 bg-white shadow-sm",
                  "transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1)",
                  "hover:-translate-y-3.5 hover:shadow-2xl hover:border-primary/25" // "antigravity" float/lift on hover!
                )}
              >
                {/* Image & Badge */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Status Badge */}
                  <div className={cn(
                    "absolute left-6 top-6 backdrop-blur-md px-3 py-1.5 font-display text-[9px] font-extrabold uppercase tracking-[0.25em] border shadow-sm text-white",
                    project.status === 'Preselling' ? "bg-amber-600/90 border-amber-500/20" : "bg-teal-700/90 border-teal-600/20"
                  )}>
                    {project.status}
                  </div>

                  {/* Admin Controls Overlay */}
                  {isAuthenticated && (
                    <div className="absolute right-4 top-4 flex gap-2 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateProperty({ ...project, status: project.status === 'Archived' ? 'Active' : 'Archived' }); }}
                        title={project.status === 'Archived' ? 'Unarchive' : 'Archive'}
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors shadow-lg active:scale-95 cursor-pointer"
                      >
                        {project.status === 'Archived' ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingProperty(project); setIsFormOpen(true); }}
                        title="Edit Project"
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-lg active:scale-95 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPropertyToDelete(project); }}
                        title="Delete Project"
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6">
                  {/* Title & ID */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary leading-tight tracking-wide mb-1">
                        {project.title}
                      </h3>
                      <p className="font-display text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">ID: {project.id} / {project.city}</p>
                    </div>
                    <button className="text-outline transition-colors hover:text-primary">
                      <Heart className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="mb-4 font-display text-xl font-extrabold text-primary tracking-tight">
                    {formattedPrice} {project.status === 'Preselling' && <span className="font-sans text-[10px] font-bold text-amber-600 uppercase tracking-widest ml-2 bg-amber-50 px-2 py-0.5 rounded">Intro Price</span>}
                  </div>

                  {/* Dynamic Status Content */}
                  {project.status === 'Under Construction' ? (
                    <div className="mb-5 bg-teal-50/50 rounded p-4 border border-teal-600/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-teal-800">Construction Progress</span>
                        <span className="font-mono text-[10px] font-bold text-teal-700">{progress}%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-teal-800/10 h-2 rounded-full overflow-hidden mb-2.5">
                        <div className="bg-teal-700 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="font-sans text-[10px] text-on-surface-variant/80 leading-relaxed italic">{updateText}</p>
                    </div>
                  ) : (
                    <div className="mb-5 bg-amber-50/50 rounded p-4 border border-amber-600/10">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-amber-800">Introductory Payment Terms</span>
                      </div>
                      <p className="font-sans text-xs font-bold text-on-surface leading-tight mb-1">{paymentTerms}</p>
                      <p className="font-sans text-[9px] text-on-surface-variant/70 leading-relaxed uppercase tracking-wider">Hassle-Free Pre-Selling investment</p>
                    </div>
                  )}

                  {/* Footer Stats (Conditional render if greater than 0) */}
                  <div className="flex items-center gap-4 border-t border-outline/10 pt-4 font-sans text-xs font-bold tracking-wide text-on-surface-variant/80">
                    {project.bedrooms > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-primary/60" />
                        <span>{project.bedrooms} Bed</span>
                      </div>
                    )}
                    {project.bathrooms > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4 text-primary/60" />
                        <span>{project.bathrooms} Bath</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 flex-1">
                      <Square className="h-3.5 w-3.5 text-primary/60" />
                      <span>{project.area} m²</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-widest text-primary-light/90">
                      Heritage
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
