import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ProductReveal } from "@/components/ProductReveal";
import { TechnicalAchievements } from "@/components/TechnicalAchievements";
import { Architecture } from "@/components/Architecture";
import { Frameworks, Footer } from "@/components/Frameworks";

export default function LandingPage() {
  return (
    <main className="bg-mesh min-h-screen selection:bg-brand-primary/30 selection:text-brand-primary overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <ProductReveal />
      <TechnicalAchievements />
      <Architecture />
      <Frameworks />
      <Footer />
    </main>
  );
}
