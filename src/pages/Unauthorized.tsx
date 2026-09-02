import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      <Card className="glass-panel border-rose-500/30 p-8 sm:p-12 text-center max-w-md w-full space-y-6">
        <ShieldAlert className="w-16 h-16 text-rose-400 mx-auto animate-bounce" />
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">403 — Unauthorized Access</h1>
          <p className="text-sm text-slate-400">
            You do not have the required institutional permission role to access this portal or resource.
          </p>
        </div>

        <Link to="/">
          <Button variant="outline" className="w-full gap-2 justify-center">
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            Return to Public Landing Page
          </Button>
        </Link>
      </Card>
    </div>
  );
};
