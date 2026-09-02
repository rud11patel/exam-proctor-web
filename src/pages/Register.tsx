import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export const Register: React.FC = () => {
  const [accountType, setAccountType] = useState<'candidate' | 'institution'>('candidate');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const role = accountType === 'candidate' ? 'student' : 'faculty';
      await register({
        name: fullName,
        email,
        password,
        role,
        institution,
      });

      setIsLoading(false);
      if (role === 'student') navigate('/student');
      else navigate('/faculty');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Proctor<span className="text-sky-400">AI</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">
          Create Your ProctorAI Account
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Join thousands of institutions and students taking secure assessments
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <Card className="glass-panel-glow border-slate-800 p-6 sm:p-8">
          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('candidate')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                accountType === 'candidate'
                  ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <User className={`w-5 h-5 mb-1.5 ${accountType === 'candidate' ? 'text-sky-400' : 'text-slate-400'}`} />
              <div className="text-sm font-bold text-white">Student Candidate</div>
              <div className="text-[11px] text-slate-400">Take monitored exams</div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('institution')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                accountType === 'institution'
                  ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
              }`}
            >
              <Building className={`w-5 h-5 mb-1.5 ${accountType === 'institution' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <div className="text-sm font-bold text-white">Faculty / Educator</div>
              <div className="text-[11px] text-slate-400">Create & monitor exams</div>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Institution / School Name
                </label>
                <Input
                  type="text"
                  placeholder="State University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  icon={<Building className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-semibold">
                Institutional Email Address
              </label>
              <Input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-semibold">
                Create Secure Password
              </label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="glow"
              isLoading={isLoading}
              className="w-full justify-center gap-2 mt-2"
            >
              <span>Complete Account Creation</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Already registered?{' '}
            <Link to="/register" className="text-sky-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
