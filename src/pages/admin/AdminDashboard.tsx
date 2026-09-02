import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, FileCheck, ShieldCheck, Activity, UserCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiClient } from '@/services/apiClient';

interface AdminStats {
  users: {
    total: number;
    students: number;
    faculty: number;
    admins: number;
    active: number;
  };
  totalExams: number;
  totalAttempts: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    users: { total: 3, students: 1, faculty: 1, admins: 1, active: 3 },
    totalExams: 1,
    totalAttempts: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    const res = await ApiClient.request<{ stats: AdminStats }>('/analytics/admin/dashboard');
    if (res.success && res.data?.stats) {
      setStats(res.data.stats);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="destructive" className="text-xs">SYSTEM ADMINISTRATION</Badge>
            <span className="text-xs text-slate-500 font-mono">INSTITUTION CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Admin Dashboard
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Platform overview, database user account management, security provisioning, and audit trails.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadStats} className="gap-1.5 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TOTAL ACCOUNTS</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
            {stats.users.total}
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> {stats.users.active} Active Database Accounts
          </p>
        </Card>

        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">STUDENTS / FACULTY</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
            {stats.users.students} / {stats.users.faculty}
          </div>
          <p className="text-xs text-slate-400 mt-1">Enrolled user roles</p>
        </Card>

        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">TOTAL EXAMS</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3 font-mono">
            {stats.totalExams}
          </div>
          <p className="text-xs text-slate-400 mt-1">Created assessment instances</p>
        </Card>

        <Card className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">EVALUATED ATTEMPTS</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-3 font-mono">
            {stats.totalAttempts}
          </div>
          <p className="text-xs text-slate-400 mt-1">Completed student attempts</p>
        </Card>
      </div>

      {/* Admin Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel p-6 border-slate-800 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">User Account Management</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Inspect database users, filter by role (Student, Faculty, Admin), search records, and activate or deactivate accounts.
            </p>
          </div>
          <Link to="/admin/users" className="mt-6">
            <Button size="sm" variant="glow" className="w-full justify-between group">
              <span>Manage User Roster</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>

        <Card className="glass-panel p-6 border-slate-800 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">System Audit Logs</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Review persistent system audit trails (login attempts, question creation, exam publication, user status toggles).
            </p>
          </div>
          <Link to="/admin/logs" className="mt-6">
            <Button size="sm" variant="outline" className="w-full justify-between group">
              <span>Inspect System Audit Logs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
