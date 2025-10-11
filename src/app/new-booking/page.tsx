
"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Stethoscope, FlaskConical, HeartPulse, TestTube, ArrowLeft, Ambulance, Building, Radiation } from "lucide-react"
import Image from "next/image"

const services = [
    {
        icon: <Stethoscope className="h-10 w-10 text-primary" />,
        title: 'العيادات المتخصصة',
        description: 'احجز موعدًا مع أحد أطبائنا الخبراء في مختلف التخصصات.',
        href: '/specialized-clinics',
        imgSrc: 'https://media.istockphoto.com/id/2185377913/photo/hospital-nurse-and-mature-man-in-lobby-with-paperwork-for-appointment-consultation-and.jpg?s=612x612&w=0&k=20&c=qouevBBCKExaCSqj-2ucZyvYKB4f4Plf5KjPVL0yFQ8=',
        imgHint: 'nurse patient consultation',
      },
      {
        icon: <HeartPulse className="h-10 w-10 text-primary" />,
        title: 'العلاج الطبيعي',
        description: 'جدولة جلسات ومتابعة خطط العلاج الطبيعي مع مختصين.',
        href: '/physiotherapy',
        imgSrc: 'https://media.istockphoto.com/id/2181897384/photo/holding-puzzle-piece-shaped-like-brain-with-sunlight-background.jpg?s=612x612&w=0&k=20&c=RAE1KhZPoIKk_dXfOVyL2WMfEJ-RgLoFt4xwxt2-gzA=',
        imgHint: 'physical therapy patient',
      },
      {
        icon: <FlaskConical className="h-10 w-10 text-primary" />,
        title: 'الرعاية التمريضية',
        description: 'اطلب خدمات تمريضية منزلية احترافية لرعاية أحبائك.',
        href: '/nursing-care',
        imgSrc: 'https://media.istockphoto.com/id/1719538017/photo/home-care-healthcare-professional-hugging-senior-patient.jpg?s=612x612&w=0&k=20&c=DTQwVD1DTH0CMQ78aox8-cVKg8Nl-wCkSwY-S072M4E=',
        imgHint: 'nurse home care',
      },
      {
        icon: <TestTube className="h-10 w-10 text-primary" />,
        title: 'التحاليل المخبرية',
        description: 'احجز زيارة منزلية لسحب العينات واحصل على نتائج دقيقة.',
        href: '/lab-services',
        imgSrc: 'https://media.istockphoto.com/id/2178146294/photo/health-engineer-bioprinting-models-at-a-3d-laboratory.jpg?s=612x612&w=0&k=20&c=Qm2_TwjhuCaMegVVEVPZ-opa6susessdOCZTh4ed5II=',
        imgHint: 'laboratory analysis microscope',
      },
      {
        icon: <Radiation className="h-10 w-10 text-primary" />,
        title: 'الأشعة المنزلية',
        description: 'اطلب أشعة (سونار، X-ray) في منزلك مع فريق متخصص.',
        href: '/radiology',
        imgSrc: 'https://media.istockphoto.com/id/1477483008/photo/doctors-xray-or-technology-of-3d-lungs-hologram-in-tuberculosis-cancer-or-heart-research-in.jpg?s=612x612&w=0&k=20&c=raHbMpE6I0grfEisaw44BCRwFTpm8-5AXKpTA080nsc=',
        imgHint: 'doctor examining xray',
      },
      {
        icon: <Ambulance className="h-10 w-10 text-primary" />,
        title: 'الكشف المنزلي',
        description: 'اطلب زيارة طبيب إلى منزلك للحالات غير الطارئة.',
        href: '/home-visit',
        imgSrc: 'https://media.istockphoto.com/id/1152844782/photo/im-glad-to-see-you-doing-well.jpg?s=612x612&w=0&k=20&c=r7KVPoP1UT4qANvyr3jeXokWVdnUOJ732on6Ve-ynCY=',
        imgHint: 'doctor home visit',
      },
      {
        icon: <Building className="h-10 w-10 text-primary" />,
        title: 'دليل الأطباء',
        description: 'ابحث عن معلومات التواصل مع الأطباء والصيدليات.',
        href: '/doctors-directory',
        imgSrc: 'https://media.istockphoto.com/id/1300457522/photo/doctor-is-holding-large-stack-of-folders.jpg?s=612x612&w=0&k=20&c=wXdo5WtP9NBqP7oVhX9outXpWN_m-cIsvQ8gCMf0C7E=',
        imgHint: 'medical directory book',
      }
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
