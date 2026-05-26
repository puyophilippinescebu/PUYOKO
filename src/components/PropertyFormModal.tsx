import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Property } from '../types';
import { useProperties } from '../contexts/PropertiesContext';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: any) => void;
  initialData?: Property;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { properties } = useProperties();
  const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)));

  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    price: 0,
    currency: 'PHP',
    status: 'Active',
    city: '',
    address: '',
    type: 'For Sale',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    description: '',
    landmarks: '',
    mapsLink: '',
    images: [],
    tags: []
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [landmarksList, setLandmarksList] = useState<string[]>(['']);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImageUrls(initialData.images || []);
      if (initialData.landmarks) {
        const parsed = initialData.landmarks.split(/\r?\n/).filter(Boolean);
        setLandmarksList(parsed.length > 0 ? parsed : ['']);
      } else {
        setLandmarksList(['']);
      }
    } else {
      setFormData({
        title: '', price: 0, currency: 'PHP', status: 'Active', city: '', address: '',
        type: 'For Sale', bedrooms: 0, bathrooms: 0, area: 0, description: '', landmarks: '', mapsLink: '', images: [], tags: []
      });
      setImageUrls([]);
      setLandmarksList(['']);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleLandmarkChange = (index: number, value: string) => {
    const newList = [...landmarksList];
    newList[index] = value;
    setLandmarksList(newList);
    setFormData(prev => ({ ...prev, landmarks: newList.filter(Boolean).join('\n') }));
  };

  const addLandmarkField = () => {
    setLandmarksList([...landmarksList, '']);
  };

  const removeLandmarkField = (index: number) => {
    const newList = landmarksList.filter((_, i) => i !== index);
    const finalList = newList.length > 0 ? newList : [''];
    setLandmarksList(finalList);
    setFormData(prev => ({ ...prev, landmarks: finalList.filter(Boolean).join('\n') }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      images: imageUrls
    };
    onSave(finalData);
    onClose();
  };

  const inputClass = "w-full border-b border-outline/30 bg-transparent py-2 focus:border-primary outline-none transition-colors text-sm font-sans";
  const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-jade-deep/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white/95 frosted-jade border border-outline/20 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-outline/10 p-6">
          <h2 className="font-display text-2xl font-light text-primary tracking-wide">
            {initialData ? "Edit Property" : "Add New Property"}
          </h2>
          <button onClick={onClose} className="text-outline hover:text-primary transition-colors active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 flex-1">
          <form id="property-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Title</label>
                <input required type="text" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Price</label>
                <div className="flex gap-2 items-end">
                  <select 
                    className="border-b border-outline/30 bg-transparent py-2 focus:border-primary outline-none transition-colors text-sm font-sans w-8 appearance-none text-center cursor-pointer font-semibold" 
                    value={formData.currency || 'PHP'} 
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="PHP">₱</option>
                    <option value="USD">$</option>
                    <option value="EUR">€</option>
                    <option value="JPY">¥</option>
                  </select>
                  <input 
                    required 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={inputClass + " flex-1"} 
                    value={formData.price || ''} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value.replace(/\D/g, ''))})} 
                  />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass + " appearance-none"} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                  <option>For Sale</option>
                  <option>For Rent</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass + " appearance-none"} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Sold</option>
                  <option>Archived</option>
                  <option>Under Construction</option>
                  <option>Preselling</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>City</label>
                <input 
                  required 
                  type="text" 
                  className={inputClass} 
                  list="cities-datalist"
                  value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                />
                <datalist id="cities-datalist">
                  {uniqueCities.map(city => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>Full Address</label>
                <input required type="text" className={inputClass} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              
              <div className="md:col-span-2">
                <label className={labelClass}>Landmarks</label>
                <div className="space-y-2">
                  {landmarksList.map((landmark, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <input
                        type="text"
                        placeholder="e.g. Ayala Center, SM City"
                        className={inputClass + " flex-1"}
                        value={landmark}
                        onChange={e => handleLandmarkChange(index, e.target.value)}
                      />
                      {landmarksList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLandmarkField(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 active:scale-90"
                          title="Remove Landmark"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLandmarkField}
                    className="mt-2 inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-colors rounded-sm active:scale-95"
                  >
                    + Add Landmark
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Google Maps URL</label>
                <input type="url" placeholder="https://maps.google.com/..." className={inputClass} value={formData.mapsLink || ''} onChange={e => setFormData({...formData, mapsLink: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-4 md:col-span-2">
                <div>
                  <label className={labelClass}>Bedrooms</label>
                  <input required type="number" className={inputClass} value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})} />
                </div>
                <div>
                  <label className={labelClass}>Bathrooms</label>
                  <input required type="number" className={inputClass} value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})} />
                </div>
                <div>
                  <label className={labelClass}>Area (sqm)</label>
                  <input required type="number" className={inputClass} value={formData.area} onChange={e => setFormData({...formData, area: Number(e.target.value)})} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Images</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className={inputClass + " file:mr-4 file:rounded-sm file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:tracking-widest file:text-primary hover:file:bg-primary/20"} 
                  onChange={handleImageUpload} 
                />

                {imageUrls.length > 0 && (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative h-32 w-48 shrink-0 overflow-hidden rounded-sm border border-outline/30 group">
                        <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrls(urls => urls.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea 
                  required 
                  rows={5} 
                  className="w-full rounded-md border border-outline/30 bg-white/50 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-sans resize-y shadow-sm leading-relaxed" 
                  placeholder="Enter a detailed description of the estate..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-outline/10 p-6 flex justify-end gap-4 bg-background-warm/50">
          <button onClick={onClose} className="px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface hover:bg-black/5 transition-colors active:scale-95">
            Cancel
          </button>
          <button type="submit" form="property-form" className="bg-primary text-white px-8 py-3 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-primary-light transition-colors active:scale-95 shadow-lg">
            Save Property
          </button>
        </div>
      </div>
    </div>
  );
};
