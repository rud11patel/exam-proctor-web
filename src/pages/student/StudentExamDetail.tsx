import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Play, FileText, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exam } from '@/types';
import { examService } from '@/services/examService';
import { examEngineService } from '@/services/examEngineService';
import { useAuth } from '@/context/AuthContext';

export const StudentExamDetail: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState<Exam | undefined>(undefined);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!examId) return;
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const detail = await examService.getStudentExamDetail(examId);
        if (detail && detail.exam) {
          setExam(detail.exam);
          setStats(detail.stats || null);
        } else {
          setErrorMsg('Examination not found');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to retrieve exam details');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [examId]);

  const requestBrowserFullscreen = async (): Promise<boolean> => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      return !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
    } catch (err) {
      console.warn('Fullscreen request denied or not supported:', err);
      return false;
    }
  };

  const handleStartExam = async () => {
    if (!exam || !user) return;
    setIsStarting(true);
    setErrorMsg(null);

    // 1. Mandatory Fullscreen Enforcement
    const fullscreenSuccess = await requestBrowserFullscreen();
    if (!fullscreenSuccess) {
      setIsStarting(false);
      setErrorMsg(
        'Fullscreen mode is required to take this proctored examination. Please grant fullscreen permissions and try again.'
      );
      return;
    }

    try {
      const attemptId = await examEngineService.startExamAttempt(exam.id);
      navigate(`/student/runner/${attemptId}`);
    } catch (err: any) {
      setIsStarting(false);
      setErrorMsg(err.message || 'Failed to start examination attempt');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
        <span>Loading examination parameters...</span>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-400 space-y-4">
        <h2 className="text-xl text-white font-bold">{errorMsg || 'Exam Not Found'}</h2>
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
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Exams List
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="glow">{exam.subject}</Badge>
          <Badge variant="outline" className="font-mono">MAX ATTEMPTS: {exam.maxAttempts}</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{exam.title}</h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Exam Specifications & Instructions */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              Assessment Overview & Instructions
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{exam.description || 'Complete all questions within the allocated timeframe.'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">DURATION</span>
                <span className="text-white text-base font-bold">{exam.duration} Mins</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">TOTAL MARKS</span>
                <span className="text-white text-base font-bold">{exam.totalMarks}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PASS MARKS</span>
                <span className="text-white text-base font-bold">{exam.passingMarks}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">NEGATIVE MARKING</span>
                <span className="text-rose-400 text-base font-bold">-{exam.negativeMarking}</span>
              </div>
            </div>
          </Card>

          <Card className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Candidate Exam Rules & Integrity Protocol
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Answers auto-synchronize to PostgreSQL database continuously during the attempt.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Timer is server-authoritative; exam auto-submits when duration expires.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Once submitted, the attempt is locked and evaluated on the backend.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Start Launcher Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel-glow border-sky-500/40 p-6 rounded-2xl space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400">TEST WINDOW & ATTEMPT STATUS</div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <span className="text-lg font-bold text-white">{exam.duration} Minutes</span>
              </div>
              <div className="text-xs font-mono text-slate-300 pt-1">
                Attempts Remaining:{' '}
                <span className="text-sky-400 font-bold">
                  {stats ? stats.remainingAttempts : (exam.remainingAttempts ?? exam.maxAttempts)} / {exam.maxAttempts}
                </span>
              </div>
              {stats?.bestScore !== null && stats?.bestScore !== undefined && (
                <div className="text-xs font-mono text-emerald-400">
                  Best Completed Score: {stats.bestScore} / {exam.totalMarks}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              {stats?.activeAttemptId || exam.inProgressAttemptId ? (
                <>
                  <Badge variant="destructive" className="w-full justify-center py-1 animate-pulse">
                    UNFINISHED ATTEMPT IN PROGRESS
                  </Badge>
                  <Button
                    size="lg"
                    variant="danger"
                    onClick={async () => {
                      const fs = await requestBrowserFullscreen();
                      if (!fs) {
                        setErrorMsg('Fullscreen mode is required to resume your exam. Please allow fullscreen permission.');
                        return;
                      }
                      navigate(`/student/runner/${stats?.activeAttemptId || exam.inProgressAttemptId}`);
                    }}
                    className="w-full justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Enter Fullscreen & Resume Exam
                  </Button>
                </>
              ) : (stats?.remainingAttempts === 0 || exam.remainingAttempts === 0) ? (
                <>
                  <Badge variant="outline" className="w-full justify-center py-1 text-slate-400">
                    ALL ATTEMPTS EXHAUSTED
                  </Badge>
                  <Link to="/student/results">
                    <Button size="lg" variant="glow" className="w-full justify-center gap-2">
                      <Award className="w-4 h-4" />
                      View Results & Analytics
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Badge variant="success" className="w-full justify-center py-1">
                    ELIGIBILITY VERIFIED — READY TO START
                  </Badge>
                  <Button
                    size="lg"
                    variant="glow"
                    onClick={handleStartExam}
                    isLoading={isStarting}
                    className="w-full justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Enter Fullscreen & Start Exam
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
