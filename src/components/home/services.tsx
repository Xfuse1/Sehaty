import Link from 'next/link';
import {
  Pill,
  HeartPulse,
  Scissors,
  CalendarDays,
  Home,
  Stethoscope,
  Beaker,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    icon: <Pill className="h-10 w-10 text-primary" />,
    title: 'الصيدلية الرقمية',
    description: 'اطلب أدويتك ومنتجات العناية بسهولة عبر واتساب.',
    href: '#',
  },
  {
    icon: <HeartPulse className="h-10 w-10 text-primary" />,
    title: 'العلاج الطبيعي',
    description: 'احجز باقات علاج طبيعي مخصصة مع أفضل الأخصائيين.',
    href: '#',
    badge: 'قريباً',
  },
  {
    icon: <Scissors className="h-10 w-10 text-primary" />,
    title: 'العمليات الجراحية',
    description: 'استشارات وحجز عمليات جراحية وتجميلية بأمان.',
    href: '#',
  },
  {
    icon: <CalendarDays className="h-10 w-10 text-primary" />,
    title: 'حجز المواعيد',
    description: 'ابحث عن طبيبك واحجز موعدك في العيادة بنقرة زر.',
    href: '#',
  },
  {
    icon: <Home className="h-10 w-10 text-primary" />,
    title: 'الرعاية التمريضية',
    description: 'خدمات تمريضية منزلية احترافية لرعايتكم.',
    href: '#',
  },
  {
    icon: <Stethoscope className="h-10 w-10 text-primary" />,
    title: 'الكشف المنزلي',
    description: 'اطلب زيارة طبية منزلية للحصول على تشخيص وعلاج.',
    href: '#',
  },
  {
    icon: <Beaker className="h-10 w-10 text-primary" />,
    title: 'الخدمات المخبرية',
    description: 'حجز زيارات لجمع العينات واستلام النتائج رقمياً.',
    href: '#',
  },
  {
    icon: <Building className="h-10 w-10 text-primary" />,
    title: 'دليل العيادات',
    description: 'دليل الأطباء والعيادات للتواصل المباشر.',
    href: '#',
  },
];

export default function Services() {
  return (
    <section id="services" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">خدماتنا الصحية المتكاملة</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              نوفر لك كل ما تحتاجه من رعاية صحية في مكان واحد، بسهولة وأمان.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {services.map((service) => (
              <Link href={service.href} key={service.title} className="group block">
                <Card className="h-full text-center bg-card hover:shadow-primary/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-primary/30">
                  <CardHeader className="items-center pt-8">
                    <div className="bg-primary/10 p-4 rounded-full transition-colors duration-300 group-hover:bg-primary/20">
                      {service.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 pb-8 px-4">
                    <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                    <CardDescription className="flex-grow min-h-[40px]">{service.description}</CardDescription>
                    {service.badge && (
                      <div className="pt-2">
                         <Badge variant="outline" className="border-accent text-accent">{service.badge}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
  );
}
