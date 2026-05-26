import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Attempt Supabase auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    login();
    navigate('/properties');
  };

  return (
    <div className="min-h-screen bg-jade-deep flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 heritage-pattern opacity-10 pointer-events-none"></div>
      
      <div className="bg-white p-12 w-full max-w-md relative z-10 shadow-2xl rounded-2xl">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest focus:outline-none"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center mb-10 mt-4">
          <img src="/puyoko-logo.png" alt="PUYOKO" className="w-24 h-24 mx-auto mb-6 object-contain" />
          <h1 className="font-display text-4xl font-light text-primary tracking-widest uppercase">Admin <span className="italic-serif text-primary-light">Login</span></h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mt-2">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs font-mono p-4 mb-6 uppercase tracking-wider text-center rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-surface-muted border border-outline/30 text-on-surface px-4 py-3 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full bg-surface-muted border border-outline/30 text-on-surface px-4 py-3 pr-12 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-lg font-mono text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary-light transition-all disabled:opacity-50 mt-4 active:scale-95 shadow-md hover:shadow-lg"
          >
            {loading ? "Authenticating..." : "Access System"}
          </button>
        </form>
      </div>
    </div>
  );
};
