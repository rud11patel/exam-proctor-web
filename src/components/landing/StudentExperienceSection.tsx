import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Video, Mic, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const StudentExperienceSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="px-3.5 py-1 text-emerald-400 border-emerald-500/30">
            Distraction-Free Candidate Interface
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Student Focus & Confidence
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Proctoring should protect integrity without creating candidate anxiety. Our clean, non-intrusive test environment keeps students focused on doing their best work.
          </p>
        </div>

        {/* Mock Exam Window Container */}
        <div className="glass-panel-glow border-slate-800 rounded-3xl p-3 sm:p-6 space-y-4 shadow-2xl">
          {/* Mock Window Title bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-2">
                EXAM SECURE KIOSK — CS-401: Advanced Data Structures & Algorithms
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-emerald-400">
                <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>TIME REMAINING: 01:24:45</span>
              </div>
              <Badge variant="glow" className="gap-1.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                AI GUARDIAN ACTIVE
              </Badge>
            </div>
          </div>

          {/* Main Mock Test Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Question Pane */}
            <div className="lg:col-span-8 bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-sky-400 uppercase font-semibold">
                    Question 14 of 40 • Single Choice
                  </span>
                  <h3 className="text-base font-bold text-white">
                    What is the worst-case time complexity of balancing an AVL tree after insertion?
                  </h3>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  4 Marks
                </Badge>
              </div>

              {/* Radio Options */}
              <div className="space-y-3">
                {[
                  { key: 'A', text: 'O(log N) — Single or double rotation is sufficient at ancestor nodes', selected: true },
                  { key: 'B', text: 'O(N) — Traversal required across all subtree nodes', selected: false },
                  { key: 'C', text: 'O(N log N) — Re-indexing all node heights recursively', selected: false },
                  { key: 'D', text: 'O(1) — Instant lookup using hash index pointers', selected: false },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      opt.selected
                        ? 'bg-sky-950/40 border-sky-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          opt.selected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.key}
                      </div>
                      <span className="text-sm font-medium">{opt.text}</span>
                    </div>
                    {opt.selected && <CheckCircle2 className="w-5 h-5 text-sky-400" />}
                  </div>
                ))}
              </div>

              {/* Bottom Nav Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">
                    Mark for Review
                  </Button>
                  <Button variant="default" size="sm" className="gap-1">
                    Save & Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Camera Feed & System Health Pane */}
            <div className="lg:col-span-4 space-y-4">
              {/* Webcam Widget */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    CANDIDATE FEED
                  </span>
                  <span className="text-slate-400">1080p FPS: 30</span>
                </div>

                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <Video className="w-10 h-10 text-slate-600" />
                  <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 border border-sky-900">
                    AI VISION: STABLE
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                    GAZE: CENTERED
                  </div>
                </div>
              </div>

              {/* System Checks Bar */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div className="font-mono text-slate-400 font-semibold mb-1">
                  HARDWARE & KIOSK STATUS
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-emerald-400" /> Webcam Feed
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">NORMAL</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" /> Mic Noise
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">CALIBRATED</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-sky-400" /> Tab Lockdown
                  </span>
                  <span className="font-mono text-sky-400 font-bold">ENFORCED</span>
                </div>
              </div>

              {/* Student Portal Preview Button */}
              <Link to="/student">
                <Button variant="outline" className="w-full justify-between mt-2">
                  <span>Explore Student Portal View</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
