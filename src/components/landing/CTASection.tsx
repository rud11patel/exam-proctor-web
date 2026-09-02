import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export const CTASection: React.FC = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDemoSubmitted(true);
  };

  return (
    <section className="py-24 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-panel-glow border-sky-500/40 rounded-3xl p-8 sm:p-14 text-center space-y-8 relative">
          <div className="inline-flex">
            <Badge variant="glow" className="px-4 py-1.5 gap-2 text-xs font-semibold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Ready for Uncompromising Assessment Integrity?</span>
            </Badge>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Elevate Your Exam Security with <span className="text-sky-400">ProctorAI</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Deploy automated AI proctoring across your university or institution in minutes. Zero student software installation required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="glow" className="w-full sm:w-auto gap-2">
                <ShieldCheck className="w-5 h-5" />
                Get Started Free
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setDemoSubmitted(false);
                setDemoOpen(true);
              }}
              className="w-full sm:w-auto gap-2"
            >
              <span>Schedule Institutional Demo</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 14-Day Institutional Trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" /> WebAssembly Local AI Engine
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 24/7 Dedicated Support
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Demo Request Modal Dialog */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              Schedule Institutional Demo
            </DialogTitle>
            <DialogDescription>
              Experience our AI proctoring suite live with an institutional assessment expert.
            </DialogDescription>
          </DialogHeader>

          {demoSubmitted ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="font-bold text-lg text-white">Demo Request Received!</h4>
              <p className="text-xs text-slate-300">
                An assessment specialist will reach out to <span className="text-sky-400">{email}</span> within 24 hours to schedule your sandbox demo.
              </p>
              <Button size="sm" variant="outline" onClick={() => setDemoOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleDemoSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Institutional Email
                </label>
                <Input
                  type="email"
                  placeholder="university.admin@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Institution / Organization Name
                </label>
                <Input type="text" placeholder="State Technological University" required />
              </div>
              <Button type="submit" variant="glow" className="w-full justify-center">
                Submit Request
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
