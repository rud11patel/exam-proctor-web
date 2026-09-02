import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Search, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { API_CONFIG } from '@/config/api';
import { ApiClient } from '@/services/apiClient';

interface CandidateScore {
  id: string;
  student_name: string;
  student_email: string;
  roll_number?: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  is_passed: boolean;
  calculated_at: string;
}

export const FacultyResults: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateScore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadResults = async () => {
    setIsLoading(true);
    // Fetch exams first
    const examsRes = await ApiClient.request<{ exams: any[] }>('/exams');
    if (examsRes.success && examsRes.data?.exams && examsRes.data.exams.length > 0) {
      const examId = examsRes.data.exams[0].id;
      const resRes = await ApiClient.request<{ results: CandidateScore[] }>(`/results/faculty/exams/${examId}/results`);
      if (resRes.success && resRes.data?.results) {
        setCandidates(resRes.data.results);
      }
    } else {
      // Fallback
      setCandidates([
        {
          id: '1',
          student_name: 'Alex Rivera',
          student_email: 'student@university.edu',
          roll_number: 'CS2026-089',
          total_marks: 10,
          obtained_marks: 8,
          percentage: 80,
          is_passed: true,
          calculated_at: new Date().toISOString(),
        },
      ]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleDownloadCsv = () => {
    window.open(`${API_CONFIG.BASE_URL}/analytics/exams/sample-exam-id/export-csv`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6 print:bg-white print:text-black">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900 print:hidden">
        <div>
          <Link to="/faculty">
            <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Faculty Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Candidate Score Roster & Reports</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Inspect evaluated examination results, export CSV files, and generate printable reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-xs">
            <Printer className="w-4 h-4" /> Printable Report
          </Button>
          <Button variant="glow" size="sm" onClick={handleDownloadCsv} className="gap-2 text-xs">
            <Download className="w-4 h-4" /> Export CSV Roster
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold">Institutional Examination Performance Report</h1>
        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Roster Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden print:border-gray-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase border-b border-slate-800 print:bg-gray-100 print:text-gray-800">
              <tr>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Score</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-white print:text-black">{c.student_name}</td>
                  <td className="p-4 font-mono text-slate-400 print:text-gray-700">{c.student_email}</td>
                  <td className="p-4 text-slate-300 print:text-black">{c.roll_number || 'N/A'}</td>
                  <td className="p-4 font-bold font-mono text-sky-400 print:text-black">
                    {c.obtained_marks} / {c.total_marks}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400 print:text-black">
                    {c.percentage}%
                  </td>
                  <td className="p-4">
                    <Badge variant={c.is_passed ? 'success' : 'destructive'}>
                      {c.is_passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-400 print:text-gray-600">
                    {new Date(c.calculated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
