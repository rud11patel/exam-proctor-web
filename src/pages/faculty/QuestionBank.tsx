import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit3, Eye, CheckCircle2, AlertCircle, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Question, QuestionType, QuestionDifficulty } from '@/types';
import { questionService } from '@/services/questionService';

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | 'all'>('all');
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Form states for Create Question
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('mcq_single');
  const [qSubject, setQSubject] = useState('Data Structures & Algorithms');
  const [qTopic, setQTopic] = useState('General');
  const [qDifficulty, setQDifficulty] = useState<QuestionDifficulty>('medium');
  const [qMarks, setQMarks] = useState(4);
  const [qExplanation, setQExplanation] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIdxs, setCorrectOptionIdxs] = useState<number[]>([0]);

  const loadAll = () => {
    const list = questionService.filterQuestions(
      searchQuery,
      selectedSubject,
      selectedDifficulty as QuestionDifficulty,
      selectedType as QuestionType
    );
    setQuestions(list);
  };

  useEffect(() => {
    loadAll();
  }, [searchQuery, selectedSubject, selectedDifficulty, selectedType]);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;

    let parsedOptions: { id: string; text: string }[] = [];
    let correctAnswers: string[] = [];

    if (qType === 'true_false') {
      parsedOptions = [
        { id: 'opt-1', text: 'True' },
        { id: 'opt-2', text: 'False' },
      ];
      correctAnswers = [correctOptionIdxs.includes(0) ? 'opt-1' : 'opt-2'];
    } else {
      parsedOptions = options.map((optText, idx) => ({
        id: `opt-${idx + 1}`,
        text: optText.trim() || `Option ${idx + 1}`,
      }));
      correctAnswers = correctOptionIdxs.map((idx) => `opt-${idx + 1}`);
    }

    questionService.addQuestion({
      text: qText,
      type: qType,
      options: parsedOptions,
      correctAnswers,
      marks: Number(qMarks),
      explanation: qExplanation,
      subject: qSubject,
      topic: qTopic,
      difficulty: qDifficulty,
    });

    setCreateModalOpen(false);
    resetForm();
    loadAll();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      questionService.deleteQuestion(id);
      loadAll();
    }
  };

  const resetForm = () => {
    setQText('');
    setQType('mcq_single');
    setQSubject('Data Structures & Algorithms');
    setQTopic('General');
    setQDifficulty('medium');
    setQMarks(4);
    setQExplanation('');
    setOptions(['', '', '', '']);
    setCorrectOptionIdxs([0]);
  };

  const toggleOptionCorrect = (idx: number) => {
    if (qType === 'mcq_single' || qType === 'true_false') {
      setCorrectOptionIdxs([idx]);
    } else {
      if (correctOptionIdxs.includes(idx)) {
        setCorrectOptionIdxs(correctOptionIdxs.filter((i) => i !== idx));
      } else {
        setCorrectOptionIdxs([...correctOptionIdxs, idx]);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Institutional Question Bank</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage item bank questions, test cases, and difficulty classifications.</p>
        </div>

        <Button variant="glow" onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Question
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search questions by text or subject..."
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
              <option value="Data Structures & Algorithms" className="bg-slate-900">Data Structures</option>
              <option value="Artificial Intelligence" className="bg-slate-900">Artificial Intelligence</option>
              <option value="Mathematics" className="bg-slate-900">Mathematics</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Difficulties</option>
              <option value="easy" className="bg-slate-900">Easy</option>
              <option value="medium" className="bg-slate-900">Medium</option>
              <option value="hard" className="bg-slate-900">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Types</option>
              <option value="mcq_single" className="bg-slate-900">Single Choice</option>
              <option value="mcq_multiple" className="bg-slate-900">Multiple Select</option>
              <option value="true_false" className="bg-slate-900">True/False</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Table / Cards */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <Card className="glass-card p-12 text-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No questions found</h3>
            <p className="text-xs">Try adjusting search filters or create a new question.</p>
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
                    <Badge variant="outline" className="text-[10px] font-mono text-slate-400">
                      {q.type === 'mcq_single'
                        ? 'MCQ Single'
                        : q.type === 'mcq_multiple'
                        ? 'MCQ Multi'
                        : 'True/False'}
                    </Badge>
                    <span className="text-xs font-mono text-sky-400">{q.marks} Marks</span>
                  </div>

                  <h3 className="text-base font-semibold text-white leading-relaxed">{q.text}</h3>

                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Options: </span>
                    {q.options.map((o) => o.text).join(' • ')}
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
                {previewQuestion.options.map((opt) => {
                  const isCorrect = previewQuestion.correctAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{opt.text}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
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
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>Add a question to the institutional question bank.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Subject</label>
                <input
                  type="text"
                  value={qSubject}
                  onChange={(e) => setQSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Topic</label>
                <input
                  type="text"
                  value={qTopic}
                  onChange={(e) => setQTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Question Type</label>
                <select
                  value={qType}
                  onChange={(e) => {
                    setQType(e.target.value as QuestionType);
                    setCorrectOptionIdxs([0]);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="mcq_single">MCQ Single Choice</option>
                  <option value="mcq_multiple">MCQ Multiple Select</option>
                  <option value="true_false">True / False</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Difficulty</label>
                <select
                  value={qDifficulty}
                  onChange={(e) => setQDifficulty(e.target.value as QuestionDifficulty)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-slate-300 font-semibold mb-1 block">Marks</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={qMarks}
                  onChange={(e) => setQMarks(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-slate-300 font-semibold mb-1 block">Question Statement</label>
              <textarea
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Enter detailed question text..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white h-24"
                required
              />
            </div>

            {/* Options configuration */}
            {qType !== 'true_false' && (
              <div className="space-y-2">
                <label className="font-mono text-slate-300 font-semibold block">
                  Options (Check the box next to correct answer(s)):
                </label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type={qType === 'mcq_single' ? 'radio' : 'checkbox'}
                      name="correct_opt"
                      checked={correctOptionIdxs.includes(idx)}
                      onChange={() => toggleOptionCorrect(idx)}
                      className="rounded accent-sky-500"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {qType === 'true_false' && (
              <div className="space-y-2">
                <label className="font-mono text-slate-300 font-semibold block">Select Correct Answer:</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tf_correct"
                      checked={correctOptionIdxs.includes(0)}
                      onChange={() => setCorrectOptionIdxs([0])}
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tf_correct"
                      checked={correctOptionIdxs.includes(1)}
                      onChange={() => setCorrectOptionIdxs([1])}
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
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
