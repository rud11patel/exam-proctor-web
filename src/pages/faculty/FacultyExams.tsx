import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Award, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Exam } from '@/types';
import { examService } from '@/services/examService';

export const FacultyExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal state
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const list = await examService.getFacultyExams();
      setExams(list);
    } catch (err) {
      console.warn('Failed to load exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await examService.deleteExam(examToDelete.id);
      // Remove immediately from displayed list without page refresh
      setExams((prev) => prev.filter((e) => e.id !== examToDelete.id));
      setSuccessMessage(res.message || `Examination "${examToDelete.title}" deleted successfully.`);
      setExamToDelete(null);

      // Auto-dismiss success notification
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete examination');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Header */}
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadExams} className="gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Link to="/faculty/exams/create">
            <Button variant="glow" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl text-xs sm:text-sm text-emerald-200 flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-auto p-1 text-xs text-emerald-300 hover:text-white"
            onClick={() => setSuccessMessage(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Exam List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
            <span>Loading managed examinations from database...</span>
          </div>
        ) : exams.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400 space-y-3">
            <p className="text-sm font-semibold text-white">No active exams found.</p>
            <Link to="/faculty/exams/create">
              <Button size="sm" variant="glow">Create First Exam</Button>
            </Link>
          </Card>
        ) : (
          exams.map((exam) => (
            <Card key={exam.id} className="glass-card p-6 rounded-2xl border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="glow">{exam.subject}</Badge>
                    <Badge variant="success">PUBLISHED</Badge>
                  </div>

                  <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{exam.description || 'No description provided.'}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400 pt-2">
                    <div>Assigned Candidates: <span className="text-slate-200">{exam.assignedStudentsCount || 0}</span></div>
                    <div>Total Marks: <span className="text-slate-200">{exam.totalMarks}</span></div>
                    <div>Duration: <span className="text-slate-200">{exam.duration}m</span></div>
                    <div>Pass Score: <span className="text-slate-200">{exam.passingMarks}</span></div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link to="/faculty/results">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Award className="w-3.5 h-3.5 text-sky-400" /> Candidate Scores
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setExamToDelete(exam);
                      setDeleteError(null);
                    }}
                    className="gap-1.5 text-xs border-rose-500/30 text-rose-400 hover:text-white hover:bg-rose-950/50 hover:border-rose-500/60"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete Examination
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!examToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setExamToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-400 mb-1">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <DialogTitle className="text-lg font-bold text-white">Delete Examination</DialogTitle>
            </div>
            <DialogDescription className="text-slate-300 pt-2 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">"{examToDelete?.title}"</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Destructive Action
            </p>
            <p className="text-slate-400">
              This action cannot be undone. Candidate roster assignments will be cleared. If candidates have completed evaluations, the examination will be safely archived to protect academic records.
            </p>
          </div>

          {deleteError && (
            <div className="bg-red-950/60 border border-red-500/60 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                setExamToDelete(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
