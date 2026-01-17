"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Radiation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useLanguage } from '@/contexts/language-context';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      title: t.services.items.pharmacy.title,
      description: t.services.items.pharmacy.desc,
      href: '/pharmacy',
      imgSrc: 'https://media.istockphoto.com/id/1036131880/photo/efficient-pharmacy-operations-thanks-to-teamwork.jpg?s=612x612&w=0&k=20&c=JQPtkW7j14dvFWeLd6JlltULHMw07rJdi5ey7QLqCHc=',
      imgHint: 'pharmacy staff working',
    },
    {
      title: t.services.items.consultants.title,
      description: t.services.items.consultants.desc,
      href: '/specialized-clinics',
      imgSrc: 'https://media.istockphoto.com/id/2185377913/photo/hospital-nurse-and-mature-man-in-lobby-with-paperwork-for-appointment-consultation-and.jpg?s=612x612&w=0&k=20&c=qouevBBCKExaCSqj-2ucZyvYKB4f4Plf5KjPVL0yFQ8=',
      imgHint: 'nurse patient consultation',
    },
    {
      title: t.services.items.surgery.title,
      description: t.services.items.surgery.desc,
      href: '/surgery',
      imgSrc: 'https://media.istockphoto.com/id/1461681870/photo/team-of-surgeons-looking-at-an-image-in-the-monitor-at-the-operating-room.jpg?s=612x612&w=0&k=20&c=vnlO2ZdPxg4hFWrnOuRaSKrvic8bZUTq8ylHzzgPAnY=',
      imgHint: 'operating room surgery',
    },
    {
      title: t.services.items.lab.title,
      description: t.services.items.lab.desc,
      href: '/lab-services',
      imgSrc: 'https://media.istockphoto.com/id/2178146294/photo/health-engineer-bioprinting-models-at-a-3d-laboratory.jpg?s=612x612&w=0&k=20&c=Qm2_TwjhuCaMegVVEVPZ-opa6susessdOCZTh4ed5II=',
      imgHint: 'laboratory analysis microscope',
    },
    {
      title: t.services.items.radiology.title,
      description: t.services.items.radiology.desc,
      href: '/radiology',
      imgSrc: 'https://media.istockphoto.com/id/1477483008/photo/doctors-xray-or-technology-of-3d-lungs-hologram-in-tuberculosis-cancer-or-heart-research-in.jpg?s=612x612&w=0&k=20&c=raHbMpE6I0grfEisaw44BCRwFTpm8-5AXKpTA080nsc=',
      imgHint: 'doctor examining xray',
    },
    {
      title: t.services.items.directory.title,
      description: t.services.items.directory.desc,
      href: '/doctors-directory',
      imgSrc: 'https://media.istockphoto.com/id/1300457522/photo/doctor-is-holding-large-stack-of-folders.jpg?s=612x612&w=0&k=20&c=wXdo5WtP9NBqP7oVhX9outXpWN_m-cIsvQ8gCMf0C7E=',
      imgHint: 'doctor files',
    },
    {
      title: t.services.items.homeVisit.title,
      description: t.services.items.homeVisit.desc,
      href: '/home-visit',
      imgSrc: 'https://media.istockphoto.com/id/1152844782/photo/im-glad-to-see-you-doing-well.jpg?s=612x612&w=0&k=20&c=r7KVPoP1UT4qANvyr3jeXokWVdnUOJ732on6Ve-ynCY=',
      imgHint: 'doctor visiting patient home',
    },
    {
      title: t.services.items.nursing.title,
      description: t.services.items.nursing.desc,
      href: '/nursing-care',
      imgSrc: 'https://media.istockphoto.com/id/1719538017/photo/home-care-healthcare-professional-hugging-senior-patient.jpg?s=612x612&w=0&k=20&c=DTQwVD1DTH0CMQ78aox8-cVKg8Nl-wCkSwY-S072M4E=',
      imgHint: 'nurse senior patient',
    },
    {
      title: t.services.items.physio.title,
      description: t.services.items.physio.desc,
      href: '/physiotherapy',
      imgSrc: 'https://media.istockphoto.com/id/2181897384/photo/holding-puzzle-piece-shaped-like-brain-with-sunlight-background.jpg?s=612x612&w=0&k=20&c=RAE1KhZPoIKk_dXfOVyL2WMfEJ-RgLoFt4xwxt2-gzA=',
      imgHint: 'brain health puzzle',
    },
  ];

  return (
    <section id="services" className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary font-semibold">{t.services.badge}</Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground">{t.services.title}</h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            {t.services.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link href={service.href} key={service.title} className="group block">
              <Card className="h-full bg-card rounded-xl border overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <div className="relative w-full h-48">
                  <Image
                    src={service.imgSrc}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={service.imgHint}
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold font-headline text-xl text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4 text-base leading-relaxed">{service.description}</p>
                  <div className="flex items-center text-primary font-semibold group-hover:text-primary transition-colors text-sm">
                    {t.services.more}
                    <ArrowLeft className="mr-2 h-4 w-4 transform transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 rtl:rotate-180" />
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
