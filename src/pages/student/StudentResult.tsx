import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Clock, ArrowLeft, BookOpen, RefreshCw, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExamResult } from '@/types';
import { resultService } from '@/services/resultService';

export const StudentResult: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  // Single attempt state
  const [singleResult, setSingleResult] = useState<ExamResult | null>(null);

  // All results list state
  const [resultsList, setResultsList] = useState<ExamResult[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        if (attemptId) {
          // Mode A: Specific Attempt Detail View
          const res = await resultService.getAttemptResult(attemptId);
          if (res) {
            setSingleResult(res);
          } else {
            setErrorMsg('Result record not found on backend database');
          }
        } else {
          // Mode B: All Attempted Exams Results & Analytics Overview
          const list = await resultService.getStudentResults();
          setResultsList(list);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to retrieve results from backend database');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span>Loading verified performance results from PostgreSQL...</span>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: SPECIFIC ATTEMPT EVALUATION REPORT (When ?attemptId=... is present)
  // =========================================================================
  if (attemptId) {
    if (errorMsg || !singleResult) {
      return (
        <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <h2 className="text-xl text-white font-bold">{errorMsg || 'Result Record Not Found'}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSearchParams({})}>
              View All Results
            </Button>
            <Link to="/student/exams">
              <Button variant="glow">Return to My Exams</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
          <div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchParams({})}
              className="p-1 h-auto text-slate-400 hover:text-white mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> All Results & Analytics
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="glow">OFFICIAL ASSESSMENT REPORT</Badge>
              <Badge variant="success">CONFIRMED EVALUATION</Badge>
              {singleResult.attemptNumber && (
                <Badge variant="outline" className="font-mono">
                  ATTEMPT #{singleResult.attemptNumber}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {singleResult.examTitle || 'Proctored Examination'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/student/exams">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5" /> My Exams
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Score Banner */}
        <Card className="glass-panel-glow border-sky-500/40 p-8 rounded-3xl text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800">
            {singleResult.isPassed ? (
              <Award className="w-12 h-12 text-emerald-400 animate-bounce" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-400" />
            )}
          </div>

          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">EVALUATED ATTEMPT SCORE</span>
            <div className="text-5xl font-extrabold text-white mt-1">
              {singleResult.totalScore} <span className="text-2xl text-slate-400">/ {singleResult.maxScore}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Badge variant="glow" className="text-sm px-3 py-1 font-mono">
              {singleResult.percentage}% PERCENTAGE
            </Badge>
            {singleResult.isPassed ? (
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
            Submitted At: {singleResult.submittedAt ? new Date(singleResult.submittedAt).toLocaleString() : 'N/A'}
          </p>
        </Card>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto font-mono text-xs">
          <Card className="glass-card p-4 rounded-2xl text-center space-y-1">
            <span className="text-slate-400">CORRECT ANSWERS</span>
            <div className="text-2xl font-bold text-emerald-400">{singleResult.correctAnswers ?? 0}</div>
          </Card>

          <Card className="glass-card p-4 rounded-2xl text-center space-y-1">
            <span className="text-slate-400">INCORRECT ANSWERS</span>
            <div className="text-2xl font-bold text-rose-400">{singleResult.incorrectAnswers ?? 0}</div>
          </Card>

          <Card className="glass-card p-4 rounded-2xl text-center space-y-1">
            <span className="text-slate-400">UNANSWERED</span>
            <div className="text-2xl font-bold text-amber-400">{singleResult.unanswered ?? 0}</div>
          </Card>
        </div>

        <div className="text-center pt-4 flex justify-center gap-3">
          <Button variant="outline" onClick={() => setSearchParams({})} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> View All Results & Analytics
          </Button>
          <Link to="/student/exams">
            <Button variant="glow" className="gap-2">
              <BookOpen className="w-4 h-4" /> Return to My Exams
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ALL RESULTS & PERFORMANCE ANALYTICS DASHBOARD (/student/results)
  // =========================================================================
  const totalAttempted = resultsList.length;
  const passedCount = resultsList.filter((r) => r.isPassed).length;
  const averagePercentage =
    totalAttempted > 0
      ? Math.round((resultsList.reduce((acc, r) => acc + r.percentage, 0) / totalAttempted) * 10) / 10
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <Link to="/student">
            <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Student Portal
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Results & Grade Analytics</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Official performance history for your completed examinations showing your highest scores achieved.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/student/exams">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-sky-400 border-sky-500/30">
              <BookOpen className="w-3.5 h-3.5" /> Assigned Exams
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card p-6 rounded-2xl space-y-1 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>EXAMS EVALUATED</span>
            <BarChart2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalAttempted}</div>
          <p className="text-[11px] text-slate-400">Examinations completed</p>
        </Card>

        <Card className="glass-card p-6 rounded-2xl space-y-1 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PASSED ASSESSMENTS</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{passedCount}</div>
          <p className="text-[11px] text-slate-400">Meeting or exceeding passing mark</p>
        </Card>

        <Card className="glass-card p-6 rounded-2xl space-y-1 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVERAGE HIGHEST SCORE</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{averagePercentage}%</div>
          <p className="text-[11px] text-slate-400">Mean percentage across best attempts</p>
        </Card>
      </div>

      {/* Exam Results List */}
      <div className="space-y-4">
        {resultsList.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400 space-y-4">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No completed exam results found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Only examinations you have actually attempted and submitted will appear here. Exams you have not yet started remain in Assigned Exams.
              </p>
            </div>
            <Link to="/student/exams">
              <Button variant="glow" size="sm" className="gap-1.5">
                <BookOpen className="w-4 h-4" /> Go to Assigned Exams
              </Button>
            </Link>
          </Card>
        ) : (
          resultsList.map((res) => (
            <Card
              key={res.examId}
              className="glass-card p-6 rounded-2xl border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="glow">{res.examSubject || 'Assessment'}</Badge>
                    {res.isPassed ? (
                      <Badge variant="success">PASSED</Badge>
                    ) : (
                      <Badge variant="destructive">FAILED</Badge>
                    )}
                    <Badge variant="outline" className="font-mono text-xs">
                      ATTEMPTS: {res.totalAttempts || 1} / {res.maxAttempts || 1}
                    </Badge>
                    {res.remainingAttempts !== undefined && res.remainingAttempts > 0 && (
                      <span className="text-xs font-mono text-sky-400">
                        ({res.remainingAttempts} Attempt{res.remainingAttempts > 1 ? 's' : ''} Still Remaining)
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white">{res.examTitle}</h3>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-xs font-mono text-slate-400">BEST EVALUATED SCORE:</span>
                    <span className="text-2xl font-black text-white">
                      {res.totalScore} <span className="text-sm font-normal text-slate-400">/ {res.maxScore}</span>
                    </span>
                    <Badge variant="glow" className="font-mono text-xs">
                      {res.percentage}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400 pt-1">
                    <div>Correct: <span className="text-emerald-400 font-bold">{res.correctAnswers ?? 0}</span></div>
                    <div>Incorrect: <span className="text-rose-400 font-bold">{res.incorrectAnswers ?? 0}</span></div>
                    <div>Unanswered: <span className="text-amber-400 font-bold">{res.unanswered ?? 0}</span></div>
                    <div>Pass Score: <span className="text-slate-200">{res.passingMarks ?? 40}</span></div>
                  </div>
                </div>

                <div className="shrink-0 self-end lg:self-auto flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchParams({ attemptId: res.attemptId })}
                    className="gap-1.5 text-xs text-sky-300 hover:text-white border-sky-500/30"
                  >
                    <Award className="w-3.5 h-3.5" /> View Breakdown
                  </Button>

                  {res.remainingAttempts !== undefined && res.remainingAttempts > 0 && (
                    <Link to={`/student/exams/${res.examId}`}>
                      <Button size="sm" variant="glow" className="gap-1.5 text-xs">
                        Take Another Attempt
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
