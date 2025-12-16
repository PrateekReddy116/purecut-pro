import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { LogoCarousel } from "@/components/LogoCarousel";
import { WhyUseSection } from "@/components/WhyUseSection";
import { BentoGrid } from "@/components/BentoGrid";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <LogoCarousel />
      <BentoGrid />
      <WhyUseSection />
      <Footer />
    </div>
  );
};

export default Index;
