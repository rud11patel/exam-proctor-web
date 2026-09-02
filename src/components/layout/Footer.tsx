import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, Globe, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Proctor<span className="text-sky-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The next-generation AI online examination and remote proctoring infrastructure. Delivering uncompromising exam integrity, automated candidate monitoring, and real-time risk analytics.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Badge variant="glow" className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                System Status: 100% Operational
              </Badge>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Product Capabilities
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#ai-proctoring" className="hover:text-sky-400 transition-colors">
                  AI Face Verification
                </a>
              </li>
              <li>
                <a href="#ai-proctoring" className="hover:text-sky-400 transition-colors">
                  Real-time Gaze Tracking
                </a>
              </li>
              <li>
                <a href="#ai-proctoring" className="hover:text-sky-400 transition-colors">
                  Secondary Device Detection
                </a>
              </li>
              <li>
                <a href="#ai-proctoring" className="hover:text-sky-400 transition-colors">
                  Voice & Audio Spectrum
                </a>
              </li>
              <li>
                <a href="#ai-proctoring" className="hover:text-sky-400 transition-colors">
                  Kiosk Lockdown Browser
                </a>
              </li>
            </ul>
          </div>

          {/* Nav & Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Portals & Roles
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/student" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/faculty" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  Faculty Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  Institutional Admin
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-400 transition-colors">
                  Portal Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-sky-400 transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Security & Compliance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                256-Bit TLS Encryption
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                GDPR & FERPA Compliant
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                ISO 27001 Certified
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ProctorAI Engine Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">
              Terms of Assessment
            </a>
            <a href="#security" className="hover:text-slate-400 transition-colors">
              Security Architecture
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
