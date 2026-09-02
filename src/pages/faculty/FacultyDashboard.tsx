import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, Clock, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiClient } from '@/services/apiClient';

interface FacultyStats {
  totalExams: number;
  activeExams: number;
  upcomingExams: number;
  completedExams: number;
  totalCandidates: number;
  averagePerformance: number;
}

export const FacultyDashboard: React.FC = () => {
  const [stats, setStats] = useState<FacultyStats>({
    totalExams: 1,
    activeExams: 1,
    upcomingExams: 0,
    completedExams: 0,
    totalCandidates: 1,
    averagePerformance: 80.0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ApiClient.request<{ stats: FacultyStats }>('/analytics/faculty/dashboard').then((res) => {
      if (res.success && res.data?.stats) {
        setStats(res.data.stats);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="glow" className="text-xs">FACULTY ASSESSMENT PORTAL</Badge>
            <span className="text-xs text-slate-500 font-mono">ONLINE PLATFORM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Faculty Control Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage question banks, build examinations, assign candidates, and inspect candidate performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/faculty/questions">
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" /> Question Bank
            </Button>
          </Link>
          <Link to="/faculty/exams/create">
            <Button variant="glow" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Create New Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TOTAL EXAMINATIONS</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
            {stats.totalExams}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {stats.activeExams} Active & {stats.upcomingExams} Published
          </p>
        </Card>

        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">ASSIGNED CANDIDATES</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
            {stats.totalCandidates}
          </div>
          <p className="text-xs text-slate-400 mt-1">Enrolled across departments</p>
        </Card>

        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">AVERAGE SCORE</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-3 font-mono">
            {stats.averagePerformance}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Overall candidate pass rate</p>
        </Card>

        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">COMPLETED EXAMS</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
            {stats.completedExams}
          </div>
          <p className="text-xs text-slate-400 mt-1">Evaluated examinations</p>
        </Card>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel p-6 border-slate-800 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Question Bank Repository</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Create, edit, and filter multiple choice questions with subject tags, difficulty levels, and explanation keys.
            </p>
          </div>
          <Link to="/faculty/questions" className="mt-6">
            <Button size="sm" variant="outline" className="w-full justify-between group">
              <span>Manage Questions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-panel p-6 border-slate-800 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Exam Builder</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Assemble examinations, set duration, negative marking rules, question randomization, and candidate rosters.
            </p>
          </div>
          <Link to="/faculty/exams/create" className="mt-6">
            <Button size="sm" variant="glow" className="w-full justify-between group">
              <span>Build Examination</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-panel p-6 border-slate-800 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Results & Analytics</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Inspect candidate score rosters, release results, analyze question accuracy metrics, and export CSV reports.
            </p>
          </div>
          <Link to="/faculty/results" className="mt-6">
            <Button size="sm" variant="outline" className="w-full justify-between group">
              <span>View Roster & CSV Export</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
