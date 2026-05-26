import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Calendar, Search, ArrowRight, User, Clock, MapPin, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

interface EventPost {
  id: string;
  title: string;
  description: string;
  category: "Grand Launch" | "Open House" | "Property Expo" | "CSR Activity";
  location: string;
  date: string;
  time: string;
  image: string;
  highlights: string[];
}

const MOCK_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Crucial Tips for First-Time Homebuyers in Cebu",
    excerpt: "Navigating Cebu's real estate market can be challenging. Here is your ultimate checklist to buy your first home with confidence.",
    content: "Cebu's rapid economic development has made it one of the most attractive real estate markets in the Philippines. However, for first-time buyers, the process can feel overwhelming. From choosing between a condominium and a house and lot to understanding payment schemes, accents, and dynamic bank rates, there are several variables to evaluate. Firstly, define your long-term goals. Are you purchasing a property for personal stay, or as an active investment? Secondly, set a firm budget that takes into account not just the selling price but secondary expenses like transfer taxes, association fees, and utility deposits...",
    category: "Buying Guides",
    author: "Jan Eric Saladaga",
    date: "May 20, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    tags: ["Real Estate", "First Time Buyer", "Cebu Guide"]
  },
  {
    id: "blog-2",
    title: "Why Mactan Island is the Next Hub for Premium Estates",
    excerpt: "With the new Cebu-Cordova Link Expressway (CCLEX), Mactan is seeing an architectural renaissance. Here is why luxury investors are shifting focus.",
    content: "Mactan Island has always been celebrated for its beautiful luxury beach resorts and international airport. But today, it is undergoing an architectural and investment renaissance. The completion of the state-of-the-art CCLEX bridge has completely altered Cebu's transportation network, turning what used to be a long commute into a scenic 15-minute drive from the city. As a result, premium residential developments, master-planned townships, and heritage-style homes are rising across Mactan. Investors are realizing that Mactan offers a unique blend of cosmopolitan convenience and marine tranquility that is hard to find anywhere else in Southeast Asia...",
    category: "Market Insights",
    author: "Ryaih Mae Saladaga",
    date: "April 28, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    tags: ["CCLEX", "Luxury Living", "Investment Trends"]
  },
  {
    id: "blog-3",
    title: "Bahay na Bato: Integrating Filipino Heritage in Modern Architecture",
    excerpt: "How Puyoko is leading a design movement that honors Visayan structural heritage while employing contemporary minimalist layouts.",
    content: "True architecture does not delete the past—it reinterprets it. At Puyoko, we are deeply inspired by the classic Bahay na Bato. Originally constructed with adobe bases and light wood/capiz upper structures, these homes were perfectly suited to the tropical Philippine climate. Today, we are working with Cebu's top designers to integrate Narra woodwork, local limestone, and Capiz window geometries into minimalist, glass-filled estates. The result is a premium home that feels ethereal and contemporary, yet carries the solid weight and heritage of a traditional Visayan estate...",
    category: "Architecture & Design",
    author: "Puyoko Design Team",
    date: "March 15, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    tags: ["Heritage", "Minimalism", "Local Architecture"]
  }
];

const MOCK_EVENTS: EventPost[] = [
  {
    id: "event-1",
    title: "Puyoko Consolacion Premium Estates Grand Open House",
    description: "Join us for an exclusive guided walk through our latest premium lots and showhouses in Consolacion, featuring live music and Visayan delicacies.",
    category: "Open House",
    location: "Yanessa Country Homes Phase 1, Consolacion, Cebu",
    date: "June 6, 2026",
    time: "9:00 AM - 4:00 PM",
    image: "https://images.unsplash.com/photo-1511520790967-6880c858b0a1?auto=format&fit=crop&w=800&q=80",
    highlights: ["Interactive guided tour", "Introductory payment consultation", "Complimentary cocktail buffet"]
  },
  {
    id: "event-2",
    title: "Cebu Real Estate & Investment Expo 2026",
    description: "Puyoko will be showcasing our latest pre-selling and under-construction estates at the SM Seaside Sky Hall. Visit our booth for special event discounts.",
    category: "Property Expo",
    location: "Sky Hall, SM Seaside City Cebu",
    date: "July 11-12, 2026",
    time: "10:00 AM - 9:00 PM",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    highlights: ["Exclusive event-only 5% reservation discounts", "Founder's keynote panel on Cebu Investment", "Free structural consultations"]
  },
  {
    id: "event-3",
    title: "Puyoko Balay Rebuilding Project: Community CSR",
    description: "Our quarterly corporate social responsibility project where we collaborate with local carpenters to restore traditional timber homes in rural Consolacion.",
    category: "CSR Activity",
    location: "Barangay Tolo-Tolo, Consolacion, Cebu",
    date: "May 2, 2026",
    time: "8:00 AM - 5:00 PM",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    highlights: ["Sourced eco-friendly Narra and timber materials", "Restored 3 historical family homes", "Funded neighborhood toolkits"]
  }
];

export const MediaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tabs: 'blogs' or 'events'
  const activeTab = searchParams.get('tab') === 'events' ? 'events' : 'blogs';

  const handleTabChange = (tab: 'blogs' | 'events') => {
    setSearchParams({ tab });
    setSearchQuery('');
  };

  // Filter Blogs based on search
  const filteredBlogs = useMemo(() => {
    if (!searchQuery) return MOCK_BLOGS;
    return MOCK_BLOGS.filter(blog => 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  // Filter Events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return MOCK_EVENTS;
    return MOCK_EVENTS.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
                ? "bg-primary text-white shadow-md"
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
                ? "bg-primary text-white shadow-md"
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

      {/* Content Rendering */}
      {activeTab === 'blogs' ? (
        filteredBlogs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 text-center p-8 bg-white/50">
            <p className="font-display text-lg font-bold text-on-surface-variant">No articles found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map(blog => (
              <article 
                key={blog.id} 
                className="bg-white border border-outline/25 rounded-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:border-primary/20 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold uppercase font-display tracking-widest text-primary shadow-sm border border-outline/10">
                    {blog.category}
                  </span>
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
                    <button className="flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-widest text-primary hover:text-primary-light transition-all hover:pl-2 active:scale-95">
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
                className="bg-white border border-outline/25 rounded-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:border-primary/20 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 bg-primary text-white px-2.5 py-1 text-[9px] font-extrabold uppercase font-display tracking-widest shadow-sm">
                    {event.category}
                  </span>
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
                  <div className="mt-4 bg-primary/5 rounded p-3 border border-primary/10">
                    <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-primary mb-1.5 block">Highlights / 重点</span>
                    <ul className="list-disc pl-4 text-[10px] text-on-surface-variant/90 space-y-1">
                      {event.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
