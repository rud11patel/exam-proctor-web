import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BookOpen, Clock, Calendar, CheckCircle2, Video, AlertCircle, ArrowLeft, Play, User, Award, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Student Portal Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-white">
                Proctor<span className="text-sky-400">AI</span>
              </span>
            </Link>
            <Badge variant="glow" className="text-xs">
              STUDENT PORTAL
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>{user ? user.name : 'Alex Rivera'}</span>
            </div>
            <Link to="/student/exams">
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" /> My Exams
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={logout} className="gap-1 text-xs text-rose-400">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="glass-panel-glow border-sky-500/30 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="py-0.5">AUTHENTICATED CANDIDATE</Badge>
              <span className="text-xs font-mono text-slate-400">INSTITUTION ENROLLED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome Back, {user ? user.name : 'Alex Rivera'}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Access active examination windows, check system readiness, and inspect evaluated score reports.
            </p>
          </div>

          <Link to="/student/exams">
            <Button size="lg" variant="glow" className="gap-2 shrink-0">
              <Play className="w-4 h-4 fill-white" />
              View Assigned Exams
            </Button>
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/student/exams">
            <Card className="glass-card p-6 rounded-2xl space-y-2 hover:border-sky-500/40">
              <BookOpen className="w-6 h-6 text-sky-400" />
              <h3 className="font-bold text-white text-base">Active & Scheduled Exams</h3>
              <p className="text-xs text-slate-400">View tests available to take in your current time window.</p>
            </Card>
          </Link>

          <Link to="/student/exams">
            <Card className="glass-card p-6 rounded-2xl space-y-2 hover:border-emerald-500/40">
              <Award className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Results & Grade Analytics</h3>
              <p className="text-xs text-slate-400">Inspect published exam scores, percentages, and performance breakdowns.</p>
            </Card>
          </Link>

          <Card className="glass-card p-6 rounded-2xl space-y-2">
            <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-white text-base">System Readiness Diagnostics</h3>
            <p className="text-xs text-slate-400">Hardware verification: Webcam 1080p OK, Mic Calibrated, Kiosk Mode Enforced.</p>
          </Card>
        </div>
      </main>
    </div>
  );
};
