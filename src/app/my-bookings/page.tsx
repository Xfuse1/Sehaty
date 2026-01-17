
"use client"

import { useUser } from "@/firebase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs, getFirestore } from "firebase/firestore"
import { getApp } from "firebase/app"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarPlus, Loader2, BadgeHelp, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Booking {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  serviceType: string;
  doctorName: string;
  status: string;
  // optional fields for package bookings (physiotherapy)
  packageName?: string;
  packagePrice?: number | string;
  packageImageUrl?: string;
  // package kind and payment method
  packageKind?: string;
  paymentMethod?: string;
}

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packageBookings, setPackageBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [indexBuildError, setIndexBuildError] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

        console.log('📦 Fetched bookings from subcollection:', fetchedBookings.length, fetchedBookings);
        setBookings(fetchedBookings);
        setIndexBuildError(false);

        try {
          // Fetch all top-level bookings for this user

          // Fetch from main /bookings collection (where old bookings are stored)
          const mainBookingsRef = collection(db, 'bookings');
          const mainBookingsQ = query(mainBookingsRef, where('userId', '==', user.uid));
          const mainBookingsSnap = await getDocs(mainBookingsQ);
          const mainBookings = mainBookingsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Booking[];
          console.log('📋 Main bookings collection:', mainBookings.length, mainBookings);

          const physioRef = collection(db, 'physiotherapy_bookings');
          const physioQ = query(physioRef, where('userId', '==', user.uid));
          const physioSnap = await getDocs(physioQ);
          const physioBookings = physioSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Booking[];
          console.log('🏥 Physio bookings:', physioBookings.length, physioBookings);

          const nursingRef = collection(db, 'nursing_care_bookings');
          const nursingQ = query(nursingRef, where('userId', '==', user.uid));
          const nursingSnap = await getDocs(nursingQ);
          const nursingBookings = nursingSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Booking[];
          console.log('💉 Nursing bookings:', nursingBookings.length, nursingBookings);

          // Fetch doctor bookings from top-level collection
          const doctorRef = collection(db, 'doctor_bookings');
          const doctorQ = query(doctorRef, where('userId', '==', user.uid));
          const doctorSnap = await getDocs(doctorQ);
          const doctorBookings = doctorSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Booking[];
          console.log('👨‍⚕️ Doctor bookings:', doctorBookings.length, doctorBookings);

          // merge and dedupe by id, preferring user subcollection data
          const byId = new Map<string, Booking>();
          // add top-level bookings first
          mainBookings.forEach(b => byId.set(b.id, b));
          physioBookings.forEach(p => byId.set(p.id, p));
          nursingBookings.forEach(n => byId.set(n.id, n));
          doctorBookings.forEach(d => byId.set(d.id, d));
          // overlay user subcollection bookings (prefer these)
          fetchedBookings.forEach(b => byId.set(b.id, b));

          console.log('🔄 All merged bookings:', byId.size, Array.from(byId.values()));

          // Update main bookings list with all merged data
          const allBookings = Array.from(byId.values());
          setBookings(allBookings);
          console.log('✅ Final bookings set:', allBookings.length, allBookings);

          // Filter package bookings separately
          const merged = allBookings
            .filter(b => b.packageName || (typeof b.serviceType === 'string' && (b.serviceType.toLowerCase() === 'physiotherapy' || b.serviceType.toLowerCase() === 'nursing_care')))
            .map(b => ({
              ...b,
              packageKind: b.packageName ? (b.serviceType || 'package') : (b.serviceType || undefined),
              paymentMethod: (b as any).paymentMethod || (b as any).payment || undefined,
            } as Booking));
          setPackageBookings(merged);
          console.log('📦 Package bookings:', merged.length, merged);
        } catch (err) {
          console.error('Error fetching physio/nursing bookings:', err);
        }

        // (physio fetch handled above)
      } catch (error: any) {
        if (error.code !== 'permission-denied') {
          console.error('Error fetching bookings:', error);
        }
        if (error?.message?.includes('index is currently building')) {
          setIndexBuildError(true);
        }
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // دالة إلغاء الحجز
  const handleCancelBooking = async (booking: Booking) => {
    if (!user) return;

    // حساب الوقت المتبقي
    const appointmentDate = new Date(booking.appointmentDate);
    if (booking.appointmentTime) {
      const timeMatch = booking.appointmentTime.match(/(\d+):(\d+)\s*(ص|م)/);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const isPM = timeMatch[3] === 'م';
        if (isPM && hours !== 12) hours += 12;
        else if (!isPM && hours === 12) hours = 0;
        appointmentDate.setHours(hours, minutes, 0, 0);
      }
    }

    const now = new Date();
    const timeDiffInHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (timeDiffInHours < 6) {
      toast({
        variant: "destructive",
        title: "لا يمكن إلغاء الحجز",
        description: `لا يمكن إلغاء الحجز قبل الموعد بأقل من 6 ساعات. الوقت المتبقي: ${timeDiffInHours.toFixed(1)} ساعة`,
      });
      return;
    }

    try {
      setCancellingId(booking.id);

      // الحصول على token المستخدم
      const token = await user.getIdToken();

      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إلغاء الحجز');
      }

      toast({
        title: "تم إلغاء الحجز بنجاح",
        description: data.refund?.message || "تم إلغاء الحجز",
      });

      // إعادة تحميل الحجوزات
      const db = getFirestore(getApp());
      const userBookingsRef = collection(db, 'users', user.uid, 'bookings');
      const q = query(userBookingsRef, orderBy('appointmentDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedBookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Booking, 'id'>)
      }));
      setBookings(fetchedBookings);

    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إلغاء الحجز",
        description: error.message || "حدث خطأ أثناء إلغاء الحجز",
      });
    } finally {
      setCancellingId(null);
    }
  };

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
  currentDate.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

  // Show all bookings regardless of status
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.appointmentDate);
    bookingDate.setHours(0, 0, 0, 0);
    // Include confirmed, pending, and upcoming bookings
    return bookingDate >= currentDate && booking.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.appointmentDate);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < currentDate || booking.status === 'cancelled';
  });

  // (removed unused bookedPackages variable)

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
              {upcomingBookings.map((booking) => {
                const isCancelled = booking.status === 'cancelled' || booking.status === 'ملغي';
                const isCancelling = cancellingId === booking.id;

                // حساب إذا كان يمكن الإلغاء (6 ساعات على الأقل)
                const appointmentDate = new Date(booking.appointmentDate);
                if (booking.appointmentTime) {
                  const timeMatch = booking.appointmentTime.match(/(\d+):(\d+)\s*(ص|م)/);
                  if (timeMatch) {
                    let hours = parseInt(timeMatch[1]);
                    const minutes = parseInt(timeMatch[2]);
                    const isPM = timeMatch[3] === 'م';
                    if (isPM && hours !== 12) hours += 12;
                    else if (!isPM && hours === 12) hours = 0;
                    appointmentDate.setHours(hours, minutes, 0, 0);
                  }
                }
                const now = new Date();
                const timeDiffInHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                const canCancel = timeDiffInHours >= 6 && !isCancelled;

                return (
                  <Card key={booking.id} className={isCancelled ? "opacity-60" : ""}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-xl md:text-2xl">{booking.serviceType}</CardTitle>
                          <CardDescription className="text-sm md:text-base">
                            تاريخ الموعد: {new Date(booking.appointmentDate).toLocaleDateString('ar-SA')}
                          </CardDescription>
                        </div>
                        {canCancel && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isCancelling}
                              >
                                {isCancelling ? (
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 ml-2" />
                                )}
                                إلغاء الحجز
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من إلغاء الحجز؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم إلغاء حجزك مع <strong>{booking.doctorName}</strong> في {new Date(booking.appointmentDate).toLocaleDateString('ar-SA')} الساعة {booking.appointmentTime || new Date(booking.appointmentDate).toLocaleTimeString('ar-SA')}.
                                  <br /><br />
                                  {booking.paymentMethod === 'online' && (
                                    <span className="text-green-600 font-semibold">
                                      ✓ سيتم رد المبلغ المدفوع خلال 3-5 أيام عمل
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>تراجع</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelBooking(booking)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  تأكيد الإلغاء
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>الطبيب:</strong> {booking.doctorName}</p>
                        <p><strong>الوقت:</strong> {booking.appointmentTime || new Date(booking.appointmentDate).toLocaleTimeString('ar-SA')}</p>
                        <p><strong>الحالة:</strong> <span className={isCancelled ? "text-red-600 font-semibold" : ""}>{booking.status}</span></p>
                        {booking.paymentMethod && (
                          <p><strong>طريقة الدفع:</strong> {booking.paymentMethod === 'online' ? 'دفع إلكتروني' : 'الدفع عند الوصول'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

        <section>
          <h2 className="text-2xl font-bold mb-4">الباقات المحجوزه</h2>
          {bookingsLoading ? (
            <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></div>
          ) : packageBookings.length > 0 ? (
            <div className="space-y-6">
              {packageBookings.map(pkg => (
                <Card key={pkg.id}>
                  <CardHeader>
                    <CardTitle>{pkg.packageName || pkg.serviceType}</CardTitle>
                    <CardDescription>تاريخ الحجز: {pkg.appointmentDate ? new Date(pkg.appointmentDate).toLocaleDateString('ar-SA') : '-'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {pkg.packageImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pkg.packageImageUrl as string} alt={pkg.packageName} className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-xl shadow-md" />
                      ) : (
                        <div className="w-full sm:w-32 h-48 sm:h-32 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed">صورة</div>
                      )}
                      <div className="flex-1 space-y-2 w-full text-center sm:text-start">
                        <p className="text-xl font-bold text-primary">{pkg.packageName}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <p><span className="text-muted-foreground">السعر:</span> <span className="font-semibold text-emerald-600">{pkg.packagePrice ?? '-'} ج.م</span></p>
                          <p><span className="text-muted-foreground">النوع:</span> <span className="font-medium">{pkg.packageKind ?? pkg.serviceType}</span></p>
                          <p><span className="text-muted-foreground">طريقة الدفع:</span> <span className="font-medium">{pkg.paymentMethod ?? '-'}</span></p>
                          <p><span className="text-muted-foreground">الحالة:</span> <span className="font-bold text-blue-600">{pkg.status}</span></p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              <p className="font-semibold">لا توجد لديك باقات محجوزة.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
