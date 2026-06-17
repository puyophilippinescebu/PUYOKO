import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MessageSquare, X, Send, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const renderMessageText = (text: string) => {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    const isAbsolute = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');
    
    parts.push(
      <a 
        key={match.index}
        href={linkUrl}
        target={isAbsolute ? "_blank" : undefined}
        rel={isAbsolute ? "noopener noreferrer" : undefined}
        className="text-primary hover:text-primary-light font-bold underline transition-colors"
      >
        {linkText}
      </a>
    );
    lastIndex = markdownLinkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am Jade, Puyoko's virtual estate assistant. How can I help you find Cebu premium properties or book a private tour today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if chatbot is enabled in Supabase
  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const { data } = await supabase
          .from('chatbot_settings')
          .select('is_enabled')
          .eq('id', 1)
          .maybeSingle();
        
        if (data) {
          setIsEnabled(data.is_enabled);
        }
      } catch (err) {
        console.error('Failed to check if chatbot is enabled:', err);
      }
    };
    checkEnabled();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Hide the "Need help?" bubble after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Session limit check (Max 8 queries to prevent spamming/cost drain)
  const MAX_QUERIES = 8;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = input.trim();
    if (!cleanInput || loading) return;

    if (queryCount >= MAX_QUERIES) {
      setError("You have reached the maximum message limit for this session.");
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: 'user',
      text: cleanInput
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    setQueryCount(c => c + 1);

    try {
      // Map history for Gemini API model input formats
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      // Call secure serverless backend proxy
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanInput,
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error('API server request failed.');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'model',
        text: data.text || "I am sorry, I could not process that request."
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Chatbot query failed:", err);
      setError("Failed to get response. Please try again.");
      
      // Remove the last increment if it failed
      setQueryCount(c => Math.max(0, c - 1));
    } finally {
      setLoading(false);
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="flex items-center gap-2.5">
          {/* "Need help? Ask AI" Bubble */}
          {showBubble && (
            <div className="bg-jade-deep text-white text-[10px] sm:text-[11px] font-sans font-semibold px-3.5 py-1.5 rounded-xl shadow-xl border border-white/5 select-none relative whitespace-nowrap animate-in fade-in slide-in-from-right-3 duration-300">
              Need help? Ask AI
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-2.5 bg-jade-deep rotate-45" />
            </div>
          )}
          
          {/* Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-jade-deep hover:bg-primary text-white flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer relative overflow-hidden group"
          >
            {/* Ripple overlay */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare className="w-6 h-6 text-white animate-pulse" />
          </button>
        </div>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="w-[330px] sm:w-[380px] h-[500px] bg-white border border-outline/25 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-jade-deep text-white px-4 py-3.5 flex justify-between items-center border-b border-outline/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                <img 
                  src="/New Jade AI.png" 
                  alt="Jade" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-serif italic text-sm font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Jade Assistant
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                  <span className="font-mono text-[8px] uppercase tracking-wider text-white/60">Online & Grounded</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfa] custom-scrollbar select-text">
            {messages.map(msg => {
              const isBot = msg.role === 'model';
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-2 max-w-[85%] items-end",
                    isBot ? "self-start mr-auto" : "self-end ml-auto flex-row-reverse"
                  )}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center border border-primary/15">
                      <img 
                        src="/New Jade AI.png" 
                        alt="Jade" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div 
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-xs font-sans leading-relaxed shadow-sm",
                      isBot 
                        ? "bg-white text-on-surface border border-outline/10 rounded-bl-none" 
                        : "bg-primary text-white rounded-br-none"
                    )}
                  >
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-2 max-w-[85%] items-end mr-auto">
                <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center border border-primary/15">
                  <img 
                    src="/New Jade AI.png" 
                    alt="Jade" 
                    className="w-full h-full object-cover animate-pulse"
                  />
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-white border border-outline/10 px-4 py-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-b border-red-100 text-[10.5px] text-red-700 flex items-center gap-1.5 shrink-0 leading-normal animate-fade-in select-none">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Session Limit Banner */}
          {queryCount >= MAX_QUERIES && (
            <div className="px-4 py-2 bg-amber-50 border-t border-b border-amber-100 text-[9.5px] text-amber-700 font-sans tracking-wide flex items-center gap-1.5 shrink-0 select-none">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>Limit reached. Refresh the page to reset, or contact us!</span>
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-outline/15 flex gap-2 items-center bg-white shrink-0 select-none">
            <input
              type="text"
              required
              disabled={loading || queryCount >= MAX_QUERIES}
              maxLength={300}
              placeholder={queryCount >= MAX_QUERIES ? "Limit reached. Refresh to reset..." : "Ask Jade something... (Max 300 chars)"}
              className="flex-1 bg-surface-muted border border-outline/25 rounded-xl px-4 py-2.5 text-xs font-sans outline-none focus:border-primary focus:bg-white transition-all disabled:opacity-55 disabled:cursor-not-allowed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || queryCount >= MAX_QUERIES}
              className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-light text-white flex items-center justify-center shadow transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
