import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface BlogPost {
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

export interface EventPost {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  image: string;
  highlights: string[];
}

interface MediaContextType {
  blogs: BlogPost[];
  events: EventPost[];
  loading: boolean;
  fetchMedia: () => Promise<void>;
  addBlog: (blog: Omit<BlogPost, 'id'>) => Promise<void>;
  updateBlog: (blog: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addEvent: (event: Omit<EventPost, 'id'>) => Promise<void>;
  updateEvent: (event: EventPost) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

const SEED_BLOGS: BlogPost[] = [
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

const SEED_EVENTS: EventPost[] = [
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

export const MediaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<EventPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    let blogsSuccess = false;
    let eventsSuccess = false;

    // 1. Fetch Blogs
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setBlogs(data);
        blogsSuccess = true;
        localStorage.setItem('puyoko_blogs', JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Supabase blogs fetch failed, falling back to local cache.", err);
    }

    // 2. Fetch Events
    try {
      const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setEvents(data);
        eventsSuccess = true;
        localStorage.setItem('puyoko_events', JSON.stringify(data));
      }
    } catch (err) {
      console.warn("Supabase events fetch failed, falling back to local cache.", err);
    }

    // Respect empty database if fetch succeeded, else load cache/seeds
    if (blogsSuccess && eventsSuccess) {
      setLoading(false);
      return;
    }

    // Fallback Blogs
    if (!blogsSuccess) {
      const savedBlogs = localStorage.getItem('puyoko_blogs');
      if (savedBlogs) {
        try {
          setBlogs(JSON.parse(savedBlogs));
        } catch (e) {
          setBlogs(SEED_BLOGS);
        }
      } else {
        setBlogs(SEED_BLOGS);
        localStorage.setItem('puyoko_blogs', JSON.stringify(SEED_BLOGS));
      }
    }

    // Fallback Events
    if (!eventsSuccess) {
      const savedEvents = localStorage.getItem('puyoko_events');
      if (savedEvents) {
        try {
          setEvents(JSON.parse(savedEvents));
        } catch (e) {
          setEvents(SEED_EVENTS);
        }
      } else {
        setEvents(SEED_EVENTS);
        localStorage.setItem('puyoko_events', JSON.stringify(SEED_EVENTS));
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const addBlog = async (newBlog: Omit<BlogPost, 'id'>) => {
    const blogId = `BLOG-${Math.floor(Math.random() * 9000) + 1000}`;
    const blogToInsert = { ...newBlog, id: blogId } as BlogPost;
    const updated = [blogToInsert, ...blogs];
    
    setBlogs(updated);
    localStorage.setItem('puyoko_blogs', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('blogs').insert([blogToInsert]);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase blog write failed:", err);
      alert("Warning: Could not save blog to cloud database. Saved locally for now but will be lost if you reload.");
    }
  };

  const updateBlog = async (updatedBlog: BlogPost) => {
    const updated = blogs.map(b => b.id === updatedBlog.id ? updatedBlog : b);
    setBlogs(updated);
    localStorage.setItem('puyoko_blogs', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('blogs').update(updatedBlog).eq('id', updatedBlog.id);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase blog update failed:", err);
      alert("Warning: Could not save blog updates to cloud database. Saved locally for now but will be lost if you reload.");
    }
  };

  const deleteBlog = async (id: string) => {
    const filtered = blogs.filter(b => b.id !== id);
    setBlogs(filtered);
    localStorage.setItem('puyoko_blogs', JSON.stringify(filtered));

    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase blog delete failed:", err);
      alert("Warning: Could not save blog deletion to cloud. Saved locally for now.");
    }
  };

  const addEvent = async (newEvent: Omit<EventPost, 'id'>) => {
    const eventId = `EVENT-${Math.floor(Math.random() * 9000) + 1000}`;
    const eventToInsert = { ...newEvent, id: eventId } as EventPost;
    const updated = [eventToInsert, ...events];

    setEvents(updated);
    localStorage.setItem('puyoko_events', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('events').insert([eventToInsert]);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase event write failed:", err);
      alert("Warning: Could not save event to cloud database. Saved locally for now but will be lost if you reload.");
    }
  };

  const updateEvent = async (updatedEvent: EventPost) => {
    const updated = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updated);
    localStorage.setItem('puyoko_events', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('events').update(updatedEvent).eq('id', updatedEvent.id);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase event update failed:", err);
      alert("Warning: Could not save event updates to cloud database. Saved locally for now but will be lost if you reload.");
    }
  };

  const deleteEvent = async (id: string) => {
    const filtered = events.filter(e => e.id !== id);
    setEvents(filtered);
    localStorage.setItem('puyoko_events', JSON.stringify(filtered));

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Supabase event delete failed:", err);
      alert("Warning: Could not save event deletion to cloud. Saved locally for now.");
    }
  };

  return (
    <MediaContext.Provider value={{
      blogs, events, loading, fetchMedia,
      addBlog, updateBlog, deleteBlog,
      addEvent, updateEvent, deleteEvent
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
