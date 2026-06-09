import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '../types';
import { useProperties } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import { normalizeAgentName, cn } from '../lib/utils';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: any) => Promise<void> | void;
  initialData?: Property;
}

const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { properties } = useProperties();
  const { userEmail } = useAuth();
  
  const uniqueCities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)));
  const uniqueAgents = Array.from(
    new Set(
      properties
        .map(p => p.accommodatedBy)
        .filter((name): name is string => !!name)
        .map(normalizeAgentName)
    )
  ).sort();

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
    tags: [],
    videoUrl: '',
    pricePeriod: '',
    originalPrice: 0,
    accommodatedBy: '',
    createdBy: ''
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [landmarksList, setLandmarksList] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amenitiesImages, setAmenitiesImages] = useState<string[]>([]);
  const [amenitiesVideoUrl, setAmenitiesVideoUrl] = useState<string>('');
  const [amenitiesInput, setAmenitiesInput] = useState<string>('');

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<'property' | 'amenity' | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        videoUrl: initialData.videoUrl || '',
        pricePeriod: initialData.pricePeriod || '',
        originalPrice: initialData.originalPrice || 0,
        accommodatedBy: initialData.accommodatedBy || '',
        createdBy: initialData.createdBy || ''
      });
      setImageUrls(initialData.images || []);
      setAmenitiesImages(initialData.amenitiesImages || []);
      setAmenitiesVideoUrl(initialData.amenitiesVideoUrl || '');
      setAmenitiesInput(initialData.amenities ? initialData.amenities.join(', ') : '');
      if (initialData.landmarks) {
        const parsed = initialData.landmarks.split(/\r?\n/).filter(Boolean);
        setLandmarksList(parsed.length > 0 ? parsed : ['']);
      } else {
        setLandmarksList(['']);
      }
    } else {
      setFormData({
        title: '', price: 0, currency: 'PHP', status: 'Active', city: '', address: '',
        type: 'For Sale', bedrooms: 0, bathrooms: 0, area: 0, description: '', landmarks: '', mapsLink: '', images: [], tags: [], videoUrl: '', pricePeriod: '', originalPrice: 0,
        accommodatedBy: '', createdBy: ''
      });
      setImageUrls([]);
      setAmenitiesImages([]);
      setAmenitiesVideoUrl('');
      setAmenitiesInput('');
      setLandmarksList(['']);
    }
    setError(null);
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
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        alert(`File "${file.name}" is not an image or video. Please upload images or videos only.`);
        return;
      }
      const maxSize = isVideo ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
      const sizeLimitText = isVideo ? '30MB' : '10MB';
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Max allowed size is ${sizeLimitText}.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resultStr = reader.result as string;
        let finalUrl = resultStr;
        if (isImage) {
          finalUrl = await compressImage(resultStr);
        }
        setImageUrls(prev => [...prev, finalUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number, type: 'property' | 'amenity') => {
    setDraggedIndex(index);
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number, type: 'property' | 'amenity') => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type || draggedIndex === targetIndex) return;

    if (type === 'property') {
      const newUrls = [...imageUrls];
      const draggedItem = newUrls[draggedIndex];
      newUrls.splice(draggedIndex, 1);
      newUrls.splice(targetIndex, 0, draggedItem);
      setImageUrls(newUrls);
    } else {
      const newUrls = [...amenitiesImages];
      const draggedItem = newUrls[draggedIndex];
      newUrls.splice(draggedIndex, 1);
      newUrls.splice(targetIndex, 0, draggedItem);
      setAmenitiesImages(newUrls);
    }

    setDraggedIndex(null);
    setDraggedType(null);
  };

  const handleAmenitiesImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        alert(`File "${file.name}" is not an image or video. Please upload images or videos only.`);
        return;
      }
      const maxSize = isVideo ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
      const sizeLimitText = isVideo ? '30MB' : '10MB';
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Max allowed size is ${sizeLimitText}.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resultStr = reader.result as string;
        let finalUrl = resultStr;
        if (isImage) {
          finalUrl = await compressImage(resultStr);
        }
        setAmenitiesImages(prev => [...prev, finalUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const finalData = {
        ...formData,
        images: imageUrls,
        amenities: amenitiesInput.split(',').map(a => a.trim()).filter(Boolean),
        amenitiesImages: amenitiesImages,
        amenitiesVideoUrl: amenitiesVideoUrl,
        accommodatedBy: formData.accommodatedBy ? normalizeAgentName(formData.accommodatedBy) : '',
        createdBy: formData.createdBy || userEmail || '',
        pricePeriod: formData.type === 'For Sale' ? '' : formData.pricePeriod,
        originalPrice: formData.originalPrice || null
      };
      await onSave(finalData);
      onClose();
    } catch (err: any) {
      console.error("Failed to save property:", err);
      setError(err.message || "Failed to save property. Please check your database connection or schema.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveArchived = async (e: React.MouseEvent) => {
    e.preventDefault();
    const form = document.getElementById('property-form') as HTMLFormElement;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const finalData = {
        ...formData,
        images: imageUrls,
        amenities: amenitiesInput.split(',').map(a => a.trim()).filter(Boolean),
        amenitiesImages: amenitiesImages,
        amenitiesVideoUrl: amenitiesVideoUrl,
        accommodatedBy: formData.accommodatedBy ? normalizeAgentName(formData.accommodatedBy) : '',
        createdBy: formData.createdBy || userEmail || '',
        pricePeriod: formData.type === 'For Sale' ? '' : formData.pricePeriod,
        status: 'Archived' as const,
        originalPrice: formData.originalPrice || null
      };
      await onSave(finalData);
      onClose();
    } catch (err: any) {
      console.error("Failed to save archived property:", err);
      setError(err.message || "Failed to save archived property listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border-b border-outline/30 bg-transparent py-2 focus:border-primary outline-none transition-colors text-sm font-sans";
  const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-jade-deep/40 backdrop-blur-sm" onClick={submitting ? undefined : onClose} />
      
      <div className="relative w-full max-w-2xl bg-white/95 frosted-jade border border-outline/20 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-outline/10 p-6">
          <h2 className="font-display text-2xl font-light text-primary tracking-wide">
            {initialData ? "Edit Property" : "Add New Property"}
          </h2>
          <button onClick={onClose} disabled={submitting} className="text-outline hover:text-primary transition-colors active:scale-95 disabled:opacity-30">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
              <span className="font-bold uppercase tracking-wider block mb-1">Failed to Save Property / 保存失败</span>
              {error}
            </div>
          )}
          <form id="property-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Title</label>
                <input required type="text" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Current Price (Now)</label>
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
                <label className={labelClass}>Original Price (Before Discount - Optional)</label>
                <div className="flex gap-2 items-end">
                  <span className="border-b border-outline/30 bg-transparent py-2 text-sm font-sans text-outline/50 w-8 text-center font-semibold select-none">
                    {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'JPY' ? '¥' : '₱'}
                  </span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 180000000"
                    className={inputClass + " flex-1"} 
                    value={formData.originalPrice || ''} 
                    onChange={e => setFormData({...formData, originalPrice: Number(e.target.value.replace(/\D/g, ''))})} 
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
              {formData.type === 'For Rent' && (
                <div>
                  <label className={labelClass}>Rental Specifics / Suffix</label>
                  <input 
                    type="text" 
                    placeholder="e.g. monthly, annually, night, room / mo" 
                    className={inputClass} 
                    list="rental-periods-datalist"
                    value={formData.pricePeriod || ''} 
                    onChange={e => setFormData({...formData, pricePeriod: e.target.value})} 
                  />
                  <datalist id="rental-periods-datalist">
                    <option value="monthly" />
                    <option value="annually" />
                    <option value="weekly" />
                    <option value="nightly" />
                  </datalist>
                </div>
              )}
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass + " appearance-none"} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Sold</option>
                  <option>Archived</option>
                  <option>Under Construction</option>
                  <option>Preselling</option>
                  <option>Unavailable</option>
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
              <div>
                <label className={labelClass}>Accommodating Agent</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Claire Saladaga"
                  className={inputClass} 
                  list="agents-datalist"
                  value={formData.accommodatedBy || ''} 
                  onChange={e => setFormData({...formData, accommodatedBy: e.target.value})} 
                />
                <datalist id="agents-datalist">
                  {uniqueAgents.map(agent => (
                    <option key={agent} value={agent} />
                  ))}
                </datalist>
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
              <div>
                <label className={labelClass}>Video Walkthrough URL</label>
                <input type="url" placeholder="e.g. YouTube, TikTok, Facebook link" className={inputClass} value={formData.videoUrl || ''} onChange={e => setFormData({...formData, videoUrl: e.target.value})} />
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
                <label className={labelClass}>Images & Videos</label>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple
                  className={inputClass + " file:mr-4 file:rounded-sm file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:tracking-widest file:text-primary hover:file:bg-primary/20"} 
                  onChange={handleImageUpload} 
                />

                {imageUrls.length > 0 && (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {imageUrls.map((url, index) => (
                      <div 
                        key={index} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index, 'property')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index, 'property')}
                        className={cn(
                          "relative h-32 w-48 shrink-0 overflow-hidden rounded-sm border border-outline/30 group cursor-grab active:cursor-grabbing hover:border-primary transition-all duration-200",
                          draggedIndex === index && draggedType === 'property' ? "opacity-30 border-dashed border-primary scale-95" : ""
                        )}
                      >
                        {url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') ? (
                          <div className="relative h-full w-full bg-black pointer-events-none">
                            <video src={url} className="h-full w-full object-cover" muted playsInline />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                              <span className="font-mono text-[8px] font-bold text-white uppercase tracking-widest bg-primary px-2 py-0.5 rounded-sm">VIDEO</span>
                            </div>
                          </div>
                        ) : (
                          <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover pointer-events-none select-none" />
                        )}
                        <button
                          type="button"
                          onClick={() => setImageUrls(urls => urls.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-2 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity rounded-sm z-10 pointer-events-none">
                          <span className="font-mono text-[7px] font-bold text-white uppercase tracking-widest select-none">Drag to Reorder</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features & Amenities */}
              <div className="md:col-span-2 border-t border-outline/10 pt-6">
                <label className={labelClass}>Features & Amenities (Comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Swimming Pool, Fitness Gym, 24/7 Security, Playground, Clubhouse" 
                  className={inputClass} 
                  value={amenitiesInput} 
                  onChange={e => setAmenitiesInput(e.target.value)} 
                />
              </div>

              {/* Amenities Images & Video Section */}
              <div className="md:col-span-2">
                <label className={labelClass}>Amenities Images & Videos</label>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple
                  className={inputClass + " file:mr-4 file:rounded-sm file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:tracking-widest file:text-primary hover:file:bg-primary/20"} 
                  onChange={handleAmenitiesImageUpload} 
                />

                {amenitiesImages.length > 0 && (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {amenitiesImages.map((url, index) => (
                      <div 
                        key={index} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index, 'amenity')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index, 'amenity')}
                        className={cn(
                          "relative h-32 w-48 shrink-0 overflow-hidden rounded-sm border border-outline/30 group cursor-grab active:cursor-grabbing hover:border-primary transition-all duration-200",
                          draggedIndex === index && draggedType === 'amenity' ? "opacity-30 border-dashed border-primary scale-95" : ""
                        )}
                      >
                        {url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') ? (
                          <div className="relative h-full w-full bg-black pointer-events-none">
                            <video src={url} className="h-full w-full object-cover" muted playsInline />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                              <span className="font-mono text-[8px] font-bold text-white uppercase tracking-widest bg-primary px-2 py-0.5 rounded-sm">VIDEO</span>
                            </div>
                          </div>
                        ) : (
                          <img src={url} alt={`Amenities Preview ${index + 1}`} className="h-full w-full object-cover pointer-events-none select-none" />
                        )}
                        <button
                          type="button"
                          onClick={() => setAmenitiesImages(urls => urls.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-2 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity rounded-sm z-10 pointer-events-none">
                          <span className="font-mono text-[7px] font-bold text-white uppercase tracking-widest select-none">Drag to Reorder</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Amenities Video Tour URL</label>
                <input type="url" placeholder="e.g. YouTube/Vimeo tour link of amenities" className={inputClass} value={amenitiesVideoUrl} onChange={e => setAmenitiesVideoUrl(e.target.value)} />
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

        <div className="border-t border-outline/10 p-6 flex justify-end gap-4 bg-background-warm/50 flex-wrap">
          <button type="button" disabled={submitting} onClick={onClose} className="px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface hover:bg-black/5 transition-colors active:scale-95 disabled:opacity-50">
            Cancel
          </button>
          {!initialData && (
            <button 
              type="button" 
              disabled={submitting}
              onClick={handleSaveArchived} 
              className="border-2 border-orange-600/35 text-orange-600 hover:bg-orange-50 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save as Archived"}
            </button>
          )}
          <button type="submit" form="property-form" disabled={submitting} className="bg-primary text-white px-8 py-3 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-primary-light transition-colors active:scale-95 shadow-lg disabled:opacity-50">
            {submitting ? "Saving..." : (initialData ? "Save Changes" : "Publish Property")}
          </button>
        </div>
      </div>
    </div>
  );
};
