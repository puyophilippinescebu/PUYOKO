import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Calendar, Search, ArrowRight, User, Clock, MapPin, Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMedia, BlogPost, EventPost } from '../contexts/MediaContext';
import { useAuth } from '../contexts/AuthContext';
import { MediaFormModal } from '../components/MediaFormModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export const MediaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth & Media Context
  const { isAuthenticated } = useAuth();
  const { 
    blogs, 
    events, 
    loading, 
    addBlog, 
    updateBlog, 
    deleteBlog, 
    addEvent, 
    updateEvent, 
    deleteEvent 
  } = useMedia();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'blog' | 'event'>('blog');
  const [editingItem, setEditingItem] = useState<any | undefined>();
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string; type: 'blog' | 'event' } | null>(null);

  // Tabs: 'blogs' or 'events'
  const activeTab = searchParams.get('tab') === 'events' ? 'events' : 'blogs';

  const handleTabChange = (tab: 'blogs' | 'events') => {
    setSearchParams({ tab });
    setSearchQuery('');
  };

  // Lock background scrolling when form modal is open
  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFormOpen]);

  // Filter Blogs based on search
  const filteredBlogs = useMemo(() => {
    if (!searchQuery) return blogs;
    return blogs.filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [blogs, searchQuery]);

  // Filter Events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    return events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const handleSave = async (data: any) => {
    if (formType === 'blog') {
      if (editingItem) {
        await updateBlog({ ...editingItem, ...data });
      } else {
        await addBlog(data);
      }
    } else {
      if (editingItem) {
        await updateEvent({ ...editingItem, ...data });
      } else {
        await addEvent(data);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'blog') {
      await deleteBlog(itemToDelete.id);
    } else {
      await deleteEvent(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  return (
    <div className="mx-auto max-w-container-max px-gutter py-16">
      {/* Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <span className="text-primary-light text-xs font-mono tracking-[0.4em] uppercase block mb-3">Insights / 新闻</span>
        <h1 className="font-display text-4xl sm:text-5xl font-light text-primary mb-4 leading-tight">
          Media & <span className="italic-serif text-primary-light">Insights</span>
        </h1>
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
          Stay informed with the latest buying guides, market updates, open houses, property expos, and community rebuilding activities across Cebu.
        </p>
      </div>

      {/* Tab Navigation and Search Bar */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-outline/25 pb-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => handleTabChange('blogs')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer border-0 outline-none",
              activeTab === 'blogs'
                ? "bg-primary text-white shadow-md animate-fade-in"
                : "text-on-surface-variant/70 hover:bg-primary/5 hover:text-primary"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Company Blog</span>
          </button>
          <button
            onClick={() => handleTabChange('events')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer border-0 outline-none",
              activeTab === 'events'
                ? "bg-primary text-white shadow-md animate-fade-in"
                : "text-on-surface-variant/70 hover:bg-primary/5 hover:text-primary"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Expos & Events</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-outline z-10" />
          <input
            type="text"
            placeholder={activeTab === 'blogs' ? "Search articles..." : "Search expos / events..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline/30 rounded pl-9 pr-4 py-2 font-sans text-xs outline-none focus:border-primary transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Results Header & Add Button */}
      <div className="mb-10 flex items-center justify-between border-b border-outline/10 pb-6">
        <h3 className="font-display text-2xl font-bold text-primary">
          {loading ? 'Loading...' : (activeTab === 'blogs' ? `${filteredBlogs.length} Articles Published` : `${filteredEvents.length} Events Scheduled`)}
        </h3>
        {isAuthenticated && (
          <button
            onClick={() => {
              setEditingItem(undefined);
              setFormType(activeTab === 'blogs' ? 'blog' : 'event');
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-primary-light transition-all active:scale-95 cursor-pointer shadow-md border-0 outline-none"
          >
            <Plus className="h-4 w-4" />
            {activeTab === 'blogs' ? 'Add Blog Post' : 'Add Expo & Event'}
          </button>
        )}
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="font-mono text-xs uppercase tracking-widest text-primary animate-pulse">Loading listings...</div>
        </div>
      ) : activeTab === 'blogs' ? (
        filteredBlogs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 text-center p-8 bg-white/50">
            <p className="font-display text-lg font-bold text-on-surface-variant">No articles found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map(blog => (
              <article 
                key={blog.id} 
                className="bg-white border border-outline/25 rounded-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold uppercase font-display tracking-widest text-primary shadow-sm border border-outline/10">
                    {blog.category}
                  </span>

                  {/* Admin Controls Overlay */}
                  {isAuthenticated && (
                    <div className="absolute right-4 top-4 flex gap-2 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingItem(blog);
                          setFormType('blog');
                          setIsFormOpen(true);
                        }}
                        title="Edit Blog"
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-lg active:scale-95 cursor-pointer border-0 outline-none"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setItemToDelete({ id: blog.id, title: blog.title, type: 'blog' });
                        }}
                        title="Delete Blog"
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg active:scale-95 cursor-pointer border-0 outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-[9px] font-display font-extrabold uppercase tracking-widest text-on-surface-variant/40 mb-3">
                    <span className="flex items-center gap-1"><User className="w-3 h-3 text-primary/50" /> {blog.author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary/50" /> {blog.readTime}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-primary mb-2 leading-snug group-hover:text-primary-light transition-colors">
                    {blog.title}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant/90 leading-relaxed mb-4 flex-grow">
                    {blog.excerpt}
                  </p>

                  <div className="border-t border-outline/10 pt-4 flex justify-between items-center mt-auto">
                    <span className="text-[10px] font-mono text-primary/50 uppercase tracking-widest">{blog.date}</span>
                    <button className="flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-widest text-primary hover:text-primary-light transition-all hover:pl-2 active:scale-95 border-0 bg-transparent outline-none cursor-pointer">
                      Read Article <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        filteredEvents.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 text-center p-8 bg-white/50">
            <p className="font-display text-lg font-bold text-on-surface-variant">No events found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <div 
                key={event.id} 
                className="bg-white border border-outline/25 rounded-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:border-primary/20 transition-all duration-500 relative"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 bg-primary text-white px-2.5 py-1 text-[9px] font-extrabold uppercase font-display tracking-widest shadow-sm">
                    {event.category}
                  </span>

                  {/* Admin Controls Overlay */}
                  {isAuthenticated && (
                    <div className="absolute right-4 top-4 flex gap-2 z-20">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingItem(event);
                          setFormType('event');
                          setIsFormOpen(true);
                        }}
                        title="Edit Event"
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-lg active:scale-95 cursor-pointer border-0 outline-none"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setItemToDelete({ id: event.id, title: event.title, type: 'event' });
                        }}
                        title="Delete Event"
                        className="bg-white/90 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg active:scale-95 cursor-pointer border-0 outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-serif text-lg font-bold text-primary mb-3 leading-snug group-hover:text-primary-light transition-colors">
                    {event.title}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant/90 leading-relaxed mb-4">
                    {event.description}
                  </p>

                  {/* Details Block */}
                  <div className="mt-auto space-y-2 pt-4 border-t border-outline/10 text-on-surface-variant/90 text-xs leading-relaxed font-sans">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                      <span><strong>Date / Time:</strong> {event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                      <span><strong>Location:</strong> {event.location}</span>
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  {event.highlights && event.highlights.length > 0 && (
                    <div className="mt-4 bg-primary/5 rounded p-3 border border-primary/10">
                      <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-primary mb-1.5 block">Highlights / 重点</span>
                      <ul className="list-disc pl-4 text-[10px] text-on-surface-variant/90 space-y-1">
                        {event.highlights.map((highlight, idx) => (
                          <li key={idx}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <MediaFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingItem(undefined); }}
        onSave={handleSave}
        type={formType}
        initialData={editingItem}
      />

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        propertyName={itemToDelete?.title}
        itemType={itemToDelete?.type === 'blog' ? 'article' : 'event'}
      />
    </div>
  );
};
