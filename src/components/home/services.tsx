import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    title: 'الصيدلية الرقمية',
    description: 'اطلب أدويتك ومنتجات العناية بسهولة عبر واتساب.',
    href: '#',
    image: 'https://picsum.photos/seed/pharmacy/600/400',
    imageHint: 'pharmacy counter',
    gradient: 'from-blue-500/10 to-transparent'
  },
  {
    title: 'الخدمات المخبرية',
    description: 'حجز زيارات لجمع العينات واستلام النتائج رقمياً.',
    href: '#',
    image: 'https://picsum.photos/seed/lab/600/400',
    imageHint: 'laboratory microscope',
    gradient: 'from-cyan-500/10 to-transparent'
  },
  {
    title: 'العيادات',
    description: 'ابحث عن طبيبك واحجز موعدك في العيادة بنقرة زر.',
    href: '#',
    image: 'https://picsum.photos/seed/clinic/600/400',
    imageHint: 'clinic reception',
    gradient: 'from-purple-500/10 to-transparent'
  },
  {
    title: 'العلاج الطبيعي',
    description: 'جلسات علاج طبيعي منزلية مع أفضل المختصين.',
    href: '#',
    image: 'https://picsum.photos/seed/physio/600/400',
    imageHint: 'physiotherapy session',
    gradient: 'from-green-500/10 to-transparent'
  },
  {
    title: 'التمريض المنزلي',
    description: 'رعاية تمريضية متكاملة في راحة منزلك.',
    href: '#',
    image: 'https://picsum.photos/seed/nursing/600/400',
    imageHint: 'nurse patient',
    gradient: 'from-yellow-500/10 to-transparent'
  },
  {
    title: 'استشارة طبيب',
    description: 'تحدث مع طبيب عبر الفيديو للحصول على استشارة فورية.',
    href: '#',
    image: 'https://picsum.photos/seed/consult/600/400',
    imageHint: 'doctor online',
    gradient: 'from-red-500/10 to-transparent'
  },
  {
    title: 'حجز المواعيد',
    description: 'نظم جميع مواعيدك الطبية في مكان واحد.',
    href: '#',
    image: 'https://picsum.photos/seed/booking/600/400',
    imageHint: 'calendar appointment',
    gradient: 'from-indigo-500/10 to-transparent'
  },
  {
    title: 'الأجهزة الطبية',
    description: 'استأجر أو اشترِ أجهزة طبية عالية الجودة.',
    href: '#',
    image: 'https://picsum.photos/seed/medical-devices/600/400',
    imageHint: 'medical equipment',
    gradient: 'from-pink-500/10 to-transparent'
  }
];

export default function Services() {
  return (
    <section id="services" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-headline">خدماتنا الأساسية</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              نوفر لك كل ما تحتاجه من رعاية صحية في مكان واحد، بسهولة وأمان.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Link href={service.href} key={service.title} className="group block">
                <Card className={`relative overflow-hidden h-full bg-card rounded-2xl border transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/20 transform hover:-translate-y-2`}>
                   <div className={`absolute inset-0 bg-gradient-to-b ${service.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative">
                    <Image 
                      src={service.image}
                      alt={service.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                      data-ai-hint={service.imageHint}
                    />
                    <CardContent className="p-6">
                      <h3 className="font-bold font-headline text-2xl text-foreground mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <div className="flex items-center text-primary font-semibold group-hover:text-primary transition-colors">
                        اعرف المزيد
                        <ArrowLeft className="mr-2 h-5 w-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
  );
}
