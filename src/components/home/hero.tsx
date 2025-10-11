"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import Image from 'next/image';

export default function Hero() {
  const { user } = useUser();

  return (
    <section 
      className="relative w-full bg-background overflow-hidden"
    >
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center py-20 md:py-32">
            <div className="relative z-10 text-center md:text-right">
                <h1 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-sm text-primary">
                رعاية صحية تثق بها، بين يديك
                </h1>
                <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto md:mx-0 drop-shadow-sm text-muted-foreground">
                نوفر لك الوصول السريع والموثوق للخدمات الصحية المتنوعة، من الصيدلية إلى العيادة، مباشرة من منزلك.
                </p>
                <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                    <Link href="/#services">
                    ابدأ الآن
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 bg-background/50">
                    <Link href="/about">اعرف المزيد</Link>
                </Button>
                </div>
            </div>
            <div className="relative h-80 md:h-[500px]">
                <Image 
                    src="https://picsum.photos/seed/hero-doctor/1000/1000"
                    alt="طبيبة مبتسمة"
                    fill
                    style={{objectFit: 'contain'}}
                    className="drop-shadow-2xl"
                    data-ai-hint="doctor smiling"
                    priority
                />
            </div>
        </div>
    </section>
  );
}
