"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarPlus } from "lucide-react"

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  if (isUserLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <p>جار التحميل...</p>
      </div>
    )
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">حجوزاتي</h1>
        <Button asChild>
          <Link href="/new-booking">
            <CalendarPlus className="ml-2 h-5 w-5" />
            حجز جديد
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>مواعيدي القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>لا توجد لديك أي حجوزات قادمة.</p>
            <p>يمكنك حجز موعد جديد من خلال الضغط على زر "حجز جديد".</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
