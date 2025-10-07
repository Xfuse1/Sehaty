import Hero from "@/components/home/hero";
import Services from "@/components/home/services";
import Highlights from "@/components/home/highlights";
import Stats from "@/components/home/stats";
import Cta from "@/components/home/cta";


export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Highlights />
      <Stats />
      <Cta />
    </>
  );
}
