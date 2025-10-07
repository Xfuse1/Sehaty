
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    title: 'الصيدلية الرقمية',
    description: 'عرض الأدوية والمستحضرات الطبية مع نظام إرشاد للاستخدام الآمن.',
    href: '/pharmacy',
    imgSrc: 'https://media.istockphoto.com/id/1036131880/photo/efficient-pharmacy-operations-thanks-to-teamwork.jpg?s=612x612&w=0&k=20&c=JQPtkW7j14dvFWeLd6JlltULHMw07rJdi5ey7QLqCHc=',
    imgHint: 'pharmacy shelves medicine',
  },
  {
    title: 'حجز العيادات المتخصصة',
    description: 'تصفح التخصصات، اختر الأطباء المعتمدين، واطلع على تقييماتهم.',
    href: '/specialized-clinics',
    imgSrc: 'https://picsum.photos/seed/clinics/600/400',
    imgHint: 'specialized clinic interior',
  },
  {
    title: 'العمليات الجراحية',
    description: 'استشارات ما قبل العمليات، نظام حجز متخصص، وعمليات تجميل.',
    href: '/surgery',
    imgSrc: 'https://picsum.photos/seed/surgery/600/400',
    imgHint: 'operating room surgery',
  },
  {
    title: 'التحاليل المخبرية',
    description: 'حجز زيارات لسحب العينات، نتائج رقمية، وتفسير للنتائج.',
    href: '/lab-services',
    imgSrc: 'https://picsum.photos/seed/lab/600/400',
    imgHint: 'laboratory analysis microscope',
  },
  {
    title: 'دليل الأطباء',
    description: 'دليل أرقام وعناوين جميع الأطباء، بما في ذلك عدد كبير غير متعاقدين معنا.',
    href: '/doctors-directory',
    imgSrc: 'https://picsum.photos/seed/booking/600/400',
    imgHint: 'online booking calendar',
  },
  {
    title: 'الكشف المنزلي',
    description: 'زيارات طبية منزلية، تشخيص أولي عن بعد، وتوصيات للمتابعة.',
    href: '/home-visit',
    imgSrc: 'https://picsum.photos/seed/homevisit/600/400',
    imgHint: 'doctor visiting patient home',
  },
  {
    title: 'الرعاية التمريضية المنزلية',
    description: 'حجز جلسات تمريض منزلية، ومتابعة الحالات المزمنة ورعاية ما بعد العمليات.',
    href: '/nursing-care',
    imgSrc: 'https://picsum.photos/seed/nursing/600/400',
    imgHint: 'nurse home care',
  },
  {
    title: 'العلاج الطبيعي',
    description: 'جدولة جلسات العلاج الطبيعي ومتابعة خطط العلاج وإرشادات منزلية.',
    href: '/physiotherapy',
    imgSrc: 'https://picsum.photos/seed/physiotherapy/600/400',
    imgHint: 'physical therapy patient',
  },
];

export default function Services() {
  return (
    <section id="services" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">خدماتنا الطبية</Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground">خدماتنا الطبية</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              نقدم مجموعة شاملة من الخدمات الطبية لتلبية جميع احتياجاتك الصحية
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Link href={service.href} key={service.title} className="group block">
                <Card className="h-full bg-card rounded-xl border overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                  <div className="relative w-full h-48">
                    <Image 
                      src={service.imgSrc}
                      alt={service.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={service.imgHint}
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold font-headline text-xl text-foreground mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>
                    <div className="flex items-center text-primary font-semibold group-hover:text-primary transition-colors text-sm">
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
