import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  Search, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  MapPin, 
  Calendar, 
  Trash2, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  X,
  MessageSquare,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  property_title: string | null;
  property_price: string | null;
  property_address: string | null;
  tour_date: string | null;
  tour_mode: string | null;
  tour_time: string | null;
  assigned_agent: string | null;
  agent_contact: string | null;
  form_type: string;
  status: 'New' | 'Viewing Scheduled' | 'Closed' | 'Spam';
  created_at: string;
}

export const LeadsPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Viewing Scheduled' | 'Closed' | 'Spam'>('All');
  const [propertyFilter, setPropertyFilter] = useState('All Properties');
  
  // Selection/Detail state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  
  // Delete modal state
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Agent Assignment Edit state
  const [editingAgent, setEditingAgent] = useState(false);
  const [assignedAgentInput, setAssignedAgentInput] = useState('');
  const [agentContactInput, setAgentContactInput] = useState('');

  // Fetch inquiries from Supabase
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setInquiries(data as Inquiry[]);
        
        // Auto-select first item if list is not empty and nothing is selected
        if (data.length > 0 && !selectedInquiryId) {
          setSelectedInquiryId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
    }
  }, [isAuthenticated]);

  // Unique property names list for filtering
  const propertyNames = useMemo(() => {
    const names = new Set<string>();
    inquiries.forEach(inq => {
      if (inq.property_title) {
        names.add(inq.property_title);
      }
    });
    return ['All Properties', ...Array.from(names)];
  }, [inquiries]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchesSearch = 
        inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inq.phone && inq.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inq.message && inq.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
      
      const matchesProperty = 
        propertyFilter === 'All Properties' || inq.property_title === propertyFilter;

      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [inquiries, searchQuery, statusFilter, propertyFilter]);

  const selectedInquiry = useMemo(() => {
    return inquiries.find(inq => inq.id === selectedInquiryId) || null;
  }, [inquiries, selectedInquiryId]);

  useEffect(() => {
    if (selectedInquiry) {
      setAssignedAgentInput(selectedInquiry.assigned_agent || '');
      setAgentContactInput(selectedInquiry.agent_contact || '');
    } else {
      setAssignedAgentInput('');
      setAgentContactInput('');
    }
    setEditingAgent(false);
  }, [selectedInquiryId, selectedInquiry]);

  // Update status in Supabase
  const handleUpdateStatus = async (id: string, newStatus: 'New' | 'Viewing Scheduled' | 'Closed' | 'Spam') => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    } catch (err: any) {
      console.error('Failed to update inquiry status:', err);
      alert(`Failed to update status: ${err.message || 'Unknown error'}`);
    }
  };

  // Delete inquiry
  const handleDeleteConfirm = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', inquiryToDelete.id);

      if (error) throw error;
      
      // Clear selection if deleted
      if (selectedInquiryId === inquiryToDelete.id) {
        setSelectedInquiryId(null);
      }
      
      // Update state
      setInquiries(prev => prev.filter(inq => inq.id !== inquiryToDelete.id));
      alert('Inquiry deleted successfully.');
    } catch (err: any) {
      console.error('Failed to delete inquiry:', err);
      alert(`Delete failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setInquiryToDelete(null);
    }
  };

  const handleSaveAssignedAgent = async () => {
    if (!selectedInquiry) return;
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          assigned_agent: assignedAgentInput.trim() || null,
          agent_contact: agentContactInput.trim() || null
        })
        .eq('id', selectedInquiry.id);

      if (error) throw error;

      // Update local state
      setInquiries(prev => prev.map(inq => 
        inq.id === selectedInquiry.id 
          ? { 
              ...inq, 
              assigned_agent: assignedAgentInput.trim() || null, 
              agent_contact: agentContactInput.trim() || null 
            } 
          : inq
      ));
      
      setEditingAgent(false);
      alert('Representative agent assigned successfully.');
    } catch (err: any) {
      console.error('Failed to update assigned agent:', err);
      alert(`Save failed: ${err.message || 'Unknown error'}`);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-container-max mx-auto space-y-8 animate-page-enter">
      {/* Header & Stats summary */}
      <div className="bg-white border border-outline/25 rounded-2xl p-6 shadow-sm relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-jade-deep/5 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full select-none font-display">
              Lead Intelligence System
            </span>
            <h1 className="font-serif italic text-3xl text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              Inquiry Management Dashboard
            </h1>
            <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
              Monitor, filter, and track direct website forms and scheduled tour bookings. Deletion of spam is audited and secured by role permissions.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-jade-deep/5 border border-jade-deep/10 px-4 py-2.5 rounded-xl text-center">
              <span className="block font-mono text-[8px] uppercase tracking-wider text-on-surface-variant/70 leading-none">Total</span>
              <span className="font-sans text-lg font-bold text-primary">{inquiries.length}</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl text-center">
              <span className="block font-mono text-[8px] uppercase tracking-wider text-blue-700/70 leading-none">New</span>
              <span className="font-sans text-lg font-bold text-blue-700">{inquiries.filter(i => i.status === 'New').length}</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-xl text-center">
              <span className="block font-mono text-[8px] uppercase tracking-wider text-amber-700/70 leading-none">Viewing</span>
              <span className="font-sans text-lg font-bold text-amber-700">{inquiries.filter(i => i.status === 'Viewing Scheduled').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters strip */}
      <div className="bg-white border border-outline/25 p-5 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
          <input
            type="text"
            className="w-full bg-surface-muted border border-outline/30 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
            placeholder="Search leads name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Property Filter */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <span className="text-[9px] font-mono text-outline uppercase tracking-wider">Property Filter</span>
          <select
            className="bg-surface-muted border border-outline/30 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary transition-all font-mono"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
          >
            {propertyNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Status Filters Tab group */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono text-outline uppercase tracking-wider">Status Filter</span>
          <div className="flex border border-outline/30 bg-surface-muted p-1 rounded-xl gap-0.5">
            {(['All', 'New', 'Viewing Scheduled', 'Closed', 'Spam'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all border-0 outline-none cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {tab === 'Viewing Scheduled' ? 'Viewing' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: List + Detail */}
      <div className="flex flex-col lg:flex-row gap-6 items-start relative">
        {/* Table List container */}
        <div className="flex-1 bg-white border border-outline/25 rounded-2xl shadow-sm overflow-hidden w-full">
          {loading ? (
            <div className="p-16 text-center text-xs font-mono text-outline-variant uppercase animate-pulse">
              Loading inquiries from database...
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center select-none">
              <MessageSquare className="w-10 h-10 text-primary-light/40 mb-3" />
              <p className="font-display text-sm font-bold text-primary">No Inquiries Found</p>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Try adjusting your search query or status filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted/50 border-b border-outline/10 text-on-surface-variant font-mono text-[9px] uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Inquirer</th>
                    <th className="px-6 py-4">Inquiry / Property</th>
                    <th className="px-6 py-4">Date Submitted</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {filteredInquiries.map(inq => {
                    const isSelected = selectedInquiryId === inq.id;
                    const isNew = inq.status === 'New';
                    const isViewing = inq.status === 'Viewing Scheduled';
                    const isClosed = inq.status === 'Closed';
                    const isSpam = inq.status === 'Spam';

                    return (
                      <tr
                        key={inq.id}
                        onClick={() => setSelectedInquiryId(inq.id)}
                        className={`hover:bg-primary/5 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-sans text-xs font-bold text-primary group-hover:text-primary-light transition-colors">
                              {inq.name}
                            </span>
                            <span className="font-mono text-[10px] text-on-surface-variant/70">
                              {inq.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-sans text-xs text-on-surface font-medium truncate max-w-[200px]">
                              {inq.property_title || 'General Inquiry'}
                            </span>
                            <span className="font-mono text-[9px] text-on-surface-variant/50">
                              {inq.form_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10.5px] text-on-surface-variant/80">
                          {formatDate(inq.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[8px] font-extrabold uppercase border ${
                            isNew 
                              ? 'bg-blue-500/10 text-blue-700 border-blue-500/15'
                              : isViewing
                                ? 'bg-amber-500/10 text-amber-700 border-amber-500/15'
                                : isClosed
                                  ? 'bg-green-500/10 text-green-700 border-green-500/15'
                                  : 'bg-red-500/10 text-red-700 border-red-500/15'
                          }`}>
                            {inq.status === 'Viewing Scheduled' ? 'Viewing' : inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="w-4 h-4 text-outline opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Drawer (Slide-out panel) */}
        {selectedInquiry && (
          <aside className="w-full lg:w-[380px] bg-white border border-outline/25 rounded-2xl shadow-sm overflow-hidden sticky top-20 flex flex-col shrink-0">
            {/* Drawer Header */}
            <div className="p-5 border-b border-outline/10 bg-jade-deep text-white flex justify-between items-center">
              <div>
                <span className="font-mono text-[8px] font-bold tracking-widest text-primary-neon uppercase">Inquiry Info</span>
                <h3 className="font-serif text-base font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Detailed View
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-white/50">ID: {selectedInquiry.id}</span>
                <button
                  onClick={() => setSelectedInquiryId(null)}
                  className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6">
              {/* Client Info Block */}
              <div className="flex items-center gap-3 pb-4 border-b border-outline/10">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm font-display select-none">
                  {selectedInquiry.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-primary">{selectedInquiry.name}</h4>
                  <span className="inline-flex px-1.5 py-0.5 bg-primary/10 text-primary font-mono text-[8px] rounded uppercase font-extrabold select-none">
                    {selectedInquiry.form_type}
                  </span>
                </div>
              </div>

              {/* Client Contacts */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[8px] font-mono text-outline uppercase tracking-wider mb-1">Email Address</label>
                  <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 font-mono text-[11px] text-primary hover:underline font-bold break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedInquiry.email}</span>
                  </a>
                </div>

                {selectedInquiry.phone && (
                  <div>
                    <label className="block text-[8px] font-mono text-outline uppercase tracking-wider mb-1">Phone Number</label>
                    <a href={`tel:${selectedInquiry.phone}`} className="flex items-center gap-2 font-mono text-[11px] text-primary hover:underline font-bold">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedInquiry.phone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Property Details */}
              {selectedInquiry.property_title && (
                <div className="border border-outline/20 rounded-xl bg-background-warm/30 p-4 space-y-2.5">
                  <span className="block font-mono text-[8px] font-extrabold text-primary-light uppercase tracking-widest border-b border-outline/10 pb-1.5">
                    Property Interested In
                  </span>
                  <div className="space-y-1 text-xs">
                    <p className="font-sans font-bold text-primary">{selectedInquiry.property_title}</p>
                    <p className="font-mono text-[10.5px] font-bold text-primary-light">{selectedInquiry.property_price}</p>
                    <p className="font-sans text-[10.5px] text-on-surface-variant/80">{selectedInquiry.property_address}</p>
                  </div>
                </div>
              )}

              {/* Tour Booking Details */}
              {selectedInquiry.form_type === 'Tour Booking' && (
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-3 text-xs">
                  <span className="block font-mono text-[8.5px] font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-1.5">
                    Tour Schedule
                  </span>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-sans font-bold">{selectedInquiry.tour_date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-sans font-bold">{selectedInquiry.tour_time} ({selectedInquiry.tour_mode})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedInquiry.message && selectedInquiry.message !== '(Tour Booking Inquiry)' && (
                <div className="space-y-1">
                  <label className="block text-[8px] font-mono text-outline uppercase tracking-wider mb-1">Message Content</label>
                  <p className="bg-surface-muted border border-outline/15 p-3.5 rounded-xl text-[11px] font-sans text-on-surface/90 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedInquiry.message}
                  </p>
                </div>
              )}

              {/* Representative Agent Assignment Section */}
              <div className="border-t border-outline/10 pt-4 space-y-3">
                <div className="flex justify-between items-center select-none">
                  <label className="block text-[8px] font-mono text-outline uppercase tracking-wider">Assigned Representative</label>
                  <button
                    onClick={() => setEditingAgent(!editingAgent)}
                    className="text-[9px] font-mono text-primary hover:text-primary-light font-bold uppercase hover:underline cursor-pointer"
                  >
                    {editingAgent ? 'Cancel' : 'Assign / Edit'}
                  </button>
                </div>

                {editingAgent ? (
                  <div className="space-y-2.5 bg-surface-muted/50 p-3 rounded-xl border border-outline/15">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-on-surface-variant/70 uppercase">Agent Name</span>
                      <input
                        type="text"
                        placeholder="e.g. Claire Jane"
                        value={assignedAgentInput}
                        onChange={(e) => setAssignedAgentInput(e.target.value)}
                        className="w-full bg-white border border-outline/30 rounded-lg px-3 py-1.5 text-xs font-sans outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-on-surface-variant/70 uppercase">Agent Contact Number</span>
                      <input
                        type="text"
                        placeholder="e.g. +63 912 345 6789"
                        value={agentContactInput}
                        onChange={(e) => setAgentContactInput(e.target.value)}
                        className="w-full bg-white border border-outline/30 rounded-lg px-3 py-1.5 text-xs font-sans outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      onClick={handleSaveAssignedAgent}
                      className="w-full bg-primary text-white text-[9.5px] font-mono font-bold uppercase tracking-widest py-2 rounded-lg hover:bg-primary-light transition-all cursor-pointer shadow-sm"
                    >
                      Save Assignment
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 bg-surface-muted/30 border border-outline/15 p-3.5 rounded-xl">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-bold text-primary">
                        {selectedInquiry.assigned_agent || 'Unassigned'}
                      </p>
                      <p className="font-mono text-[10px] text-on-surface-variant/80 mt-0.5">
                        {selectedInquiry.agent_contact || 'No contact number specified'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Status Updates */}
              <div className="border-t border-outline/10 pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-[8px] font-mono text-outline uppercase tracking-wider">Update status</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['New', 'Viewing Scheduled', 'Closed', 'Spam'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedInquiry.id, status)}
                        className={`py-2 px-2.5 font-mono text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all text-center border cursor-pointer ${
                          selectedInquiry.status === status
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white hover:bg-primary/5 text-on-surface-variant border-outline/30'
                        }`}
                      >
                        {status === 'Viewing Scheduled' ? 'Viewing' : status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Director-only Spam Deletion */}
                {role === 'director' && (
                  <button
                    onClick={() => setInquiryToDelete(selectedInquiry)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl font-mono text-[9.5px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Message
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Spam Deletion Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!inquiryToDelete}
        onClose={() => setInquiryToDelete(null)}
        propertyName={inquiryToDelete?.name ? `Inquiry from ${inquiryToDelete.name}` : undefined}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
