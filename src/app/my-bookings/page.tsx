
"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarPlus, Loader2, BadgeHelp } from "lucide-react"

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
      <div className="container py-12 flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null;
  }

  // Temporarily disabled Firestore fetching to prevent permission errors.
  const upcomingBookings: any[] = [];
  const pastBookings: any[] = [];
  const bookingsLoading = false;

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
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">مواعيدي القادمة</h2>
           {bookingsLoading ? (
             <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
           ) : upcomingBookings.length > 0 ? (
            <div className="space-y-6">
                {/* Booking mapping would go here */}
            </div>
           ) : (
             <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <BadgeHelp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="font-semibold">لا توجد لديك أي حجوزات قادمة.</p>
                <p className="text-sm">يمكنك حجز موعد جديد من خلال الضغط على زر "حجز جديد".</p>
             </div>
           )}
        </section>

         <section>
          <h2 className="text-2xl font-bold mb-4">مواعيدي السابقة</h2>
           {bookingsLoading ? (
             <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
           ) : pastBookings.length > 0 ? (
            <div className="space-y-6">
                {/* Booking mapping would go here */}
            </div>
           ) : (
             <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                 <p className="text-sm">لا توجد لديك حجوزات سابقة.</p>
             </div>
           )}
        </section>
      </div>
    </div>
  )
}
