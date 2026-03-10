import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const scrollTo = (id) => {
    setOpen(false);
    if (pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-900/95 backdrop-blur-sm border-b border-primary-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">Garcia Capital</div>
              <div className="text-primary-400 text-xs leading-none">Private Real Estate</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('opportunities')} className="text-primary-300 hover:text-white text-sm font-medium transition-colors">
              Opportunities
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="text-primary-300 hover:text-white text-sm font-medium transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollTo('about')} className="text-primary-300 hover:text-white text-sm font-medium transition-colors">
              About Isaac
            </button>
            <button onClick={() => scrollTo('join')} className="btn-primary text-sm py-2 px-4">
              Join Investor List
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-primary-300 hover:text-white p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-primary-800 py-4 flex flex-col gap-4">
            <button onClick={() => scrollTo('opportunities')} className="text-primary-300 hover:text-white text-sm font-medium text-left transition-colors">
              Opportunities
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="text-primary-300 hover:text-white text-sm font-medium text-left transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollTo('about')} className="text-primary-300 hover:text-white text-sm font-medium text-left transition-colors">
              About Isaac
            </button>
            <button onClick={() => scrollTo('join')} className="btn-primary text-sm py-2">
              Join Investor List
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
