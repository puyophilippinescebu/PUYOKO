import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, User, LayoutGrid, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userEmail, displayName, updateDisplayName } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setEditingName(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setNameInput(displayName); }, [displayName]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) updateDisplayName(trimmed);
    setEditingName(false);
  };

  const adminLinks = [
    { name: 'Properties', path: '/admin/properties', icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f4] flex flex-col">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-50 w-full bg-jade-deep border-b border-white/10 shadow-md">
        <nav className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-3">
          {/* Logo + Admin Label */}
          <div className="flex items-center gap-4">
            <Link to="/admin/properties" className="flex items-center gap-3">
              <img src="/puyoko-logo.png" alt="PUYOKO" className="h-9 w-9 object-contain brightness-0 invert" />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-[0.2em] uppercase text-white leading-none">PUYOKO</span>
                <span className="font-mono text-[7px] tracking-[0.4em] text-primary-neon uppercase pt-0.5">Admin Portal</span>
              </div>
            </Link>
            <div className="hidden md:block h-6 w-px bg-white/20 mx-2" />
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {adminLinks.map(({ name, path, icon: Icon }) => (
                <Link
                  key={name}
                  to={path}
                  className={cn(
                    'flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all',
                    location.pathname.startsWith(path)
                      ? 'text-primary-neon'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Profile + View Public Site */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors border border-white/20 px-3 py-1.5 rounded-sm"
            >
              View Public Site ↗
            </a>

            {/* Profile dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => { setProfileOpen(o => !o); setEditingName(false); }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-2 sm:px-3 py-1.5 rounded-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary-neon" />
                <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-widest font-bold text-white">{displayName}</span>
              </button>

              {profileOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 z-[200] w-72 bg-white border border-outline/20 shadow-2xl rounded-lg overflow-hidden">
                  <div className="bg-jade-deep px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-neon/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-neon" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{displayName}</p>
                      <p className="text-white/50 font-mono text-[10px] truncate">{userEmail ?? 'admin@puyoko.com'}</p>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-b border-outline/10">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant mb-2">Display Name</p>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={nameInput}
                          onChange={e => setNameInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                          className="flex-1 border border-outline/30 rounded px-3 py-1.5 font-mono text-xs outline-none focus:border-primary"
                          maxLength={30}
                        />
                        <button onClick={handleSaveName} className="p-1.5 rounded bg-primary text-white hover:bg-primary-light">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingName(false); setNameInput(displayName); }} className="p-1.5 rounded bg-outline/10 text-on-surface-variant hover:bg-outline/20">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-sm font-medium text-on-surface">{displayName}</span>
                        <button onClick={() => setEditingName(true)} className="font-mono text-[9px] uppercase tracking-widest text-primary hover:underline">Edit</button>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3">
                    <button
                      onClick={() => { logout(); navigate('/login'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors py-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};
