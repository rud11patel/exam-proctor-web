import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AdminAuditLogs: React.FC = () => {
  const logs = [
    { timestamp: new Date().toLocaleString(), event: 'Exam Created', user: 'Prof. David Miller', details: 'Created CS-401 Midterm' },
    { timestamp: new Date(Date.now() - 3600000).toLocaleString(), event: 'Student Submission', user: 'Alex Rivera', details: 'Submitted CS-401 Midterm Attempt' },
    { timestamp: new Date(Date.now() - 7200000).toLocaleString(), event: 'Security Verification', user: 'System Engine', details: 'Validated hardware integrity & kiosk mode' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <Link to="/admin">
            <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Audit & Compliance Logs</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Cryptographically logged events and system transactions.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border-slate-800 p-4 space-y-3">
        {logs.map((log, i) => (
          <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between text-xs font-mono">
            <div>
              <span className="text-sky-400 font-bold mr-2">[{log.event}]</span>
              <span className="text-white">{log.details}</span>
              <span className="text-slate-500 ml-2">({log.user})</span>
            </div>
            <span className="text-slate-400">{log.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
