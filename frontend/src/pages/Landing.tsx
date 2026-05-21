import { StickyNav } from '@/components/landing/StickyNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingDemoVideo } from '@/components/landing/LandingDemoVideo';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { DemoSections } from '@/components/landing/DemoSections';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WorkshopFeatures } from '@/components/landing/WorkshopFeatures';
import { AIFeatures } from '@/components/landing/AIFeatures';
import { AnalyticsPreview } from '@/components/landing/AnalyticsPreview';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { CallToAction } from '@/components/landing/CallToAction';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Sticky nav appears after scrolling */}
      <StickyNav />

      {/* 1 - Hero: Strong hook + 2 CTAs */}
      <LandingHero />

      {/* 2 - Demo Video: Visual social proof */}
      <LandingDemoVideo />

      {/* 3 - Feature Cards: What it does */}
      <FeatureCards />

      {/* 4 - Interactive Demo: Try before buying */}
      <DemoSections />

      {/* 5 - Problem vs Solution: Why they need this */}
      <ProblemSolution />

      {/* 6 - How It Works: 4-step process */}
      <HowItWorks />

      {/* 7 - Workshop Features: Workshop-specific tools */}
      <WorkshopFeatures />

      {/* 8 - AI Features: Intelligence differentiator */}
      <AIFeatures />

      {/* 9 - Analytics: Data power preview */}
      <AnalyticsPreview />

      {/* 10 - Social Proof: Trust and credibility */}
      <Testimonials />

      {/* 11 - Pricing: Plans with billing toggle */}
      <Pricing />

      {/* 12 - Final CTA: Last conversion push */}
      <CallToAction />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default Landing;
