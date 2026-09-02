import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Award, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Exam } from '@/types';
import { examService } from '@/services/examService';
import { examEngineService } from '@/services/examEngineService';
import { useAuth } from '@/context/AuthContext';

export const StudentExams: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  useEffect(() => {
    if (user) {
      setExams(examService.getExamsForStudent(user.id));
    }
  }, [user]);

  const now = new Date().getTime();

  const activeExams = exams.filter((e) => {
    const start = new Date(e.startTime).getTime();
    const end = new Date(e.endTime).getTime();
    return now >= start && now <= end;
  });

  const upcomingExams = exams.filter((e) => {
    const start = new Date(e.startTime).getTime();
    return now < start;
  });

  const completedExams = exams.filter((e) => {
    const end = new Date(e.endTime).getTime();
    const attempts = user ? examEngineService.getStudentAttemptsForExam(e.id, user.id) : [];
    const hasSubmitted = attempts.some((a) => a.status === 'submitted');
    return now > end || hasSubmitted;
  });

  const currentList =
    activeTab === 'active'
      ? activeExams
      : activeTab === 'upcoming'
      ? upcomingExams
      : completedExams;

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Examinations</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Assigned assessments, active test windows, and score reports.</p>
        </div>

        <Tabs defaultValue="active" onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="active" className="text-xs">
              Active ({activeExams.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming ({upcomingExams.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completed ({completedExams.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No {activeTab} exams</h3>
            <p className="text-xs">Assigned exams in this category will appear here.</p>
          </Card>
        ) : (
          currentList.map((exam) => {
            const isCompletedTab = activeTab === 'completed';
            const attempts = user ? examEngineService.getStudentAttemptsForExam(exam.id, user.id) : [];
            const submittedAttempt = attempts.find((a) => a.status === 'submitted');

            return (
              <Card key={exam.id} className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Badge variant="glow">{exam.subject}</Badge>
                      {activeTab === 'active' && <Badge variant="success">TEST WINDOW OPEN</Badge>}
                      {activeTab === 'upcoming' && <Badge variant="warning">UPCOMING</Badge>}
                      {activeTab === 'completed' && <Badge variant="secondary">COMPLETED</Badge>}
                    </div>

                    <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{exam.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400 pt-1">
                      <div>Questions: <span className="text-slate-200">{exam.questionIds.length}</span></div>
                      <div>Total Marks: <span className="text-slate-200">{exam.totalMarks}</span></div>
                      <div>Duration: <span className="text-slate-200">{exam.durationMinutes} Mins</span></div>
                      <div>Pass Score: <span className="text-slate-200">{exam.passingMarks}</span></div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end lg:self-auto">
                    {isCompletedTab ? (
                      submittedAttempt ? (
                        <Link to={`/student/results?attemptId=${submittedAttempt.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Award className="w-4 h-4 text-sky-400" />
                            View Result & Report
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="ghost" size="sm" disabled className="text-xs">
                          Missed Window
                        </Button>
                      )
                    ) : (
                      <Link to={`/student/exams/${exam.id}`}>
                        <Button variant="glow" size="sm" className="gap-1.5 text-xs">
                          <Play className="w-3.5 h-3.5 fill-white" />
                          View Exam Details
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
