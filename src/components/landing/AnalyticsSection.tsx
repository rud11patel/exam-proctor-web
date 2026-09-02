import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Award, CheckCircle2, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AnalyticsSection: React.FC = () => {
  return (
    <section id="analytics" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <Badge variant="glow" className="px-3.5 py-1 text-sky-400">
            Intelligent Analytics
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Data-Driven Integrity & Exam Performance Insights
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Transform raw proctoring telemetry into actionable institutional metrics, automated grade curve analysis, and risk breakdown reports.
          </p>
        </div>

        {/* Analytics Dashboard Grid Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Stat Card 1 */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-4 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/30">
                <Award className="w-5 h-5 text-sky-400" />
              </div>
              <Badge variant="success">+4.2% Integrity Score</Badge>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Average Institutional Trust Index</span>
              <div className="text-4xl font-extrabold text-white mt-1">98.4%</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculated across 45,000+ completed candidate exam sessions with zero false-positive invalidations.
            </p>
          </div>

          {/* Main Stat Card 2 */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-4 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <Badge variant="glow">Automated Grading</Badge>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Mean Assessment Duration</span>
              <div className="text-4xl font-extrabold text-white mt-1">52 Mins</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time response latency under 12ms per question submission to edge servers.
            </p>
          </div>

          {/* Main Stat Card 3 */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-4 border-slate-800">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                Real-Time Filtering
              </Badge>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Anomaly Incident Detection Rate</span>
              <div className="text-4xl font-extrabold text-white mt-1">99.8%</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-second AI vision identification for secondary persons, gaze shifts, and phone objects.
            </p>
          </div>

          {/* Visual Anomaly Distribution Breakdown */}
          <div className="lg:col-span-12 glass-panel-glow p-6 sm:p-8 rounded-3xl border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Proctoring Telemetry Anomaly Distribution</h3>
                <p className="text-xs font-mono text-slate-400">Institutional Aggregate • Last 30 Days</p>
              </div>
              <Badge variant="glow" className="font-mono text-xs">
                DATA ENGINE SYNCHRONIZED
              </Badge>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Normal Session (No Anomaly)', pct: 92, color: 'bg-emerald-400', count: '41,400 Exams' },
                { label: 'Gaze Shift / Looking Away Warning', pct: 5, color: 'bg-amber-400', count: '2,250 Flags' },
                { label: 'Browser Tab Switch / Blur Event', pct: 2.2, color: 'bg-cyan-400', count: '990 Flags' },
                { label: 'Secondary Person or Mobile Object Flagged', pct: 0.8, color: 'bg-rose-500', count: '360 Flags' },
              ].map((item, iIdx) => (
                <div key={iIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="font-mono text-slate-400">{item.pct}% ({item.count})</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
