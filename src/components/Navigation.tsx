import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, User, Check, X, Menu, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface NavSubLink {
  name: string;
  path: string;
}

interface NavLink {
  name: string;
  path: string;
  dropdown?: NavSubLink[];
}

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, userEmail, displayName, updateDisplayName } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  // Sync name input when displayName changes
  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(null);
  }, [location.pathname]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) updateDisplayName(trimmed);
    setEditingName(false);
  };

  const publicLinks: NavLink[] = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    {
      name: 'About Us',
      path: '/about',
      dropdown: [
        { name: 'Company Profile', path: '/about' },
        { name: 'Our Services', path: '/about/services' },
      ],
    },
    { name: 'Projects', path: '/projects' },
    {
      name: 'Media & Insights',
      path: '/media',
      dropdown: [
        { name: 'Blogs', path: '/media?tab=blogs' },
        { name: 'Expos & Events', path: '/media?tab=events' },
      ],
    },
    { name: 'Contact Us', path: '/contact' },
  ];

  const adminLinks: NavLink[] = [
    { name: 'Properties', path: '/properties' },
    { name: 'Projects', path: '/projects' },
    {
      name: 'Media & Insights',
      path: '/media',
      dropdown: [
        { name: 'Blogs', path: '/media?tab=blogs' },
        { name: 'Expos & Events', path: '/media?tab=events' },
      ],
    },
    {
      name: 'About Us',
      path: '/about',
      dropdown: [
        { name: 'Company Profile', path: '/about' },
        { name: 'Our Services', path: '/about/services' },
      ],
    },
  ];

  const navLinks = isAuthenticated ? adminLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline/30 bg-white/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-4 relative">
        <Link to="/" className="flex items-center gap-3">
          <img src="/puyoko-logo.png" alt="PUYOKO Logo" className="h-12 w-12 object-contain" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-[0.2em] uppercase text-primary leading-none">PUYOKO</span>
            <span className="font-mono text-[8px] tracking-[0.4em] text-primary-light uppercase pt-1">Premium Estates</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            if (link.dropdown) {
              const isAboutActive = link.name === 'About Us' && (location.pathname === '/about' || location.pathname === '/about/services');
              const isMediaActive = link.name === 'Media & Insights' && location.pathname === '/media';
              const isDropdownActive = isAboutActive || isMediaActive;
              return (
                <div key={link.name} className="relative group py-2">
                  <button
                    className={cn(
                      'flex items-center gap-1 font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer bg-transparent border-0 outline-none p-0',
                      isDropdownActive
                        ? 'text-primary border-b border-primary-light pb-1'
                        : 'text-on-surface-variant/70 hover:text-primary'
                    )}
                  >
                    {link.name}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180 text-on-surface-variant/70 group-hover:text-primary" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border border-outline/20 shadow-xl rounded-sm w-52 py-2.5 z-[100] animate-in fade-in slide-in-from-top-1 duration-200 before:absolute before:-top-3 before:left-0 before:w-full before:h-3 before:content-['']">
                    {link.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={cn(
                          'block px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest font-sans hover:bg-surface-muted hover:text-primary transition-colors',
                          location.pathname === subItem.path
                            ? 'text-primary bg-surface-muted border-l-2 border-primary-light'
                            : 'text-on-surface-variant/70'
                        )}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'font-sans text-xs font-bold uppercase tracking-widest transition-all',
                  location.pathname === link.path
                    ? 'text-primary border-b border-primary-light pb-1'
                    : 'text-on-surface-variant/70 hover:text-primary'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Section controls (Admin Badge, Sign Out, Hamburger Menu) */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div ref={dropdownRef} className="relative flex items-center gap-2 sm:gap-3 border-l border-outline/30 pl-3 sm:pl-6">
              {/* ADMIN Badge — click to open profile */}
              <button
                onClick={() => { setProfileOpen(o => !o); setEditingName(false); }}
                className="flex items-center gap-1.5 text-primary-neon bg-jade-deep px-2 sm:px-3 py-1.5 rounded-sm hover:opacity-80 transition-opacity"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-widest font-bold">{displayName}</span>
              </button>

              {/* Logout button */}
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="hidden sm:flex text-on-surface-variant hover:text-red-500 transition-colors active:scale-95 items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute top-[calc(100%+12px)] right-0 z-[200] w-72 bg-white border border-outline/20 shadow-2xl rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-jade-deep px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-neon/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-neon" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{displayName}</p>
                      <p className="text-white/50 font-mono text-[10px] truncate">{userEmail ?? 'admin@puyoko.com'}</p>
                    </div>
                  </div>

                  {/* Edit Display Name */}
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
                          placeholder="Enter name..."
                        />
                        <button
                          onClick={handleSaveName}
                          className="p-1.5 rounded bg-primary text-white hover:bg-primary-light transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setEditingName(false); setNameInput(displayName); }}
                          className="p-1.5 rounded bg-outline/10 text-on-surface-variant hover:bg-outline/20 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-sm font-medium text-on-surface">{displayName}</span>
                        <button
                          onClick={() => setEditingName(true)}
                          className="font-mono text-[9px] uppercase tracking-widest text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Logout */}
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
          )}

          {/* Hamburger Menu (Mobile Only) */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-outline/20 shadow-xl py-6 px-gutter z-[90] md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                if (link.dropdown) {
                  const isAboutActive = link.name === 'About Us' && (location.pathname === '/about' || location.pathname === '/about/services');
                  const isMediaActive = link.name === 'Media & Insights' && location.pathname === '/media';
                  const isDropdownActive = isAboutActive || isMediaActive;
                  const isDrawerOpen = mobileDropdownOpen === link.name;
                  
                  return (
                    <div key={link.name} className="flex flex-col gap-2">
                      <button
                        onClick={() => setMobileDropdownOpen(isDrawerOpen ? null : link.name)}
                        className={cn(
                          'flex items-center justify-between w-full font-sans text-xs font-bold uppercase tracking-widest py-2 text-left bg-transparent border-0 outline-none cursor-pointer',
                          isDropdownActive ? 'text-primary' : 'text-on-surface-variant/70'
                        )}
                      >
                        <span>{link.name}</span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 text-on-surface-variant/70", isDrawerOpen && "rotate-180")} />
                      </button>
                      {isDrawerOpen && (
                        <div className="flex flex-col gap-3 pl-4 border-l border-outline/20 mt-1 py-1">
                          {link.dropdown.map((subItem) => {
                            const isSubActive = location.pathname === subItem.path.split('?')[0] && (
                              !subItem.path.includes('tab=') || 
                              location.search.includes(subItem.path.split('?')[1])
                            );
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  'font-sans text-[10px] font-bold uppercase tracking-widest transition-all block',
                                  isSubActive ? 'text-primary font-black' : 'text-on-surface-variant/60'
                                )}
                              >
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'font-sans text-xs font-bold uppercase tracking-widest py-2 transition-all block',
                      location.pathname === link.path ? 'text-primary' : 'text-on-surface-variant/70'
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Mobile Admin Profile Section */}
              {isAuthenticated && (
                <div className="mt-4 pt-5 border-t border-outline/20 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-sans text-xs font-bold text-on-surface">{displayName}</span>
                        <span className="font-mono text-[8px] uppercase tracking-widest text-on-surface-variant/70">{userEmail ?? 'admin@puyoko.com'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); navigate('/login'); setMobileMenuOpen(false); }}
                      className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
