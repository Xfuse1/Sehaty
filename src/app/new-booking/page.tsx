
"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Stethoscope, FlaskConical, HeartPulse, TestTube, ArrowLeft } from "lucide-react"
import Image from "next/image"

const services = [
    {
        icon: <Stethoscope className="h-10 w-10 text-primary" />,
        title: 'العيادات المتخصصة',
        description: 'احجز موعدًا مع أحد أطبائنا الخبراء في مختلف التخصصات.',
        href: '/specialized-clinics',
        imgSrc: 'https://picsum.photos/seed/clinics/600/400',
        imgHint: 'specialized clinic interior',
      },
      {
        icon: <HeartPulse className="h-10 w-10 text-primary" />,
        title: 'العلاج الطبيعي',
        description: 'جدولة جلسات ومتابعة خطط العلاج الطبيعي مع مختصين.',
        href: '/physiotherapy',
        imgSrc: 'https://picsum.photos/seed/physiotherapy/600/400',
        imgHint: 'physical therapy patient',
      },
      {
        icon: <FlaskConical className="h-10 w-10 text-primary" />,
        title: 'الرعاية التمريضية',
        description: 'اطلب خدمات تمريضية منزلية احترافية لرعاية أحبائك.',
        href: '/nursing-care',
        imgSrc: 'https://picsum.photos/seed/nursing/600/400',
        imgHint: 'nurse home care',
      },
      {
        icon: <TestTube className="h-10 w-10 text-primary" />,
        title: 'التحاليل المخبرية',
        description: 'احجز زيارة منزلية لسحب العينات واحصل على نتائج دقيقة.',
        href: '#',
        imgSrc: 'https://picsum.photos/seed/lab/600/400',
        imgHint: 'laboratory analysis microscope',
      },
]

export default function NewBookingPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  if (isUserLoading || !user) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <p>جار التحميل...</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary">حجز موعد جديد</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            اختر الخدمة التي ترغب في حجزها وابدأ رحلتك نحو صحة أفضل.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map(service => (
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
                            اختر الخدمة
                            <ArrowLeft className="mr-2 h-4 w-4 transform transition-transform duration-300 group-hover:-translate-x-1" />
                        </div>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  )
}
