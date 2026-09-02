import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Layers, BookOpen, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Question, User } from '@/types';
import { questionService } from '@/services/questionService';
import { examService } from '@/services/examService';
import { authService } from '@/services/authService';

export const ExamBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingMarks, setPassingMarks] = useState(5);
  const [negativeMarking, setNegativeMarking] = useState(0.25);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // Step 2 Questions Selection
  const allBankQuestions = questionService.getQuestions();
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    allBankQuestions.slice(0, 3).map((q) => q.id)
  );

  // Step 3 Student Assignment
  const allUsers = authService.getAllUsers().filter((u) => u.role === 'student');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['user-student-1']);

  const selectedQuestions = allBankQuestions.filter((q) => selectedQuestionIds.includes(q.id));
  const totalMarksCalculated = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);

  const toggleQuestionSelect = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qId) => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleSaveExam = () => {
    if (!title.trim() || selectedQuestionIds.length === 0) return;

    examService.createExam({
      title,
      description,
      subject,
      durationMinutes: Number(durationMinutes),
      totalQuestions: selectedQuestionIds.length,
      totalMarks: totalMarksCalculated,
      passingMarks: Number(passingMarks),
      negativeMarking: Number(negativeMarking),
      questionIds: selectedQuestionIds,
      randomizeQuestions,
      randomizeOptions,
      maxAttempts: Number(maxAttempts),
      assignedStudentIds: selectedStudentIds,
      isPublished: true,
      resultsPublished: false,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      createdBy: 'user-faculty-1',
    });

    navigate('/faculty/exams');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-900">
        <div>
          <Link to="/faculty">
            <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white mb-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Faculty Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create New Assessment</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant={step === 1 ? 'glow' : 'outline'}>1. Parameters</Badge>
          <span className="text-slate-600">→</span>
          <Badge variant={step === 2 ? 'glow' : 'outline'}>2. Question Bank ({selectedQuestionIds.length})</Badge>
          <span className="text-slate-600">→</span>
          <Badge variant={step === 3 ? 'glow' : 'outline'}>3. Assign Candidates</Badge>
        </div>
      </div>

      {/* Step 1: Exam Parameters */}
      {step === 1 && (
        <Card className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Step 1: Exam Settings & Rules</h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-mono text-slate-300 font-semibold mb-1 block">Exam Title</label>
              <Input
                type="text"
                placeholder="e.g. CS-401: Data Structures Final Examination"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-mono text-slate-300 font-semibold mb-1 block">Description & Candidate Instructions</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions on grading, allowed materials, and timing..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Subject</label>
                <Input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Duration (Minutes)</label>
                <Input type="number" min="5" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Passing Marks</label>
                <Input type="number" min="1" value={passingMarks} onChange={(e) => setPassingMarks(Number(e.target.value))} />
              </div>
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Negative Marking (per wrong)</label>
                <Input type="number" step="0.25" min="0" value={negativeMarking} onChange={(e) => setNegativeMarking(Number(e.target.value))} />
              </div>
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Max Attempts Allowed</label>
                <Input type="number" min="1" max="5" value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Window Start Date/Time</label>
                <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Window End Date/Time</label>
                <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-900 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="rounded text-sky-500"
                />
                <span>Randomize Question Order</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-900 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={randomizeOptions}
                  onChange={(e) => setRandomizeOptions(e.target.checked)}
                  className="rounded text-sky-500"
                />
                <span>Randomize Answer Choices</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="glow" onClick={() => title.trim() && setStep(2)} disabled={!title.trim()} className="gap-2">
              Next: Select Questions <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Select Questions */}
      {step === 2 && (
        <Card className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Step 2: Select Questions from Item Bank</h2>
              <p className="text-xs text-slate-400">
                Selected: <span className="text-sky-400 font-bold">{selectedQuestionIds.length} questions</span> ({totalMarksCalculated} Total Marks)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedQuestionIds(allBankQuestions.map((q) => q.id))}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedQuestionIds([])}>
                Clear Selection
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
            {allBankQuestions.map((q) => {
              const isSelected = selectedQuestionIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestionSelect(q.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500/80 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 rounded text-sky-500"
                  />
                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="glow">{q.subject}</Badge>
                      <Badge variant="outline">{q.difficulty.toUpperCase()}</Badge>
                      <span className="font-mono text-sky-400 ml-auto">{q.marks} Marks</span>
                    </div>
                    <p className="font-semibold text-white text-sm">{q.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Parameters
            </Button>
            <Button variant="glow" onClick={() => selectedQuestionIds.length > 0 && setStep(3)} disabled={selectedQuestionIds.length === 0} className="gap-2">
              Next: Assign Candidates <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Assign Candidates & Save */}
      {step === 3 && (
        <Card className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Step 3: Assign Candidates & Publish</h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-sm">Exam Summary</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                <div>Title: {title}</div>
                <div>Subject: {subject}</div>
                <div>Questions: {selectedQuestionIds.length}</div>
                <div>Total Marks: {totalMarksCalculated}</div>
                <div>Duration: {durationMinutes} Mins</div>
                <div>Passing Score: {passingMarks}</div>
              </div>
            </div>

            <div>
              <label className="font-mono text-slate-300 font-semibold mb-2 block">Assign to Enrolled Students:</label>
              <div className="space-y-2">
                {allUsers.map((student) => {
                  const isAssigned = selectedStudentIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        if (isAssigned) {
                          setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                        } else {
                          setSelectedStudentIds([...selectedStudentIds, student.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                        isAssigned
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{student.name}</div>
                          <div className="font-mono text-[10px] text-slate-400">{student.email} • {student.studentId || 'CS2026-089'}</div>
                        </div>
                      </div>
                      {isAssigned && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Questions
            </Button>
            <Button variant="glow" onClick={handleSaveExam} className="gap-2">
              <Check className="w-4 h-4" /> Finalize & Publish Exam
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
