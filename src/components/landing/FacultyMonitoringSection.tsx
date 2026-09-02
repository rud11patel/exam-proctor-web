import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, ShieldCheck, Play, ArrowRight, Eye, RefreshCw, Bell, Ban, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const FacultyMonitoringSection: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(1);

  const candidates = [
    {
      id: 1,
      name: 'Alex Rivera',
      roll: 'CS2026-089',
      risk: 12,
      status: 'Normal',
      badgeVariant: 'success' as const,
      flag: 'None',
      time: '01:14:02',
    },
    {
      id: 2,
      name: 'Sophia Patel',
      roll: 'CS2026-104',
      risk: 78,
      status: 'High Risk',
      badgeVariant: 'destructive' as const,
      flag: 'Secondary Face Detected',
      time: '00:42:15',
    },
    {
      id: 3,
      name: 'Marcus Chen',
      roll: 'CS2026-042',
      risk: 45,
      status: 'Warning',
      badgeVariant: 'warning' as const,
      flag: 'Tab Blur (2x)',
      time: '00:58:30',
    },
    {
      id: 4,
      name: 'Emma Watson',
      roll: 'CS2026-112',
      risk: 4,
      status: 'Normal',
      badgeVariant: 'success' as const,
      flag: 'None',
      time: '01:20:00',
    },
  ];

  return (
    <section className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <Badge variant="glow" className="px-3.5 py-1 text-sky-400">
            Command & Control Dashboard
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Real-Time Live Candidate Proctoring Matrix
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Empower faculty with live video matrix monitoring, automated candidate risk ranking, instant incident playback, and one-click remote interventions.
          </p>
        </div>

        {/* Dashboard Preview Shell */}
        <div className="glass-panel-glow border-slate-800 rounded-3xl p-4 sm:p-6 space-y-6">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/30">
                <Users className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Live Proctoring Room #108</h3>
                <p className="text-xs font-mono text-slate-400">
                  CS-401 Midterm • 142 Active Candidates • 3 Flagged
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="glow" className="font-mono text-xs py-1">
                <RefreshCw className="w-3 h-3 text-sky-400 animate-spin mr-1" />
                STREAM LATENCY: 85ms
              </Badge>
              <Link to="/faculty">
                <Button size="sm" variant="default" className="gap-1.5">
                  Open Full Faculty Portal
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Candidate Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {candidates.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCandidate(c.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedCandidate === c.id
                    ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden mb-3 border border-slate-800 flex items-center justify-center">
                  <div className="text-slate-600 font-mono text-xs">VIDEO FEED #{c.id}</div>
                  <div className="absolute top-2 left-2">
                    <Badge variant={c.badgeVariant} className="text-[10px] py-0">
                      {c.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    RISK: {c.risk}%
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{c.name}</h4>
                    <p className="text-[11px] font-mono text-slate-400">{c.roll}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {c.time}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Selected Candidate Incident Panel */}
          <Card className="bg-slate-950 border-slate-800 p-6 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={candidates[selectedCandidate - 1].badgeVariant}>
                    SELECTED: {candidates[selectedCandidate - 1].name}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {candidates[selectedCandidate - 1].roll}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Calculated Integrity Risk:</span>
                    <span
                      className={`font-mono font-bold ${
                        candidates[selectedCandidate - 1].risk > 50
                          ? 'text-rose-400'
                          : candidates[selectedCandidate - 1].risk > 20
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {candidates[selectedCandidate - 1].risk}% (
                      {candidates[selectedCandidate - 1].status})
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        candidates[selectedCandidate - 1].risk > 50
                          ? 'bg-rose-500'
                          : candidates[selectedCandidate - 1].risk > 20
                          ? 'bg-amber-500'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${candidates[selectedCandidate - 1].risk}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-300">Latest Anomaly Flag:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {candidates[selectedCandidate - 1].flag}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-2">
                <Button size="sm" variant="outline" className="justify-center gap-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  Send Warning Pop-up
                </Button>
                <Button size="sm" variant="secondary" className="justify-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  Play Incident Clip
                </Button>
                <Button size="sm" variant="danger" className="justify-center gap-2">
                  <Ban className="w-4 h-4" />
                  Terminate Session
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
