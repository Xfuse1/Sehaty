"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export default function Hero() {
  const { user } = useUser();

  return (
    <section 
      className="relative w-full py-24 md:py-40 flex items-center justify-center text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-foreground">
        <h1 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-sm">
          رعاية صحية تثق بها، بين يديك
        </h1>
        <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-sm text-muted-foreground">
          نوفر لك الوصول السريع والموثوق للخدمات الصحية المتنوعة، من الصيدلية إلى العيادة، مباشرة من منزلك.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <Link href={user ? "/my-bookings" : "/login"}>
              احجز الآن
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 border-2 border-primary/50">
            <Link href="#">تواصل معنا</Link>
          </Button>
        </div>
      </div>

      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
