import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Award, CheckCircle2, AlertCircle, BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exam } from '@/types';
import { examService } from '@/services/examService';

export const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const list = await examService.getStudentExams();
      setExams(list);
    } catch (err) {
      console.warn('Failed to load student exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Assigned Examinations</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Exams available for you to attempt or resume.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/student/results">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/30">
              <Award className="w-3.5 h-3.5" /> Results & Analytics
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={loadExams} className="gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Roster
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
            <span>Loading assigned examinations from backend...</span>
          </div>
        ) : exams.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No exams currently available to attempt</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have exhausted all allowed attempts for your assigned tests, or no new assessments are scheduled. Check your completed evaluations in Results & Analytics.
              </p>
            </div>
            <Link to="/student/results">
              <Button variant="glow" size="sm" className="gap-1.5">
                <Award className="w-4 h-4" /> View Results & Analytics
              </Button>
            </Link>
          </Card>
        ) : (
          exams.map((exam) => {
            const hasActiveAttempt = !!exam.inProgressAttemptId;
            const attemptsLeft = exam.remainingAttempts ?? exam.maxAttempts;

            return (
              <Card key={exam.id} className="glass-card p-6 rounded-2xl border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="glow">{exam.subject}</Badge>
                      {hasActiveAttempt ? (
                        <Badge variant="destructive" className="animate-pulse">
                          ATTEMPT IN PROGRESS
                        </Badge>
                      ) : (
                        <Badge variant="success">TEST WINDOW OPEN</Badge>
                      )}
                      <Badge variant="outline" className="font-mono text-xs">
                        ATTEMPTS LEFT: {attemptsLeft} / {exam.maxAttempts}
                      </Badge>
                      {exam.bestScore !== null && exam.bestScore !== undefined && (
                        <span className="text-xs font-mono text-emerald-400">
                          Best Score: {exam.bestScore}/{exam.totalMarks}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{exam.description || 'No description provided.'}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400 pt-1">
                      <div>Total Marks: <span className="text-slate-200">{exam.totalMarks}</span></div>
                      <div>Duration: <span className="text-slate-200">{exam.duration} Mins</span></div>
                      <div>Pass Score: <span className="text-slate-200">{exam.passingMarks}</span></div>
                      <div>Attempts Used: <span className="text-slate-200">{exam.attemptCount ?? 0}</span></div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end lg:self-auto flex items-center gap-2">
                    {hasActiveAttempt ? (
                      <Link to={`/student/runner/${exam.inProgressAttemptId}`}>
                        <Button variant="danger" size="sm" className="gap-1.5 text-xs animate-pulse">
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Resume Active Exam
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/student/exams/${exam.id}`}>
                        <Button variant="glow" size="sm" className="gap-1.5 text-xs">
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Start Exam Attempt
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
