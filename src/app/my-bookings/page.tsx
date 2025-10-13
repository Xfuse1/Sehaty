
"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs, getFirestore } from "firebase/firestore"
import { getApp } from "firebase/app"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarPlus, Loader2, BadgeHelp } from "lucide-react"

interface Booking {
  id: string;
  appointmentDate: string;
  serviceType: string;
  doctorName: string;
  status: string;
}

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [indexBuildError, setIndexBuildError] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      const db = getFirestore(getApp());
      try {
        // Get bookings from the subcollection under the user document
        const userBookingsRef = collection(db, 'users', user.uid, 'bookings');
        const q = query(
          userBookingsRef,
          orderBy('appointmentDate', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Booking, 'id'>)
        }));

        setBookings(fetchedBookings);
        setIndexBuildError(false);
      } catch (error: any) {
        console.error('Error fetching bookings:', error);
        if (error?.message?.includes('index is currently building')) {
          setIndexBuildError(true);
        }
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

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

  const currentDate = new Date();
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.appointmentDate) >= currentDate
  );
  const pastBookings = bookings.filter(booking => 
    new Date(booking.appointmentDate) < currentDate
  );

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
           {indexBuildError ? (
             <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
               <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
               <p className="font-semibold">جاري تجهيز نظام الحجوزات...</p>
               <p className="text-sm">يرجى الانتظار لحظات، سيتم عرض حجوزاتك قريباً.</p>
             </div>
           ) : bookingsLoading ? (
             <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
           ) : upcomingBookings.length > 0 ? (
            <div className="space-y-6">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle>{booking.serviceType}</CardTitle>
                      <CardDescription>
                        تاريخ الموعد: {new Date(booking.appointmentDate).toLocaleDateString('ar-SA')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>الطبيب:</strong> {booking.doctorName}</p>
                        <p><strong>الوقت:</strong> {new Date(booking.appointmentDate).toLocaleTimeString('ar-SA')}</p>
                        <p><strong>الحالة:</strong> {booking.status}</p>
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
                {pastBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle>{booking.serviceType}</CardTitle>
                      <CardDescription>
                        تاريخ الموعد: {new Date(booking.appointmentDate).toLocaleDateString('ar-SA')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>الطبيب:</strong> {booking.doctorName}</p>
                        <p><strong>الوقت:</strong> {new Date(booking.appointmentDate).toLocaleTimeString('ar-SA')}</p>
                        <p><strong>الحالة:</strong> {booking.status}</p>
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
