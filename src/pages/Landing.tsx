import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AIProctoringSection } from '@/components/landing/AIProctoringSection';
import { StudentExperienceSection } from '@/components/landing/StudentExperienceSection';
import { FacultyMonitoringSection } from '@/components/landing/FacultyMonitoringSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { AnalyticsSection } from '@/components/landing/AnalyticsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/layout/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <AIProctoringSection />
        <StudentExperienceSection />
        <FacultyMonitoringSection />
        <SecuritySection />
        <AnalyticsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
