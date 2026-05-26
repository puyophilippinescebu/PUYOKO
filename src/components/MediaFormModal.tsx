import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BlogPost, EventPost } from '../contexts/MediaContext';

interface MediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  type: 'blog' | 'event';
  initialData?: any;
}

export const MediaFormModal: React.FC<MediaFormModalProps> = ({ isOpen, onClose, onSave, type, initialData }) => {
  const [blogData, setBlogData] = useState<Partial<BlogPost>>({
    title: '', excerpt: '', content: '', category: 'Buying Guides',
    author: 'Jan Eric Saladaga', readTime: '5 min read', image: '', tags: []
  });

  const [eventData, setEventData] = useState<Partial<EventPost>>({
    title: '', description: '', category: 'Open House',
    location: '', date: '', time: '', image: '', highlights: []
  });

  const [tagsInput, setTagsInput] = useState<string>('');
  const [highlightsInput, setHighlightsInput] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      if (type === 'blog') {
        setBlogData(initialData);
        setImageUrl(initialData.image || '');
        setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
      } else {
        setEventData(initialData);
        setImageUrl(initialData.image || '');
        setHighlightsInput(initialData.highlights ? initialData.highlights.join('\n') : '');
      }
    } else {
      setBlogData({
        title: '', excerpt: '', content: '', category: 'Buying Guides',
        author: 'Jan Eric Saladaga', readTime: '5 min read', image: '', tags: []
      });
      setEventData({
        title: '', description: '', category: 'Open House',
        location: '', date: '', time: '', image: '', highlights: []
      });
      setImageUrl('');
      setTagsInput('');
      setHighlightsInput('');
    }
  }, [initialData, isOpen, type]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'blog') {
      const tagsList = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
      onSave({
        ...blogData,
        image: imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', // Fallback
        tags: tagsList,
        date: blogData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    } else {
      const highlightsList = highlightsInput.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
      onSave({
        ...eventData,
        image: imageUrl || 'https://images.unsplash.com/photo-1511520790967-6880c858b0a1?auto=format&fit=crop&w=800&q=80', // Fallback
        highlights: highlightsList
      });
    }
    onClose();
  };

  const inputClass = "w-full border-b border-outline/30 bg-transparent py-2 focus:border-primary outline-none transition-colors text-sm font-sans";
  const labelClass = "block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1";
  const selectClass = "w-full border-b border-outline/30 bg-transparent py-2.5 focus:border-primary outline-none transition-colors text-sm font-sans cursor-pointer";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-jade-deep/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white/95 frosted-jade border border-outline/20 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-outline/10 p-6">
          <h2 className="font-display text-2xl font-light text-primary tracking-wide">
            {initialData ? (type === 'blog' ? "Edit Blog Post" : "Edit Event Details") : (type === 'blog' ? "Publish Blog Post" : "Publish Expo & Event")}
          </h2>
          <button onClick={onClose} className="text-outline hover:text-primary transition-colors active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 flex-1">
          <form id="media-form" onSubmit={handleSubmit} className="space-y-6">
            
            {type === 'blog' ? (
              // ── BLOG ARTICLE FORM FIELDS ──
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Article Title</label>
                    <input 
                      required 
                      type="text" 
                      className={inputClass} 
                      value={blogData.title || ''} 
                      onChange={e => setBlogData({...blogData, title: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <select 
                      className={selectClass} 
                      value={blogData.category || 'Buying Guides'} 
                      onChange={e => setBlogData({...blogData, category: e.target.value})}
                    >
                      <option>Buying Guides</option>
                      <option>Market Insights</option>
                      <option>Architecture & Design</option>
                      <option>Company News</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Author Name</label>
                    <input 
                      required 
                      type="text" 
                      className={inputClass} 
                      value={blogData.author || ''} 
                      onChange={e => setBlogData({...blogData, author: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Read Time (e.g. 5 min read)</label>
                    <input 
                      required 
                      type="text" 
                      className={inputClass} 
                      value={blogData.readTime || ''} 
                      onChange={e => setBlogData({...blogData, readTime: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Short Excerpt (Summary)</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Provide a brief summary of the article..."
                    className={inputClass} 
                    value={blogData.excerpt || ''} 
                    onChange={e => setBlogData({...blogData, excerpt: e.target.value})} 
                  />
                </div>

                <div>
                  <label className={labelClass}>Full Article Content</label>
                  <textarea 
                    required 
                    rows={8}
                    placeholder="Write your article content here..."
                    className="w-full border border-outline/30 bg-transparent p-4 rounded-sm focus:border-primary outline-none transition-colors text-sm font-sans leading-relaxed resize-y" 
                    value={blogData.content || ''} 
                    onChange={e => setBlogData({...blogData, content: e.target.value})} 
                  />
                </div>

                <div>
                  <label className={labelClass}>Tags (comma-separated, e.g. Heritage, Design, Cebu)</label>
                  <input 
                    type="text" 
                    placeholder="Real Estate, Buying, Invest"
                    className={inputClass} 
                    value={tagsInput} 
                    onChange={e => setTagsInput(e.target.value)} 
                  />
                </div>
              </div>
            ) : (
              // ── EVENT & EXPO FORM FIELDS ──
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Event Title</label>
                    <input 
                      required 
                      type="text" 
                      className={inputClass} 
                      value={eventData.title || ''} 
                      onChange={e => setEventData({...eventData, title: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Event Category</label>
                    <select 
                      className={selectClass} 
                      value={eventData.category || 'Open House'} 
                      onChange={e => setEventData({...eventData, category: e.target.value as any})}
                    >
                      <option>Open House</option>
                      <option>Property Expo</option>
                      <option>Grand Launch</option>
                      <option>CSR Activity</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Date (e.g. June 6, 2026)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. June 6, 2026"
                      className={inputClass} 
                      value={eventData.date || ''} 
                      onChange={e => setEventData({...eventData, date: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Time Slot (e.g. 9:00 AM - 4:00 PM)</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. 9:00 AM - 4:00 PM"
                      className={inputClass} 
                      value={eventData.time || ''} 
                      onChange={e => setEventData({...eventData, time: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Location Address</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Yanessa Country Homes, Consolacion, Cebu"
                    className={inputClass} 
                    value={eventData.location || ''} 
                    onChange={e => setEventData({...eventData, location: e.target.value})} 
                  />
                </div>

                <div>
                  <label className={labelClass}>Event Description</label>
                  <textarea 
                    required 
                    rows={4}
                    placeholder="Provide a comprehensive description of the event, itinerary, or agenda..."
                    className="w-full border border-outline/30 bg-transparent p-4 rounded-sm focus:border-primary outline-none transition-colors text-sm font-sans leading-relaxed resize-y" 
                    value={eventData.description || ''} 
                    onChange={e => setEventData({...eventData, description: e.target.value})} 
                  />
                </div>

                <div>
                  <label className={labelClass}>Event Highlights (one per line)</label>
                  <textarea 
                    rows={4}
                    placeholder="e.g.&#10;Complimentary Visayan buffet&#10;Founder keynote speech&#10;Special event reservation discounts"
                    className="w-full border border-outline/30 bg-transparent p-4 rounded-sm focus:border-primary outline-none transition-colors text-sm font-sans leading-relaxed resize-y" 
                    value={highlightsInput} 
                    onChange={e => setHighlightsInput(e.target.value)} 
                  />
                </div>
              </div>
            )}

            {/* Shared Image Section */}
            <div className="border-t border-outline/10 pt-6">
              <label className={labelClass}>Featured Cover Image</label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input 
                  type="file" 
                  accept="image/*"
                  className={inputClass + " flex-1 file:mr-4 file:rounded-sm file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:tracking-widest file:text-primary hover:file:bg-primary/20"} 
                  onChange={handleImageUpload} 
                />
                {imageUrl && (
                  <div className="w-20 h-20 rounded border border-outline/30 overflow-hidden shrink-0 shadow-inner bg-surface-muted">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Footer controls */}
            <div className="flex gap-4 border-t border-outline/10 pt-6 justify-end">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3.5 border border-outline/30 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant hover:bg-outline/5 transition-all active:scale-95 cursor-pointer rounded-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3.5 bg-primary text-white font-mono text-[9px] uppercase tracking-widest hover:bg-primary-light transition-all active:scale-95 cursor-pointer rounded-sm shadow-md"
              >
                {initialData ? "Save Changes" : (type === 'blog' ? "Publish Article" : "Create Event")}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
