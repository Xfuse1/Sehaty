"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function Cta() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Image Section */}
          <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px]">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl transform -rotate-3 scale-95 z-0"></div>
            <Image
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80"
              alt="Happy Doctor"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-3xl shadow-2xl relative z-10"
            />
          </div>

          {/* Content Section */}
          <div className="w-full md:w-1/2 text-start px-4">
            <h2 className="text-3xl md:text-5xl font-bold font-headline text-foreground mb-6 leading-tight">
              {t.cta.title} <br />
              <span className="text-primary">{t.cta.subtitle}</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t.cta.desc}
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-foreground font-medium">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                {t.cta.point1}
              </li>
              <li className="flex items-center gap-3 text-foreground font-medium">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                {t.cta.point2}
              </li>
              <li className="flex items-center gap-3 text-foreground font-medium">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                {t.cta.point3}
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg rounded-xl">
                <Link href="/specialized-clinics">
                  {t.cta.buttonPrimary}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 hover:bg-muted">
                <Link href="/contact" className="flex items-center gap-2">
                  {t.cta.buttonSecondary}
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
