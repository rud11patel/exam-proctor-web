import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Eye, Award, CheckCircle2, Lock, Unlock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exam } from '@/types';
import { examService } from '@/services/examService';

export const FacultyExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);

  const loadExams = () => {
    setExams(examService.getExams());
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleToggleResultRelease = (examId: string, currentStatus: boolean) => {
    examService.toggleResultRelease(examId, !currentStatus);
    loadExams();
  };

  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      examService.deleteExam(examId);
      loadExams();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <Link to="/faculty">
            <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Faculty Portal
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Managed Examinations</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage scheduled exams, configure result publishing, and inspect student attempts.</p>
        </div>

        <Link to="/faculty/exams/create">
          <Button variant="glow" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Exam
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {exams.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400 space-y-3">
            <p className="text-sm font-semibold text-white">No exams created yet.</p>
            <Link to="/faculty/exams/create">
              <Button size="sm" variant="glow">Create First Exam</Button>
            </Link>
          </Card>
        ) : (
          exams.map((exam) => (
            <Card key={exam.id} className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="glow">{exam.subject}</Badge>
                    <Badge variant={exam.resultsPublished ? 'success' : 'secondary'}>
                      {exam.resultsPublished ? 'RESULTS PUBLISHED' : 'RESULTS HIDDEN'}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{exam.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400 pt-2">
                    <div>Questions: <span className="text-slate-200">{exam.questionIds.length}</span></div>
                    <div>Total Marks: <span className="text-slate-200">{exam.totalMarks}</span></div>
                    <div>Duration: <span className="text-slate-200">{exam.durationMinutes}m</span></div>
                    <div>Pass Score: <span className="text-slate-200">{exam.passingMarks}</span></div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={exam.resultsPublished ? 'secondary' : 'glow'}
                    onClick={() => handleToggleResultRelease(exam.id, exam.resultsPublished)}
                    className="gap-1.5 text-xs"
                  >
                    {exam.resultsPublished ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Hide Results
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Publish Results
                      </>
                    )}
                  </Button>

                  <Link to={`/faculty/results?examId=${exam.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Award className="w-3.5 h-3.5 text-sky-400" /> Candidate Scores
                    </Button>
                  </Link>

                  <Button size="sm" variant="danger" onClick={() => handleDeleteExam(exam.id)} className="p-2 h-8 w-8">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
