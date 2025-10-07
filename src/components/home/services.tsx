import Link from 'next/link';
import {
  ArrowLeft,
  Pill,
  Beaker,
  Stethoscope,
  CalendarDays,
  Video,
  FileText,
  BadgePercent,
  Siren
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    title: 'العيادات المتخصصة',
    description: 'ابحث عن أفضل الأطباء في مختلف التخصصات.',
    href: '#',
    icon: <Stethoscope className="w-12 h-12 text-primary" />,
  },
  {
    title: 'الصيدلية',
    description: 'اطلب أدويتك ومنتجات العناية لتصلك أينما كنت.',
    href: '#',
    icon: <Pill className="w-12 h-12 text-primary" />,
  },
  {
    title: 'المعمل والتحاليل',
    description: 'احجز لزيارة منزلية لأخذ العينات واستلم النتائج أونلاين.',
    href: '#',
    icon: <Beaker className="w-12 h-12 text-primary" />,
  },
  {
    title: 'حجز مواعيد أونلاين',
    description: 'نظم جدولك الطبي بسهولة ويسر عبر التطبيق.',
    href: '#',
    icon: <CalendarDays className="w-12 h-12 text-primary" />,
  },
  {
    title: 'الاستشارات عن بُعد',
    description: 'تحدث مع طبيب معتمد عبر الفيديو من راحة منزلك.',
    href: '#',
    icon: <Video className="w-12 h-12 text-primary" />,
  },
  {
    title: 'السجلات الطبية',
    description: 'جميع تقاريرك ونتائجك الطبية في مكان واحد آمن.',
    href: '#',
    icon: <FileText className="w-12 h-12 text-primary" />,
  },
  {
    title: 'العروض والباقات',
    description: 'استفد من باقات صحية مصممة خصيصاً لك ولعائلتك.',
    href: '#',
    icon: <BadgePercent className="w-12 h-12 text-primary" />,
  },
  {
    title: 'الطوارئ والدعم',
    description: 'وصول سريع لخدمات الطوارئ والدعم الفوري عند الحاجة.',
    href: '#',
    icon: <Siren className="w-12 h-12 text-primary" />,
  }
];

export default function Services() {
  return (
    <section id="services" className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-headline">خدماتنا الصحية المتكاملة</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              نوفر لك كل ما تحتاجه من رعاية صحية في مكان واحد، بسهولة وأمان.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Link href={service.href} key={service.title} className="group block">
                <Card className="h-full bg-background rounded-2xl border-transparent transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/20 transform hover:-translate-y-2">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center items-center mb-6 transition-transform duration-300 group-hover:scale-110">
                      {service.icon}
                    </div>
                    <h3 className="font-bold font-headline text-xl text-foreground mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>
                    <div className="flex items-center justify-center text-primary font-semibold group-hover:text-primary transition-colors">
                      اعرف المزيد
                      <ArrowLeft className="mr-2 h-4 w-4 transform transition-transform duration-300 group-hover:-translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
  );
}
