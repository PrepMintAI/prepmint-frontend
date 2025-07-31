// app/page.tsx
import LandingHeader from "@/components/layout/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import GamifiedXP from "@/components/landing/GamifiedXP";
import HowItWorks from "@/components/landing/HowItWorks";
import B2BSection from "@/components/landing/B2BSection";
import Testimonials from "@/components/landing/Testimonials";
import LandingFooter from "@/components/layout/LandingFooter";

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900">
      <LandingHeader />
      <main className="space-y-24">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <GamifiedXP />            
        <Testimonials />
        <B2BSection />
      </main>
      <LandingFooter />
    </div>
  );
}
