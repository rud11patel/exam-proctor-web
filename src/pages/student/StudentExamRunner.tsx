import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, CheckCircle2, Bookmark, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle, Send, RefreshCw, Maximize, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ExamAttempt, Question, AnswerState } from '@/types';
import { examEngineService } from '@/services/examEngineService';
import { useBrowserProctoring } from '@/hooks/useBrowserProctoring';

export const StudentExamRunner: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersState, setAnswersState] = useState<Record<string, AnswerState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Server-authoritative timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<string>('Synchronized');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [autoSubmittedState, setAutoSubmittedState] = useState(false);

  // BROWSER PROCTORING HOOK: Active strictly during in-progress attempt
  const { tabSwitchCount, isFullscreen, activeViolations, dismissViolation, requestFullscreen, violationCount, maxViolations } = useBrowserProctoring({
    attemptId: attempt?.id,
    isActive: attempt?.status === 'in-progress' && !autoSubmittedState,
    onAutoSubmit: () => {
      setAutoSubmittedState(true);
      setTimeout(() => {
        navigate(`/student/results?attemptId=${attempt?.id}`);
      }, 5000);
    }
  });

  const loadAttemptState = async () => {
    if (!attemptId) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await examEngineService.getAttemptState(attemptId);
      setAttempt(data.attempt);
      setQuestions(data.questions);
      setAnswersState(data.answers);
      setRemainingSeconds(data.remainingTimeSeconds);

      if (data.attempt.status === 'submitted') {
        navigate(`/student/results?attemptId=${data.attempt.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to retrieve exam attempt state from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttemptState();
  }, [attemptId]);

  // Server-authoritative timer countdown
  useEffect(() => {
    if (!attempt || attempt.status !== 'in-progress' || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, remainingSeconds]);

  const handleAutoSubmitOnExpire = async () => {
    if (!attemptId) return;
    try {
      await examEngineService.submitExamAttempt(attemptId);
      navigate(`/student/results?attemptId=${attemptId}`);
    } catch (err) {
      navigate(`/student/results?attemptId=${attemptId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <span className="text-xs">Loading Secure Exam Runner from PostgreSQL...</span>
      </div>
    );
  }

  if (errorMsg || !attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl text-white font-bold">{errorMsg || 'Active Examination Not Found'}</h2>
        <Button variant="outline" onClick={() => navigate('/student/exams')}>
          Return to My Exams
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answersState[currentQ.id] || {
    questionId: currentQ.id,
    selectedOptions: [],
    isMarkedForReview: false,
    savedAt: '',
  };

  const handleOptionToggle = (optionId: string) => {
    let newSelected: string[] = [];

    if (currentQ.type === 'mcq-single' || currentQ.type === 'true-false') {
      newSelected = [optionId];
    } else {
      const exists = currentAnswer.selectedOptions.includes(optionId);
      if (exists) {
        newSelected = currentAnswer.selectedOptions.filter((id) => id !== optionId);
      } else {
        newSelected = [...currentAnswer.selectedOptions, optionId];
      }
    }

    saveAnswerToBackend(newSelected, currentAnswer.isMarkedForReview);
  };

  const handleToggleMarkReview = () => {
    saveAnswerToBackend(currentAnswer.selectedOptions, !currentAnswer.isMarkedForReview);
  };

  const handleClearAnswer = () => {
    saveAnswerToBackend([], currentAnswer.isMarkedForReview);
  };

  const saveAnswerToBackend = async (selectedOptions: string[], isMarked: boolean) => {
    setSyncStatus('Syncing...');
    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOptions,
        isMarkedForReview: isMarked,
        savedAt: new Date().toISOString(),
      },
    }));

    try {
      await examEngineService.autoSaveAnswer(attempt.id, currentQ.id, selectedOptions, isMarked);
      setSyncStatus(`Saved ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setSyncStatus('Sync Cached Offline');
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await examEngineService.submitExamAttempt(attempt.id);
      setSubmitModalOpen(false);
      navigate(`/student/results?attemptId=${attempt.id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || 'Failed to submit exam attempt');
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Navigator statistics
  const totalCount = questions.length;
  let answeredCount = 0;
  let markedCount = 0;

  questions.forEach((q) => {
    const ans = answersState[q.id];
    if (ans && ans.selectedOptions && ans.selectedOptions.length > 0) answeredCount++;
    if (ans && ans.isMarkedForReview) markedCount++;
  });

  const unansweredCount = totalCount - answeredCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white select-none">
      {/* Fullscreen Enforced Blocking Overlay */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 animate-pulse">
            <Maximize className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-white">Fullscreen Mode Required</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assessment interaction is temporarily paused because browser fullscreen mode was exited. Fullscreen mode is strictly required throughout this proctored examination.
            </p>
          </div>
          <Button size="lg" variant="glow" onClick={requestFullscreen} className="gap-2 font-semibold">
            <Maximize className="w-4 h-4" /> Return to Fullscreen
          </Button>
        </div>
      )}

      {/* Floating Temporary Violation Toasts (~7s Lifespan, Auto-Dismissed) */}
      <div className="fixed top-16 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-auto">
        {activeViolations.map((v) => (
          <div
            key={v.id}
            className="bg-amber-950/90 border border-amber-500/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs text-amber-200 flex items-start justify-between gap-2.5 animate-in slide-in-from-top-2 fade-in duration-200"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">{v.eventType.replace('_', ' ')}</span>
                <span className="text-amber-200/90 leading-tight">{v.message}</span>
              </div>
            </div>
            <button
              onClick={() => dismissViolation(v.id)}
              className="text-amber-400/60 hover:text-white text-xs font-mono ml-2 shrink-0"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">Proctored Assessment</h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{currentQ.subject}</span>
              <span>•</span>
              <span className="text-emerald-400">{syncStatus}</span>
            </div>
            
            <div className="flex gap-4 mb-4 items-center flex-wrap">
              <Badge variant="outline" className={`py-1.5 px-3 rounded-md text-xs font-medium border ${violationCount >= maxViolations ? 'bg-rose-950/40 text-rose-400 border-rose-900/50' : violationCount > 0 ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' : 'bg-slate-900/50 text-slate-300 border-slate-800'}`}>
                <AlertTriangle className="w-3.5 h-3.5 mr-2" />
                Violations: {violationCount} / {maxViolations}
              </Badge>
              {tabSwitchCount > 0 && (
                <Badge variant="outline" className="bg-amber-950/40 text-amber-400 border-amber-900/50 py-1.5 px-3 rounded-md text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 mr-2" />
                  Tab Switches: {tabSwitchCount}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switch Counter Badge */}
          {tabSwitchCount > 0 && (
            <Badge variant="destructive" className="font-mono text-xs animate-pulse">
              Tab Switches: {tabSwitchCount}
            </Badge>
          )}

          {/* Fullscreen Mode Indicator / Toggle */}
          {!isFullscreen && (
            <Button size="sm" variant="outline" onClick={requestFullscreen} className="gap-1.5 text-xs border-amber-500/50 text-amber-400">
              <Maximize className="w-3.5 h-3.5" /> Enter Fullscreen
            </Button>
          )}

          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              remainingSeconds < 300
                ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <Button variant="danger" size="sm" onClick={() => setSubmitModalOpen(true)} className="gap-1.5 text-xs">
            <Send className="w-3.5 h-3.5" /> Submit Exam
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Question Pane */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-mono text-sky-400 uppercase font-semibold">
                  Question {currentIndex + 1} of {questions.length} • {currentQ.type === 'mcq-single' ? 'Single Choice' : currentQ.type === 'mcq-multiple' ? 'Multiple Select' : 'True / False'}
                </span>
                <h3 className="text-lg font-bold text-white leading-relaxed">{currentQ.text}</h3>
              </div>
              <Badge variant="glow" className="font-mono text-xs shrink-0">
                {currentQ.marks} Marks
              </Badge>
            </div>

            {/* Answer Choice Options */}
            <div className="space-y-3">
              {(currentQ.options || []).map((option) => {
                const isSelected = currentAnswer.selectedOptions.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => handleOptionToggle(option.id)}
                    className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500 text-white shadow-sm ring-1 ring-sky-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type={currentQ.type === 'mcq-single' || currentQ.type === 'true-false' ? 'radio' : 'checkbox'}
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded accent-sky-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium">{option.text}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-400" />}
                  </div>
                );
              })}
            </div>

            {/* Question Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={currentAnswer.isMarkedForReview ? 'glow' : 'outline'}
                  onClick={handleToggleMarkReview}
                  className="gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {currentAnswer.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleClearAnswer} className="gap-1 text-slate-400">
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Answer
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Question Navigator Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase border-b border-slate-800 pb-2">
              Question Navigator
            </h4>

            {/* Grid of Question Numbers */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answersState[q.id];
                const isAns = ans && ans.selectedOptions && ans.selectedOptions.length > 0;
                const isMarked = ans && ans.isMarkedForReview;
                const isCurrent = idx === currentIndex;

                let bgClass = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isAns && isMarked) {
                  bgClass = 'bg-purple-950 border-purple-500 text-purple-300 ring-1 ring-purple-500';
                } else if (isAns) {
                  bgClass = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                } else if (isMarked) {
                  bgClass = 'bg-purple-950/60 border-purple-600 text-purple-400';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-500 inline-block" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800 inline-block" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-950 border border-purple-500 inline-block" />
                <span>Marked for Review ({markedCount})</span>
              </div>
            </div>

            <Button
              variant="glow"
              onClick={() => setSubmitModalOpen(true)}
              className="w-full justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4" /> Submit Assessment
            </Button>
          </Card>
        </div>
      </div>

      {/* Auto Submit Overlay */}
      {autoSubmittedState && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-slate-900 border-rose-900/50 p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-semibold text-rose-400">Maximum Violations Reached</h2>
            <p className="text-sm text-slate-300">
              You have reached the maximum allowed violations ({maxViolations}). Your examination has been automatically submitted.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Redirecting to results in a few seconds...
            </p>
          </Card>
        </div>
      )}

      {/* Confirmation Submission Modal Dialog */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" /> Confirm Final Submission
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your examination? Once submitted, your answers will be locked.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 font-mono text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span>Total Answered Questions:</span>
              <span className="text-emerald-400 font-bold">{answeredCount}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span>Unanswered Questions:</span>
              <span className="text-amber-400 font-bold">{unansweredCount}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
              <span>Marked for Review:</span>
              <span className="text-purple-400 font-bold">{markedCount}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitModalOpen(false)}>
              Continue Exam
            </Button>
            <Button variant="glow" onClick={handleFinalSubmit} isLoading={isSubmitting}>
              Submit & Lock Attempt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
