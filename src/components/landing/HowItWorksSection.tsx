import React, { useState } from 'react';
import { FileEdit, MonitorCheck, Laptop, Eye, LineChart, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Create & Schedule Exam',
      role: 'Faculty / Admin',
      icon: <FileEdit className="w-6 h-6 text-sky-400" />,
      description:
        'Faculty configures exam parameters, question types, time limit, and chooses proctoring strictness level (Standard, Strict, or Maximum Security).',
      details: [
        'Automated question randomization & shuffle',
        'Configurable AI sensitivity thresholds',
        'Custom candidate whitelist & schedule control',
      ],
    },
    {
      number: '02',
      title: 'System Readiness Check',
      role: 'Candidate',
      icon: <MonitorCheck className="w-6 h-6 text-cyan-400" />,
      description:
        'Before entering the assessment, candidate passes an automated hardware verification check for webcam, microphone, browser permissions, and latency.',
      details: [
        'Webcam & biometric facial baseline enrollment',
        'Audio noise calibration & mic test',
        'Kiosk browser lockdown initiation',
      ],
    },
    {
      number: '03',
      title: 'Secure Exam Execution',
      role: 'Candidate',
      icon: <Laptop className="w-6 h-6 text-emerald-400" />,
      description:
        'Candidate takes the exam in a full-screen, distraction-free environment. Copy-paste, external tabs, and secondary display setups are automatically blocked.',
      details: [
        'Distraction-free focus layout with live timer',
        'Instant response autosave to cloud storage',
        'Non-intrusive status indicators',
      ],
    },
    {
      number: '04',
      title: 'Real-Time AI Proctoring',
      role: 'Automated AI Engine',
      icon: <Eye className="w-6 h-6 text-amber-400" />,
      description:
        'AI vision and audio models run locally in-browser or edge server to detect anomalies like missing face, gaze deviation, phone detection, and background voices.',
      details: [
        'Sub-second anomaly tagging & timestamping',
        'Multi-person & object recognition (YOLO vision)',
        'Zero video recording privacy storage option',
      ],
    },
    {
      number: '05',
      title: 'Faculty Audit & Results',
      role: 'Faculty / Examiner',
      icon: <LineChart className="w-6 h-6 text-indigo-400" />,
      description:
        'Faculty reviews an aggregate trust score, flagged timestamps with video snapshots, and analytics breakdown to approve or invalidate results.',
      details: [
        'Automated integrity score (0-100%) calculation',
        'Click-to-jump incident timeline playback',
        'Exportable compliance reports (PDF / CSV)',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="px-3.5 py-1 text-sky-400 border-sky-500/30">
            End-To-End Workflow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How ProctorAI Secures Every Assessment
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From exam creation to final faculty audit, our 5-step automated workflow guarantees total assessment integrity without friction.
          </p>
        </div>

        {/* Step Navigation Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          {steps.map((step, idx) => (
            <div
              key={step.number}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                activeStep === idx
                  ? 'bg-slate-900 border-sky-500/80 shadow-lg shadow-sky-500/10 scale-[1.02]'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-sky-400">{step.number}</span>
                {activeStep === idx && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </div>
              <div className="mb-2">{step.icon}</div>
              <h3 className="text-sm font-semibold text-white line-clamp-1">{step.title}</h3>
              <p className="text-[11px] font-mono text-slate-400 mt-1">{step.role}</p>
            </div>
          ))}
        </div>

        {/* Active Step Detailed Showcase Panel */}
        <Card className="glass-panel-glow border-sky-500/40 p-6 sm:p-8 rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  {steps[activeStep].icon}
                </div>
                <div>
                  <Badge variant="glow" className="mb-1 text-xs">
                    STEP {steps[activeStep].number} • {steps[activeStep].role}
                  </Badge>
                  <h3 className="text-2xl font-bold text-white">{steps[activeStep].title}</h3>
                </div>
              </div>

              <p className="text-slate-300 text-base leading-relaxed">
                {steps[activeStep].description}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Key Capabilities
                </h4>
                {steps[activeStep].details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Step Simulation Box */}
            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-3 border-b border-slate-800">
                <span>SIMULATED WORKFLOW STEP</span>
                <span className="text-sky-400">ACTIVE STAGE #{activeStep + 1}</span>
              </div>

              <div className="space-y-3 py-4">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-300">Phase Status</span>
                  <Badge variant="success">IN PROGRESS</Badge>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-300">Target Role</span>
                  <span className="font-mono text-sky-300">{steps[activeStep].role}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-300">Automated Audit</span>
                  <span className="font-mono text-emerald-400">ENFORCED</span>
                </div>
              </div>

              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Next Workflow Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
