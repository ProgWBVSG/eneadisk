import React from 'react';
import { HeroSection } from '../../components/landing/HeroSection';
import { ValueProposition } from '../../components/landing/ValueProposition';
import { FeaturesGrid } from '../../components/landing/FeaturesGrid';
import { CallToAction } from '../../components/landing/CallToAction';

export const HomeLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <HeroSection />
      <ValueProposition />
      <FeaturesGrid />
      <CallToAction />
    </div>
  );
};
