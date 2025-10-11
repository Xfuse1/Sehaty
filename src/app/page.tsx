import Services from "@/components/home/services";
import Stats from "@/components/home/stats";
import Hero from "@/components/home/hero";
import Highlights from "@/components/home/highlights";
import Cta from "@/components/home/cta";


export default function Home() {
  return (
    <>
      <Hero />
      <Highlights />
      <Services />
      <Stats />
      <Cta />
    </>
  );
}
