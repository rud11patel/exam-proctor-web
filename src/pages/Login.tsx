import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, User, GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const userEmail = email.trim() || (role === 'student' ? 'student@university.edu' : role === 'faculty' ? 'professor@university.edu' : 'admin@university.edu');
      const userPass = password || 'Password@123';

      await login(userEmail, role, userPass);
      setIsLoading(false);

      if (role === 'student') navigate('/student');
      else if (role === 'faculty') navigate('/faculty');
      else navigate('/admin');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
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
          Assessment Portal Sign In
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter your institutional credentials to access your portal
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="glass-panel-glow border-slate-800 p-6 sm:p-8">
          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="mb-6">
            <label className="text-xs font-mono text-slate-400 font-semibold mb-2 block text-center">
              SELECT YOUR PORTAL ROLE
            </label>
            <Tabs defaultValue="student" onValueChange={(val) => setRole(val as UserRole)} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="student" className="gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="faculty" className="gap-1.5 text-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Faculty
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5" />
                  Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 font-semibold">
                Institutional Email Address
              </label>
              <Input
                type="email"
                placeholder={
                  role === 'student'
                    ? 'student@university.edu'
                    : role === 'faculty'
                    ? 'professor@university.edu'
                    : 'admin@university.edu'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 font-semibold">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-sky-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4 text-slate-400" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="glow"
              isLoading={isLoading}
              className="w-full justify-center gap-2 mt-2"
            >
              <span>Sign In to {role.toUpperCase()} Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            Don't have an assessment account yet?{' '}
            <Link to="/register" className="text-sky-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
