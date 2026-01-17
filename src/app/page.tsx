import Services from "@/components/home/services";
import Stats from "@/components/home/stats";
import Hero from "@/components/home/hero";
import Highlights from "@/components/home/highlights";
import HowItWorks from "@/components/home/how-it-works";
import Cta from "@/components/home/cta";
import { Testimonials } from "@/components/home/testimonials";


import { QuizBanner } from "@/components/home/quiz-banner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <QuizBanner />
      <Hero />
      <Stats />
      <Highlights />
      <HowItWorks />
      <Services />
      <Testimonials />
      <Cta />
    </main>
  );
}
