import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Eye, CheckCircle2, ArrowLeft, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Question } from '@/types';
import { questionService } from '@/services/questionService';

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Form states for Create Question
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<'mcq-single' | 'mcq-multiple' | 'true-false'>('mcq-single');
  const [qSubject, setQSubject] = useState('Computer Science');
  const [qTopic, setQTopic] = useState('General');
  const [qDifficulty, setQDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qMarks, setQMarks] = useState<number | string>(4);
  const [qExplanation, setQExplanation] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number | null>(0);

  // Validation Error State
  const [formError, setFormError] = useState<string | null>(null);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const list = await questionService.getQuestions({
        search: searchQuery,
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        type: selectedType,
      });
      setQuestions(list);
    } catch (err: any) {
      console.warn('Failed to load questions:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [searchQuery, selectedSubject, selectedDifficulty, selectedType]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Question text validation
    if (!qText.trim()) {
      setFormError('Question text is required.');
      return;
    }

    // 2. Subject validation
    if (!qSubject.trim()) {
      setFormError('Subject is required.');
      return;
    }

    // 3. Marks validation
    const numMarks = Number(qMarks);
    if (isNaN(numMarks) || numMarks <= 0) {
      setFormError('Marks must be greater than 0.');
      return;
    }

    // 4. Options validation
    let parsedOptions: { text: string; isCorrect: boolean }[] = [];

    if (qType === 'true-false') {
      if (correctOptionIdx === null) {
        setFormError('Please select the correct answer.');
        return;
      }
      parsedOptions = [
        { text: 'True', isCorrect: correctOptionIdx === 0 },
        { text: 'False', isCorrect: correctOptionIdx === 1 },
      ];
    } else {
      const filledOptions = options.map((o) => o.trim());

      // At least 2 options check
      if (filledOptions.length < 2) {
        setFormError('Please provide at least 2 options.');
        return;
      }

      // No empty options check
      for (let i = 0; i < filledOptions.length; i++) {
        if (!filledOptions[i]) {
          setFormError(`All options must contain text (Option ${String.fromCharCode(65 + i)} is empty).`);
          return;
        }
      }

      // Exactly ONE correct option check
      if (correctOptionIdx === null || correctOptionIdx < 0 || correctOptionIdx >= filledOptions.length) {
        setFormError('Please select the correct answer.');
        return;
      }

      parsedOptions = filledOptions.map((optText, idx) => ({
        text: optText,
        isCorrect: idx === correctOptionIdx,
      }));
    }

    try {
      await questionService.createQuestion({
        text: qText.trim(),
        type: qType,
        options: parsedOptions.map((o, idx) => ({ id: `opt-${idx + 1}`, text: o.text, isCorrect: o.isCorrect })),
        marks: numMarks,
        explanation: qExplanation.trim(),
        subject: qSubject.trim(),
        topic: qTopic.trim(),
        difficulty: qDifficulty,
      });

      setCreateModalOpen(false);
      resetForm();
      loadAll();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create question.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionService.deleteQuestion(id);
        loadAll();
      } catch (err: any) {
        alert(err.message || 'Failed to delete question');
      }
    }
  };

  const resetForm = () => {
    setQText('');
    setQType('mcq-single');
    setQSubject('Computer Science');
    setQTopic('General');
    setQDifficulty('medium');
    setQMarks(4);
    setQExplanation('');
    setOptions(['', '', '', '']);
    setCorrectOptionIdx(0);
    setFormError(null);
  };

  const addOptionField = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOptionField = (idx: number) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== idx);
      setOptions(updated);
      if (correctOptionIdx === idx) {
        setCorrectOptionIdx(0);
      } else if (correctOptionIdx !== null && correctOptionIdx > idx) {
        setCorrectOptionIdx(correctOptionIdx - 1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/faculty">
              <Button size="sm" variant="ghost" className="p-1 h-auto text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> Faculty Portal
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Question Bank</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage item bank questions owned by your faculty account.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} className="gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Bank
          </Button>
          <Button variant="glow" onClick={() => { resetForm(); setCreateModalOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Create MCQ Question
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search my questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-2/3 justify-end text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Subjects</option>
              <option value="Computer Science" className="bg-slate-900">Computer Science</option>
              <option value="Data Structures & Algorithms" className="bg-slate-900">Data Structures</option>
              <option value="Database Systems" className="bg-slate-900">Database Systems</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Difficulties</option>
              <option value="easy" className="bg-slate-900">Easy</option>
              <option value="medium" className="bg-slate-900">Medium</option>
              <option value="hard" className="bg-slate-900">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Table / Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
            <span>Loading owned questions from database...</span>
          </div>
        ) : questions.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No questions found</h3>
            <p className="text-xs">Create your first MCQ question using the button above.</p>
          </Card>
        ) : (
          questions.map((q, idx) => (
            <Card key={q.id} className="glass-card p-5 rounded-2xl hover:border-slate-700 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="glow" className="text-[10px] font-mono">
                      Q#{idx + 1} • {q.subject}
                    </Badge>
                    <Badge
                      variant={
                        q.difficulty === 'hard'
                          ? 'destructive'
                          : q.difficulty === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      className="text-[10px] uppercase font-mono"
                    >
                      {q.difficulty}
                    </Badge>
                    <span className="text-xs font-mono text-sky-400">{q.marks} Marks</span>
                  </div>

                  <h3 className="text-base font-semibold text-white leading-relaxed">{q.text}</h3>

                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Options: </span>
                    {(q.options || []).map((o, i) => `${String.fromCharCode(65 + i)}. ${o.text}${o.isCorrect ? ' (Correct)' : ''}`).join(' • ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setPreviewQuestion(q)} className="gap-1 text-xs">
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    Preview
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(q.id)} className="p-2 h-8 w-8">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Preview Question Modal */}
      {previewQuestion && (
        <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4 text-sky-400" />
                Question Preview
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="glow">{previewQuestion.subject}</Badge>
                <Badge variant="outline">{previewQuestion.difficulty.toUpperCase()}</Badge>
                <span className="font-mono text-sky-400 ml-auto">{previewQuestion.marks} Marks</span>
              </div>

              <h4 className="text-sm font-bold text-white">{previewQuestion.text}</h4>

              <div className="space-y-2">
                {(previewQuestion.options || []).map((opt, i) => {
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        opt.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span><strong className="mr-1">{String.fromCharCode(65 + i)}.</strong> {opt.text}</span>
                      {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>

              {previewQuestion.explanation && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                  <span className="font-semibold text-slate-200 block mb-1">Explanation:</span>
                  {previewQuestion.explanation}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Question Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create MCQ Question</DialogTitle>
            <DialogDescription>Add a new question to your faculty question bank.</DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Subject *</label>
                <input
                  type="text"
                  value={qSubject}
                  onChange={(e) => setQSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Topic (Optional)</label>
                <input
                  type="text"
                  value={qTopic}
                  onChange={(e) => setQTopic(e.target.value)}
                  placeholder="e.g. Algorithms"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Question Type</label>
                <select
                  value={qType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setQType(newType);
                    setCorrectOptionIdx(0);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="mcq-single">MCQ (Multiple Choice)</option>
                  <option value="true-false">True / False</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Difficulty</label>
                <select
                  value={qDifficulty}
                  onChange={(e) => setQDifficulty(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Marks *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={qMarks}
                  onChange={(e) => setQMarks(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-slate-300 font-semibold mb-1 block">Question Statement *</label>
              <textarea
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Enter detailed question statement..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white h-24 outline-none"
                required
              />
            </div>

            {/* Options configuration */}
            {qType !== 'true-false' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-slate-300 font-semibold block">
                    Options (Select the radio button next to the correct answer) *
                  </label>
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOptionField}
                      className="text-xs text-sky-400 hover:underline font-mono"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={correctOptionIdx === idx}
                      onChange={() => setCorrectOptionIdx(idx)}
                      className="rounded-full accent-sky-500 cursor-pointer w-4 h-4"
                    />
                    <span className="font-mono font-bold text-slate-400 w-4">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...options];
                        updated[idx] = e.target.value;
                        setOptions(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOptionField(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {qType === 'true-false' && (
              <div className="space-y-2">
                <label className="font-mono text-slate-300 font-semibold block">Select Correct Answer *</label>
                <div className="flex items-center gap-6 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="tf_correct"
                      checked={correctOptionIdx === 0}
                      onChange={() => setCorrectOptionIdx(0)}
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="tf_correct"
                      checked={correctOptionIdx === 1}
                      onChange={() => setCorrectOptionIdx(1)}
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="font-mono text-slate-300 font-semibold mb-1 block">Explanation (Optional)</label>
              <input
                type="text"
                value={qExplanation}
                onChange={(e) => setQExplanation(e.target.value)}
                placeholder="Rationale for correct option..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="glow">
                Save to Question Bank
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
