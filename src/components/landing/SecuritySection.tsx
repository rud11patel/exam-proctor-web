import React from 'react';
import { ShieldCheck, Lock, Key, Server, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SecuritySection: React.FC = () => {
  const securityPillars = [
    {
      icon: <Lock className="w-6 h-6 text-sky-400" />,
      title: '256-Bit Data Encryption',
      description:
        'All examination questions, candidate answers, and proctoring telemetry are encrypted in transit via TLS 1.3 and at rest with AES-256 GCM.',
    },
    {
      icon: <EyeOff className="w-6 h-6 text-emerald-400" />,
      title: 'Zero-Knowledge Privacy',
      description:
        'Candidate facial biometrics are converted into non-invertible numerical vector embeddings. Raw video frames are processed locally or purged post-audit.',
    },
    {
      icon: <Key className="w-6 h-6 text-cyan-400" />,
      title: 'Multi-Factor Bio Authentication',
      description:
        'Prevents proxy test-taking by combining institution SSO credentials with continuous facial liveness and biometric face verification.',
    },
    {
      icon: <Server className="w-6 h-6 text-amber-400" />,
      title: 'Anti-Tamper Kiosk Environment',
      description:
        'Restricts virtual machines, secondary display splitters, screen share tools, DevTools inspection, and background remote desk applications.',
    },
    {
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      title: 'FERPA & GDPR Compliance',
      description:
        'Built strictly adhering to global educational data privacy standards. Institutions retain 100% ownership and governance of candidate logs.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
      title: 'Immutable Audit Trail',
      description:
        'Every flagged incident, faculty intervention, and answer submission receives a cryptographically signed timestamp log for dispute resolution.',
    },
  ];

  return (
    <section id="security" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="px-3.5 py-1 text-sky-400 border-sky-500/30">
            Enterprise Security Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Uncompromising Security & Privacy Standards
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Built from the ground up to uphold institutional credibility while safeguarding student data privacy rights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((item, idx) => (
            <Card key={idx} className="glass-card hover:border-sky-500/40">
              <CardHeader>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 w-fit mb-3">
                  {item.icon}
                </div>
                <CardTitle className="text-lg font-bold text-white">{item.title}</CardTitle>
                <CardDescription className="text-slate-400 text-sm leading-relaxed pt-1">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
