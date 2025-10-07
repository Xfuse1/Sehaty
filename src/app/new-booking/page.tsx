"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Stethoscope, FlaskConical, TestTube, ArrowLeft } from "lucide-react"

const services = [
    {
        icon: <Stethoscope className="h-10 w-10 text-primary" />,
        title: 'العيادات المتخصصة',
        description: 'احجز موعدًا مع أحد أطبائنا الخبراء في مختلف التخصصات.',
        href: '#',
      },
      {
        icon: <FlaskConical className="h-10 w-10 text-primary" />,
        title: 'الرعاية التمريضية',
        description: 'اطلب خدمات تمريضية منزلية احترافية لرعاية أحبائك.',
        href: '#',
      },
      {
        icon: <TestTube className="h-10 w-10 text-primary" />,
        title: 'التحاليل المخبرية',
        description: 'احجز زيارة منزلية لسحب العينات واحصل على نتائج دقيقة.',
        href: '#',
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map(service => (
            <Card key={service.title} className="flex flex-col text-center items-center justify-between p-6 hover:shadow-lg transition-shadow">
                 <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        {service.icon}
                    </div>
                    <CardTitle className="text-xl font-headline">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href={service.href}>
                            اختر الخدمة
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
