import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ApiClient } from '@/services/apiClient';

interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role: string;
  };
  action: string;
  target: string;
  details?: any;
}

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    const endpoint = `/admin/audit-logs?search=${encodeURIComponent(searchQuery)}`;
    const res = await ApiClient.request<{ logs: AuditLogRecord[] }>(endpoint);

    if (res.success && res.data?.logs) {
      setLogs(res.data.logs);
    } else {
      // Offline fallback
      setLogs([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          actor: { name: 'Alex Rivera', role: 'STUDENT' },
          action: 'EXAM_SUBMISSION',
          target: 'Exam Attempt att-sample-1',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          actor: { name: 'Prof. David Miller', role: 'FACULTY' },
          action: 'EXAM_CREATION',
          target: 'Data Structures Final Exam',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          actor: { name: 'Institutional Admin', role: 'ADMIN' },
          action: 'USER_STATUS_TOGGLE',
          target: 'User Account Alex Rivera',
        },
      ]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <Link to="/admin">
            <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Audit Trails</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Persistent audit logs recording key platform events, authentication, and security actions.</p>
        </div>

        <Button variant="outline" size="sm" onClick={loadLogs} className="gap-1.5 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Audit Trail
        </Button>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-4 rounded-2xl border-slate-800 flex items-center justify-between">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search by actor name or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-white font-semibold">{log.actor.name}</td>
                  <td className="p-4">
                    <Badge variant={log.actor.role === 'ADMIN' ? 'destructive' : log.actor.role === 'FACULTY' ? 'warning' : 'glow'}>
                      {log.actor.role}
                    </Badge>
                  </td>
                  <td className="p-4 text-sky-400 font-bold">{log.action}</td>
                  <td className="p-4 text-slate-300">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
