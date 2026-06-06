import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';
import { Check, X, ShieldAlert, Clock, User, ClipboardList, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { Property } from '../types';

interface DiffItem {
  field: string;
  oldValue: any;
  newValue: any;
}

export const PendingApprovalsPage: React.FC = () => {
  const { isAuthenticated, userEmail } = useAuth();
  const { properties, requests, approvePropertyRequest, rejectPropertyRequest } = useProperties();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Secure Guard: Direct redirect to properties if not director
  if (!isAuthenticated || userEmail !== 'puyophilippinescebu@gmail.com') {
    return <Navigate to="/admin/properties" replace />;
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approvePropertyRequest(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectPropertyRequest(id);
    } finally {
      setProcessingId(null);
    }
  };

  const getPropertyDiff = (propertyId: string, proposed: any): DiffItem[] => {
    const current = properties.find(p => p.id === propertyId);
    if (!current) return [];

    const diffs: DiffItem[] = [];
    const keysToCompare = [
      'title', 'price', 'currency', 'status', 'city', 'address', 
      'landmarks', 'mapsLink', 'bedrooms', 'bathrooms', 'area', 
      'description', 'type', 'videoUrl', 'pricePeriod', 'originalPrice',
      'accommodatedBy'
    ];

    keysToCompare.forEach(key => {
      const oldVal = (current as any)[key];
      const newVal = proposed[key];

      // Normalize values for comparison
      const normalizedOld = oldVal === undefined || oldVal === null ? '' : String(oldVal).trim();
      const normalizedNew = newVal === undefined || newVal === null ? '' : String(newVal).trim();

      if (normalizedOld !== normalizedNew) {
        let fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        
        // Custom formatting for specific fields
        if (key === 'accommodatedBy') fieldName = 'Accommodating Agent';
        if (key === 'pricePeriod') fieldName = 'Price Period';
        if (key === 'originalPrice') fieldName = 'Original Price';
        if (key === 'mapsLink') fieldName = 'Google Maps Link';
        if (key === 'videoUrl') fieldName = 'Video URL';

        diffs.push({
          field: fieldName,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    });

    return diffs;
  };

  const formatRequestDate = (isoString: string) => {
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-page-enter">
      {/* Header section */}
      <div className="bg-white border border-outline/25 rounded-2xl p-6 shadow-sm relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-jade-deep/5 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full select-none font-display">
              Director Administration Control
            </span>
            <h1 className="font-serif italic text-3xl text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              Pending Approvals Queue
            </h1>
            <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
              Review, compare, and authorize or reject modifications requested by agents. Approved modifications will sync and update publicly immediately.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-jade-deep/5 border border-jade-deep/10 px-4 py-3 rounded-xl shrink-0">
            <ClipboardList className="w-5 h-5 text-primary-light" />
            <div>
              <span className="block font-mono text-[8px] uppercase tracking-wider text-on-surface-variant/70 leading-none">Queue Size</span>
              <span className="font-sans text-xs font-bold text-primary">{requests.length} Pending Actions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Queue */}
      {requests.length === 0 ? (
        <div className="flex flex-col h-64 items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 text-center p-8 bg-white/50 select-none">
          <CheckCircle2 className="w-10 h-10 text-primary-light mb-3 animate-pulse" />
          <p className="font-display text-base font-bold text-primary">All Clear! No Pending Requests</p>
          <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
            There are currently no listings awaiting changes. Agent properties will show up here if edits or deletions occur.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(req => {
            const isEdit = req.type === 'EDIT';
            const isDelete = req.type === 'DELETE';
            const isArchive = req.type === 'ARCHIVE';
            const isCurrentProcessing = processingId === req.id;
            const diffs = isEdit && req.proposedData ? getPropertyDiff(req.propertyId, req.proposedData) : [];

            return (
              <div 
                key={req.id} 
                className="bg-white border border-outline/25 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-6"
              >
                {/* Request Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-outline/10 select-none">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        isDelete 
                          ? 'bg-red-500/10 text-red-700 border-red-500/15' 
                          : isArchive 
                            ? 'bg-amber-500/10 text-amber-700 border-amber-500/15'
                            : 'bg-blue-500/10 text-blue-700 border-blue-500/15'
                      }`}>
                        {req.type} Request
                      </span>
                      <span className="font-mono text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-wider">ID: {req.id}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {req.propertyName} <span className="font-mono text-[10px] font-normal text-outline">({req.propertyId})</span>
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-right font-mono text-[9px] tracking-wider text-on-surface-variant/60">
                    <div className="flex items-center gap-1.5 justify-end">
                      <User className="w-3.5 h-3.5 text-primary/40" />
                      <span>{req.requestedBy}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-primary/40" />
                      <span>{formatRequestDate(req.requestedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Request Body / Diff */}
                {isEdit && (
                  <div className="space-y-4">
                    {diffs.length === 0 ? (
                      <div className="text-xs text-on-surface-variant/50 font-sans italic bg-background-warm/30 rounded-xl p-4 border border-outline/10 text-center">
                        No property field changes detected (agent probably re-saved without updates).
                      </div>
                    ) : (
                      <div className="border border-outline/20 rounded-xl bg-background-warm/30 p-5 space-y-4">
                        <span className="block font-mono text-[8px] font-extrabold text-primary-light uppercase tracking-widest border-b border-outline/10 pb-2">
                          Proposed Changes Comparison / 变更对比
                        </span>
                        <div className="divide-y divide-outline/10 text-xs">
                          {diffs.map((diff, index) => (
                            <div key={index} className="py-3.5 grid grid-cols-1 sm:grid-cols-4 gap-2 items-start">
                              <span className="font-sans font-bold text-on-surface-variant/80 sm:col-span-1">{diff.field}</span>
                              <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-red-700 line-through bg-red-50 px-2 py-0.5 rounded border border-red-100 break-all font-mono text-[10.5px]">
                                  {diff.oldValue !== undefined && diff.oldValue !== null ? String(diff.oldValue) : '(empty)'}
                                </span>
                                <span className="text-primary-light font-bold text-[10px] sm:text-xs select-none">→</span>
                                <span className="text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-100 break-all font-mono font-bold text-[10.5px]">
                                  {diff.newValue !== undefined && diff.newValue !== null ? String(diff.newValue) : '(empty)'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isDelete && (
                  <div className="flex items-start gap-3 bg-red-50/50 border border-red-200 p-4 rounded-xl text-red-950 font-sans text-xs">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <span className="font-mono text-[8.5px] uppercase tracking-wider font-extrabold text-red-700 block">Deletion Request</span>
                      <p>
                        Approval will **permanently delete** this property listing and remove it from Google Sheets, the Supabase database, and the public portfolio.
                      </p>
                    </div>
                  </div>
                )}

                {isArchive && (
                  <div className="flex items-start gap-3 bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-amber-950 font-sans text-xs">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 leading-relaxed">
                      <span className="font-mono text-[8.5px] uppercase tracking-wider font-extrabold text-amber-700 block">Archival Request</span>
                      <p>
                        Approval will change this property's status to **Archived**. Archived properties are hidden from public browse views but retained in the agent database.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-outline/10 pt-4 flex justify-end gap-3 bg-white">
                  <button 
                    disabled={isCurrentProcessing || processingId !== null}
                    onClick={() => handleReject(req.id)}
                    className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 px-5 py-2.5 font-mono text-[9.5px] font-bold uppercase tracking-widest transition-colors rounded-xl active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Reject Request
                  </button>
                  <button 
                    disabled={isCurrentProcessing || processingId !== null}
                    onClick={() => handleApprove(req.id)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-2.5 font-mono text-[9.5px] font-bold uppercase tracking-widest transition-all rounded-xl active:scale-98 disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> {isCurrentProcessing ? 'Processing...' : 'Approve & Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
