import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyName?: string;
  title?: string;
  itemType?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  propertyName,
  title,
  itemType = 'property'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-jade-deep/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white p-8 shadow-2xl rounded-2xl transform transition-all scale-100 opacity-100">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-outline hover:text-primary transition-colors active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
 
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 border border-red-100">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="font-display text-2xl font-bold text-primary mb-2">
            {title || `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
          </h2>
          
          <p className="font-sans text-on-surface-variant mb-6">
            Are you sure you want to delete <strong className="text-primary">{propertyName || `this ${itemType}`}</strong>? 
            This action cannot be undone and will permanently remove it from the system.
          </p>
 
          <div className="flex w-full gap-4 mt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface border border-outline/30 rounded-lg hover:bg-black/5 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all active:scale-95 shadow-md shadow-red-500/20"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
