import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import placeholderData from '@/lib/placeholder-images.json';

export default function Hero() {
  const heroImage = placeholderData.placeholderImages.find(p => p.id === 'hero-1');

  return (
    <section className="relative w-full h-[60vh] md:h-[50vh] flex items-center justify-center text-center">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover brightness-50"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="relative z-10 container mx-auto px-4 text-primary-foreground">
        <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-lg">
          أهلاً بك في <span className="text-primary-foreground/90">صحتي</span>
        </h1>
        <p className="mt-4 text-lg md:text-2xl max-w-3xl mx-auto drop-shadow-md text-primary-foreground/80">
          منصتك الصحية المتكاملة، لرعاية أفضل وحياة أسعد.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="shadow-lg transition-transform hover:scale-105">
            <Link href="#services">
              استكشف خدماتنا
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="shadow-lg transition-transform hover:scale-105">
            <Link href="#">حجز موعد</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
