import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Plus, Users, AlertTriangle, FileText, ArrowLeft, GraduationCap, Video, BookOpen, Award, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

export const FacultyDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Faculty Header */}
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
              FACULTY PORTAL
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user ? user.name : 'Prof. David Miller'}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={logout} className="gap-1 text-xs text-rose-400">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Faculty Assessment Management</h1>
            <p className="text-slate-400 text-sm">Create examinations, build item bank questions, assign candidates, and publish results.</p>
          </div>

          <Link to="/faculty/exams/create">
            <Button variant="glow" size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create New Examination
            </Button>
          </Link>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link to="/faculty/questions">
            <Card className="glass-panel p-6 rounded-2xl space-y-3 hover:border-sky-500/50 transition-all">
              <div className="p-3 rounded-xl bg-sky-500/10 w-fit">
                <BookOpen className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Question Bank</h3>
              <p className="text-xs text-slate-400">Create, edit, search, and manage MCQ Single, MCQ Multi, and True/False questions.</p>
            </Card>
          </Link>

          <Link to="/faculty/exams">
            <Card className="glass-panel p-6 rounded-2xl space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="p-3 rounded-xl bg-emerald-500/10 w-fit">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Exam Management</h3>
              <p className="text-xs text-slate-400">View created assessments, configure time windows, select questions, and assign candidates.</p>
            </Card>
          </Link>

          <Link to="/faculty/results">
            <Card className="glass-panel p-6 rounded-2xl space-y-3 hover:border-cyan-500/50 transition-all">
              <div className="p-3 rounded-xl bg-cyan-500/10 w-fit">
                <Award className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Results & Reports</h3>
              <p className="text-xs text-slate-400">View candidate score rosters, percentage, pass/fail status, and toggle result publication.</p>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};
