import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Clock, ArrowLeft, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExamResult } from '@/types';
import { resultService } from '@/services/resultService';

export const StudentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      if (!attemptId) {
        setIsLoading(false);
        setErrorMsg('Attempt ID missing');
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await resultService.getAttemptResult(attemptId);
        if (res) {
          setResult(res);
        } else {
          setErrorMsg('Result record not found on backend database');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to retrieve result from backend database');
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span>Evaluating examination result from backend database...</span>
      </div>
    );
  }

  if (errorMsg || !result) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-400 space-y-4">
        <h2 className="text-xl text-white font-bold">{errorMsg || 'Result Record Not Found'}</h2>
        <Link to="/student/exams">
          <Button variant="outline">Return to My Exams</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      <div>
        <Link to="/student/exams">
          <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> My Exams
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="glow">OFFICIAL ASSESSMENT REPORT</Badge>
          <Badge variant="success">CONFIRMED EVALUATION</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{result.examTitle || 'Proctored Examination'}</h1>
      </div>

      {/* Main Score Banner */}
      <Card className="glass-panel-glow border-sky-500/40 p-8 rounded-3xl text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800">
          {result.isPassed ? (
            <Award className="w-12 h-12 text-emerald-400 animate-bounce" />
          ) : (
            <XCircle className="w-12 h-12 text-rose-400" />
          )}
        </div>

        <div>
          <span className="text-xs font-mono text-slate-400 uppercase">FINAL EVALUATED SCORE</span>
          <div className="text-5xl font-extrabold text-white mt-1">
            {result.totalScore} <span className="text-2xl text-slate-400">/ {result.maxScore}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Badge variant="glow" className="text-sm px-3 py-1 font-mono">
            {result.percentage}% PERCENTAGE
          </Badge>
          {result.isPassed ? (
            <Badge variant="success" className="text-sm px-3 py-1 font-mono">
              PASSED
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-sm px-3 py-1 font-mono">
              FAILED
            </Badge>
          )}
        </div>

        <p className="text-xs text-slate-400 font-mono pt-2">
          Calculated At: {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'N/A'}
        </p>
      </Card>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto font-mono text-xs">
        <Card className="glass-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-slate-400">CORRECT ANSWERS</span>
          <div className="text-2xl font-bold text-emerald-400">{result.correctAnswers ?? 0}</div>
        </Card>

        <Card className="glass-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-slate-400">INCORRECT ANSWERS</span>
          <div className="text-2xl font-bold text-rose-400">{result.incorrectAnswers ?? 0}</div>
        </Card>

        <Card className="glass-card p-4 rounded-2xl text-center space-y-1">
          <span className="text-slate-400">UNANSWERED</span>
          <div className="text-2xl font-bold text-amber-400">{result.unanswered ?? 0}</div>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Link to="/student/exams">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to My Exams Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
