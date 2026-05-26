import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-primary text-white py-16">
      <div className="mx-auto grid max-w-container-max grid-cols-1 gap-12 px-gutter md:grid-cols-4">
        <div className="flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/puyoko-logo.png" alt="PUYOKO Logo" className="h-10 w-10 object-contain brightness-0 invert" />
            <span className="font-display text-xl font-bold text-white">PUYOKO</span>
          </Link>
          <p className="font-sans text-sm leading-relaxed text-white/70">
            Built with Heritage, Rooted in Cebu. Defining the next century of Filipino architectural excellence through premium property curation.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/puyophilippines" target="_blank" rel="noopener noreferrer">
              <Facebook className="h-5 w-5 text-white/50 hover:text-white transition-colors cursor-pointer" />
            </a>
            <a href="https://instagram.com/puyoko_official" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5 text-white/50 hover:text-white transition-colors cursor-pointer" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5 text-white/50 hover:text-white transition-colors cursor-pointer" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-primary-light">Quick Links</h4>
          <ul className="flex flex-col gap-3 font-sans text-sm text-white/70">
            <li><Link to="/properties" className="transition-colors hover:text-white">Browse Estates</Link></li>
            <li><Link to="/sell" className="transition-colors hover:text-white">Sell Your Property</Link></li>
            <li><Link to="/about" className="transition-colors hover:text-white">Our Origin</Link></li>
            <li><Link to="/about/services" className="transition-colors hover:text-white">Our Services</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-white">Agent Portal</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-primary-light">Contact Info</h4>
          <ul className="flex flex-col gap-4 font-sans text-sm text-white/70">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary-light" />
              <span>+63 994 204 1835</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary-light" />
              <span>+63 991 318 9665</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary-light" />
              <a href="mailto:puyokooffcl@gmail.com" className="transition-colors hover:text-white">puyokooffcl@gmail.com</a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-primary-light">Legal</h4>
          <ul className="flex flex-col gap-3 font-sans text-sm text-white/70">
            <li><Link to="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
