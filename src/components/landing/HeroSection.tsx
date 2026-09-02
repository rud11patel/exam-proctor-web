import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { ShieldCheck, Eye, Video, AlertTriangle, Lock, Sparkles, CheckCircle2, ChevronRight, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { gsap } from '@/lib/gsap-config';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        )
        .fromTo(
          subtextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-slate-950 bg-grid-pattern"
    >
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Copy & Call to Actions */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div ref={badgeRef} className="inline-flex">
              <Badge variant="glow" className="px-4 py-1.5 gap-2 text-xs font-semibold rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Next-Gen Assessment Protection</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-slate-300">AI Powered</span>
              </Badge>
            </div>

            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Secure examinations.{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                AI-powered proctoring.
              </span>{' '}
              Reliable assessment.
            </h1>

            <p
              ref={subtextRef}
              className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Protect academic integrity with real-time multi-modal AI vision, gaze vector tracking, secondary device detection, and zero-trust kiosk lockdown browser controls.
            </p>

            {/* CTAs */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="glow" className="w-full sm:w-auto gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Start Secure Exam
                </Button>
              </Link>
              <a href="#ai-proctoring" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Play className="w-4 h-4 text-sky-400" />
                  Explore AI Capabilities
                </Button>
              </a>
            </div>

            {/* Feature Check List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Installation Needed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>99.8% AI Detection Accuracy</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Real-Time Incident Flags</span>
              </div>
            </div>
          </div>

          {/* Right Column - Swiper Hero Preview Slider */}
          <div className="lg:col-span-5 relative">
            {/* Swiper Visual Showcase Card */}
            <div className="glass-panel-glow p-2 sm:p-4 rounded-3xl border border-sky-500/30 relative">
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                className="rounded-2xl overflow-hidden"
              >
                {/* Slide 1: AI Face & Gaze Tracking */}
                <SwiperSlide>
                  <div className="relative bg-slate-900 aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4">
                    {/* Simulated Camera Overlay Header */}
                    <div className="flex items-center justify-between z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        LIVE WEBCAM FEED #042
                      </div>
                      <Badge variant="glow" className="text-[10px]">
                        AI GAZE LOCK ACTIVE
                      </Badge>
                    </div>

                    {/* Camera Feed Visual Canvas Simulation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Grid overlay */}
                      <div className="w-full h-full opacity-20 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:16px_16px]" />

                      {/* Bounding Box Simulation */}
                      <div className="absolute w-44 h-44 rounded-2xl border-2 border-dashed border-sky-400 flex items-center justify-center animate-pulse">
                        <div className="w-full h-full relative">
                          <span className="absolute -top-3 left-2 bg-sky-500 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white">
                            FACE: VERIFIED (99.8%)
                          </span>
                          <span className="absolute -bottom-3 right-2 bg-slate-950 border border-sky-500/50 text-[10px] font-mono text-sky-400 px-1.5 py-0.5 rounded">
                            GAZE VEC: [0.02, -0.01]
                          </span>
                          {/* Target corners */}
                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sky-400" />
                        </div>
                      </div>
                    </div>

                    {/* Footer Stats Overlay */}
                    <div className="z-10 bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Session Risk Score:</span>
                        <span className="font-mono text-emerald-400 font-bold">0% (Low Risk)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full w-[2%]" />
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Slide 2: Multi-Person / Phone Threat Detector */}
                <SwiperSlide>
                  <div className="relative bg-slate-900 aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 font-mono text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        THREAT DETECTION ENGINE
                      </div>
                      <Badge variant="destructive" className="text-[10px]">
                        FLAGGED
                      </Badge>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl max-w-xs text-center space-y-2 backdrop-blur-md">
                        <Video className="w-8 h-8 text-rose-400 mx-auto animate-bounce" />
                        <h4 className="font-semibold text-sm text-white">Secondary Person Detected</h4>
                        <p className="text-[11px] text-slate-300">
                          AI vision flagged a second person in camera frame at timestamp 00:14:32.
                        </p>
                        <div className="font-mono text-[10px] text-rose-400 bg-slate-950/80 py-1 rounded border border-rose-900">
                          CONFIDENCE: 94.2% • ACTION: AUTO-LOGGED
                        </div>
                      </div>
                    </div>

                    <div className="z-10 bg-slate-950/90 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Session Status:</span>
                        <span className="font-mono text-rose-400 font-bold">Review Required</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Slide 3: Secure Kiosk Lockdown Browser */}
                <SwiperSlide>
                  <div className="relative bg-slate-900 aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 font-mono text-cyan-400">
                        <Lock className="w-3.5 h-3.5" />
                        KIOSK BROWSER LOCK
                      </div>
                      <Badge variant="glow" className="text-[10px]">
                        TAB FOCUS PROTECTED
                      </Badge>
                    </div>

                    <div className="space-y-3 z-10 my-auto">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Copy / Paste Shortcuts</span>
                          <span className="text-rose-400 font-mono font-bold">DISABLED</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>External Monitor / Display</span>
                          <span className="text-rose-400 font-mono font-bold">BLOCKED</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>DevTools & Extension Monitoring</span>
                          <span className="text-emerald-400 font-mono font-bold">SECURED</span>
                        </div>
                      </div>
                    </div>

                    <div className="z-10 bg-slate-950/90 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Environment Integrity:</span>
                        <span className="font-mono text-cyan-400 font-bold">100% Secured</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>

              {/* Floating Badge Chips around the card */}
              <div className="hidden sm:flex absolute -top-4 -right-4 glass-panel bg-slate-900/90 px-3 py-1.5 rounded-xl border border-sky-500/40 shadow-xl items-center gap-2 text-xs font-semibold text-white animate-float">
                <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
                <span>Zero Latency AI Processing</span>
              </div>
              <div
                className="hidden sm:flex absolute -bottom-4 -left-4 glass-panel bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-xl items-center gap-2 text-xs font-semibold text-white animate-float"
                style={{ animationDelay: '2.5s' }}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Anti-Spoofing Biometrics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
