import { Header } from '../components/header';
import { HeroSection } from '../components/hero-section';
import { FeaturesSection } from '../components/features-section';
import { StatsSection } from '../components/stats-section';
import { HowItWorksSection } from '../components/how-it-works-section';
import { TechStackSection } from '../components/tech-stack-section';
import { CtaSection } from '../components/cta-section';
import { Footer } from '../components/footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <HowItWorksSection />
        <TechStackSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
