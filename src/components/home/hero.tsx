"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import placeholderData from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';

export default function Hero() {
  const heroImage = placeholderData.placeholderImages.find(p => p.id === 'hero-1');
  const { user } = useUser();

  return (
    <section className="relative w-full h-[70vh] md:h-[60vh] flex items-center justify-center text-center bg-gradient-to-t from-primary/10 to-transparent">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover object-top opacity-20"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="relative z-10 container mx-auto px-4 text-foreground">
        <h1 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-sm text-primary">
          أهلاً بك في صحتي
        </h1>
        <p className="mt-6 text-lg md:text-2xl max-w-3xl mx-auto drop-shadow-sm text-muted-foreground">
          منصتك الصحية المتكاملة، لرعاية أفضل وحياة أسعد.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="shadow-lg transition-transform hover:scale-105 rounded-full px-8">
            <Link href="#services">
              استكشف خدماتنا
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-lg transition-transform hover:scale-105 rounded-full px-8">
            <Link href={user ? "/my-bookings" : "/login"}>حجز موعد</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
