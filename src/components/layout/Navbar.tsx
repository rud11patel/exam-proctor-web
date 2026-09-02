import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ChevronRight, Lock, User, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'AI Proctoring', href: '#ai-proctoring' },
    { name: 'Security', href: '#security' },
    { name: 'Analytics', href: '#analytics' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = '/' + href;
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 py-3.5 shadow-2xl shadow-slate-950/50'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-sky-400 transition-colors">
                Proctor<span className="text-sky-400">AI</span>
              </span>
              <Badge variant="glow" className="text-[10px] px-1.5 py-0">
                v2.4
              </Badge>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              AI EXAM SECURITY
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 glass-panel px-4 py-1.5 rounded-full border-slate-800/80">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-full transition-all cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="default" size="sm" className="gap-1.5">
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 py-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2 text-base font-medium text-slate-200 hover:text-sky-400 hover:bg-slate-900/60 rounded-lg transition-colors"
              >
                {link.name}
              </button>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <div className="text-xs font-mono text-slate-400 px-3 uppercase tracking-wider mb-1">
                Portal Shortcuts
              </div>
              <div className="grid grid-cols-3 gap-2 px-1">
                <Link to="/student" onClick={() => setMobileMenuOpen(false)}>
                  <div className="p-2 bg-slate-900 rounded-lg text-center hover:border-sky-500/50 border border-slate-800">
                    <User className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-300 font-medium">Student</span>
                  </div>
                </Link>
                <Link to="/faculty" onClick={() => setMobileMenuOpen(false)}>
                  <div className="p-2 bg-slate-900 rounded-lg text-center hover:border-sky-500/50 border border-slate-800">
                    <GraduationCap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-300 font-medium">Faculty</span>
                  </div>
                </Link>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <div className="p-2 bg-slate-900 rounded-lg text-center hover:border-sky-500/50 border border-slate-800">
                    <Building2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-300 font-medium">Admin</span>
                  </div>
                </Link>
              </div>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mt-2">
                <Button variant="outline" className="w-full justify-center">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full justify-center">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
