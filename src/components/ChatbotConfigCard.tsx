import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bot, Check, AlertCircle, Loader2 } from 'lucide-react';

export const ChatbotConfigCard: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load chatbot settings from database
  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setIsEnabled(data.is_enabled);
        setSystemPrompt(data.system_prompt);
        setKnowledgeBase(data.knowledge_base);
      }
    } catch (err: any) {
      console.error('Failed to load chatbot settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({
          id: 1,
          is_enabled: isEnabled,
          system_prompt: systemPrompt.trim(),
          knowledge_base: knowledgeBase.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Chatbot configuration saved successfully.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save chatbot settings:', err);
      setMessage({ type: 'error', text: `Failed to save: ${err.message || 'Unknown error'}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-outline/25 rounded-2xl p-6 shadow-sm flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="font-mono text-xs uppercase tracking-wider text-outline ml-2.5">
          Loading chatbot configuration...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-outline/25 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      {/* Decorative Blur Background Element */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12" />

      <div className="flex items-center gap-2 mb-4 border-b border-outline/10 pb-3">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-display text-sm font-bold text-primary uppercase tracking-wider">
          Gemini AI Chatbot Configuration
        </h3>
      </div>

      <p className="font-sans text-xs text-on-surface-variant mb-5 leading-relaxed">
        Customize instructions and knowledge facts for your virtual assistant **Jade**. The AI is protected by safety guardrails to prevent credentials/password disclosure.
      </p>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between bg-surface-muted/50 p-4 rounded-xl border border-outline/15 select-none">
          <div>
            <span className="block font-sans text-xs font-bold text-primary">Enable Public Assistant</span>
            <span className="block font-mono text-[9px] text-on-surface-variant/70 uppercase tracking-wider mt-0.5">
              Toggles the floating chat bubble widget on the website.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 outline-none cursor-pointer flex items-center ${
              isEnabled ? 'bg-primary justify-end' : 'bg-outline-variant/60 justify-start'
            }`}
            aria-label="Toggle chatbot enabled status"
          >
            <span className="w-4.5 h-4.5 bg-white rounded-full shadow-sm" />
          </button>
        </div>

        {/* System Prompt Customization */}
        <div className="space-y-1.5">
          <label className="block text-[9.5px] font-mono uppercase tracking-widest text-on-surface-variant/85 font-bold">
            Virtual Assistant Personality & Core Prompt
          </label>
          <p className="text-[10px] text-on-surface-variant/60 italic leading-relaxed">
            Instruct the assistant on how to respond, its tone (e.g. friendly, formal), and general boundaries.
          </p>
          <textarea
            required
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-[#f8faf8] border border-outline/35 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs font-sans leading-relaxed"
            placeholder="e.g. You are Jade, Puyoko's virtual assistant. Your tone is friendly and helpful. Guide clients to book viewings..."
          />
        </div>

        {/* Custom Knowledge Base & FAQ overrides */}
        <div className="space-y-1.5">
          <label className="block text-[9.5px] font-mono uppercase tracking-widest text-on-surface-variant/85 font-bold">
            Custom Knowledge Base & FAQs
          </label>
          <p className="text-[10px] text-on-surface-variant/60 italic leading-relaxed">
            Provide special business details (e.g. company info, pricing promos, agent names, office location). Active property listings are appended automatically.
          </p>
          <textarea
            required
            rows={5}
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            className="w-full bg-[#f8faf8] border border-outline/35 text-on-surface px-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs font-sans leading-relaxed"
            placeholder="e.g. Puyoko Main Office is at Talamban, Cebu City. Standard reservation fees are ₱20,000..."
          />
        </div>

        {/* Actions & Notifications */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-outline/10">
          <div className="w-full sm:flex-1">
            {message && (
              <div className={`p-3 rounded-xl border flex items-start gap-2 text-[10.5px] leading-relaxed animate-fade-in ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {message.type === 'success' ? <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white font-sans text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Configuration...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" /> Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
