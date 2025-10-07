
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarPlus, Loader2, Calendar, Clock, User, Stethoscope, BadgeHelp } from "lucide-react"
import { collection } from "firebase/firestore"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const firestore = useFirestore()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])
  
  const bookingsQuery = useMemoFirebase(() => {
      if (!user) return null;
      return collection(firestore, 'users', user.uid, 'bookings');
  }, [firestore, user]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsQuery);

  const upcomingBookings = bookings?.filter(b => new Date(b.appointmentDate) >= new Date()) || [];
  const pastBookings = bookings?.filter(b => new Date(b.appointmentDate) < new Date()) || [];

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
                {upcomingBookings.map(booking => (
                    <Card key={booking.id} className="shadow-md">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{booking.doctorName}</CardTitle>
                                    <CardDescription>{booking.doctorSpecialty}</CardDescription>
                                </div>
                                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="bg-green-100 text-green-800 border-green-200">
                                    {booking.status === 'confirmed' ? 'مؤكد' : booking.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                             <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="font-semibold">التاريخ:</span>
                                <span className="text-muted-foreground">{new Date(booking.appointmentDate).toLocaleDateString('ar-EG')}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="font-semibold">الوقت:</span>
                                <span className="text-muted-foreground">{booking.appointmentTime}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-primary" />
                                <span className="font-semibold">المريض:</span>
                                <span className="text-muted-foreground">{booking.patientName}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Stethoscope className="h-5 w-5 text-primary" />
                                <span className="font-semibold">طريقة الدفع:</span>
                                <span className="text-muted-foreground">{booking.paymentMethod === 'cash' ? 'عند الوصول' : 'أونلاين'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
                {pastBookings.map(booking => (
                    <Card key={booking.id} className="shadow-sm opacity-70">
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl text-muted-foreground">{booking.doctorName}</CardTitle>
                                    <CardDescription>{booking.doctorSpecialty}</CardDescription>
                                </div>
                                <Badge variant="outline">مكتمل</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                             <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span className="font-semibold">التاريخ:</span>
                                <span className="text-muted-foreground">{new Date(booking.appointmentDate).toLocaleDateString('ar-EG')}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span className="font-semibold">الوقت:</span>
                                <span className="text-muted-foreground">{booking.appointmentTime}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
