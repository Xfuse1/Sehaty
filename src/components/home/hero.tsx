"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export default function Hero() {
  const { user } = useUser();

  return (
    <section 
      className="relative w-full py-24 md:py-40 flex items-center justify-center text-center bg-cover bg-center"
      style={{backgroundImage: "url('/background-grid.svg')"}}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-[2px]"></div>

      <div className="relative z-10 container mx-auto px-4 text-foreground">
        <h1 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-sm">
          حلول صحية متكاملة في مكان واحد
        </h1>
        <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-sm text-muted-foreground">
          نوفر لك الوصول السريع والموثوق للخدمات الصحية المتنوعة، من الصيدلية إلى العيادة، مباشرة من منزلك.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <Link href="#services">
              استكشف خدماتنا
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 border-2">
            <Link href={user ? "/my-bookings" : "/login"}>حجز موعد</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
