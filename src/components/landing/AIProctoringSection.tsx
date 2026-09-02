import React, { useState } from 'react';
import { UserCheck, Users, Smartphone, Eye, Mic, Lock, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AIProctoringSection: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      id: 'face',
      title: 'Continuous Face Verification',
      badge: 'BIOMETRIC AI',
      icon: <UserCheck className="w-6 h-6 text-sky-400" />,
      description:
        'Verifies candidate identity continuously throughout the assessment using lightweight facial feature point matching and liveness detection.',
      specs: [
        'Matches initial webcam registration baseline',
        'Flags missing face or obscured camera lens',
        'Liveness & anti-spoofing photo protection',
      ],
      demoBadge: '99.8% Accuracy',
      color: 'sky',
    },
    {
      id: 'multi-person',
      title: 'Multi-Person Detection',
      badge: 'COMPUTER VISION',
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      description:
        'Scans the background in real-time to detect secondary persons entering the candidate’s exam environment or looking over their shoulder.',
      specs: [
        'Detects multiple faces in camera field of view',
        'Distinguishes candidate from background bystanders',
        'Auto-snapshots flagged frame for faculty review',
      ],
      demoBadge: 'Sub-300ms Detection',
      color: 'cyan',
    },
    {
      id: 'phone',
      title: 'Phone & Object Detection',
      badge: 'YOLO OBJECT MODEL',
      icon: <Smartphone className="w-6 h-6 text-emerald-400" />,
      description:
        'Uses lightweight YOLO vision models to detect unauthorized physical objects such as smartphones, tablets, books, or smartwatches.',
      specs: [
        'Identifies mobile phones held in hand or near screen',
        'Detects unauthorized reference materials',
        'Configurable sensitivity thresholding',
      ],
      demoBadge: 'Object Model v4',
      color: 'emerald',
    },
    {
      id: 'gaze',
      title: 'Gaze & Attention Tracking',
      badge: 'HEAD POSE VECTORS',
      icon: <Eye className="w-6 h-6 text-amber-400" />,
      description:
        'Calculates head pose pitch, yaw, and eye gaze direction to detect prolonged gaze shifts away from the exam window.',
      specs: [
        'Real-time eye vector estimation',
        'Distinguishes normal reading motion from suspicious side glances',
        'Cumulative gaze deviation scoring',
      ],
      demoBadge: 'Gaze Vector Engine',
      color: 'amber',
    },
    {
      id: 'audio',
      title: 'Voice & Ambient Sound Analysis',
      badge: 'SPEECH DENSITY',
      icon: <Mic className="w-6 h-6 text-rose-400" />,
      description:
        'Monitors ambient audio frequencies to detect background speech, whispering, acoustic anomalies, or dictation devices.',
      specs: [
        'Separates human speech frequencies from background noise',
        'Audio spectrum visualizer and peak logger',
        'Flags voice prompts or assistant activity',
      ],
      demoBadge: 'Audio Frequency Analyzer',
      color: 'rose',
    },
    {
      id: 'browser',
      title: 'Browser & Environment Lockdown',
      badge: 'ZERO TRUST LOCK',
      icon: <Lock className="w-6 h-6 text-indigo-400" />,
      description:
        'Enforces a kiosk sandbox mode that restricts tab switches, copy-pasting, screenshot tools, DevTools, and multi-monitor setups.',
      specs: [
        'Blocks Alt-Tab, Cmd-Tab, and window blur events',
        'Disables right-click, clipboard, and print-screen',
        'Monitors virtual machines and remote screen sharing',
      ],
      demoBadge: 'Kiosk Sandbox v2',
      color: 'indigo',
    },
  ];

  return (
    <section id="ai-proctoring" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <Badge variant="glow" className="px-3.5 py-1 text-sky-400">
            <Cpu className="w-3.5 h-3.5 mr-1.5 inline" />
            AI Proctoring Suite
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Multi-Modal Real-Time AI Detection
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Our multi-layered AI engine continuously analyzes vision, gaze, audio, and OS events to ensure zero room for unauthorized assistance.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((item, idx) => (
            <Card
              key={item.id}
              onClick={() => setSelectedFeature(idx)}
              className={`cursor-pointer transition-all duration-300 ${
                selectedFeature === idx
                  ? 'glass-panel-glow border-sky-500/60 ring-1 ring-sky-500/50 scale-[1.02]'
                  : 'glass-card hover:border-slate-700'
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    {item.icon}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-slate-800">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-white">{item.title}</CardTitle>
                <CardDescription className="text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected AI Feature Interactive Demonstration Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="glow">{features[selectedFeature].badge}</Badge>
                <span className="text-xs font-mono text-emerald-400">STATUS: ACTIVE & MONITORING</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {features[selectedFeature].title} Engine
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {features[selectedFeature].description} All inferences run locally in WebAssembly or GPU edge pipeline without transmitting unencrypted raw video streams to third parties.
              </p>
            </div>

            <div className="w-full md:w-auto bg-slate-950 p-6 rounded-2xl border border-slate-800 min-w-[280px] text-center space-y-3">
              <ShieldAlert className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
              <div className="font-mono text-xs text-slate-400">ENGINE ACCURACY / PERFORMANCE</div>
              <div className="font-mono text-xl font-extrabold text-white">
                {features[selectedFeature].demoBadge}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                PRIVACY FIRST • WASM/GPU ACCELERATED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
