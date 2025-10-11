import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Cta() {
  return (
    <section className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
          احجز استشارتك الآن
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          لا تنتظر أكثر. فريقنا من الأطباء المختصين جاهز لتقديم المساعدة التي تحتاجها.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <Link href="/new-booking">
              ابدأ الحجز
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
