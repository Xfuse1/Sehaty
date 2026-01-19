
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertCircle, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirestore, useAuth } from '@/firebase';
import { collection, query, orderBy, getDocs, collectionGroup } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { useAdminAuth } from "@/hooks/use-admin-auth";
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
} from "@/components/ui/alert-dialog";

interface Booking {
  id: string;
  serviceType: string;
  patientName: string;
  patientPhone: string;
  createdAt: string;
  status: string;
  packageName?: string;
  doctorName?: string;
  doctorId?: string;
  speciality?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  prescriptionUrl?: string;
  paymentMethod?: string;
  fee?: number;
  userId?: string;
  cancelledAt?: string;
  refundStatus?: {
    status: string;
    message: string;
    requestedAt: string;
    completedAt?: string;
  };
}

export default function BookingsPage() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [markingRefundId, setMarkingRefundId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const allBookings: Booking[] = [];

        // 1. جلب الحجوزات من subcollection users/*/bookings
        try {
          const bookingsQuery = query(
            collectionGroup(firestore, 'bookings'),
            orderBy('createdAt', 'desc')
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const userBookings = bookingsSnapshot.docs.map(doc => {
            const data = doc.data();
            // extract userId from path: users/{userId}/bookings/{bookingId}
            const userId = doc.ref.parent.parent?.id;
            return {
              id: doc.id, // هذا هو الـ Document ID الحقيقي
              _docId: doc.id,
              userId: data.userId || userId,
              ...data,
              serviceType: data.serviceType || 'doctor'
            };
          }) as unknown as Booking[];
          allBookings.push(...userBookings);
        } catch (error: any) {
          if (error.code !== 'permission-denied') {
            console.warn('Error fetching user bookings:', error);
          }
        }

        // 2. جلب من الـ collections الأخرى
        const collections = [
          { name: 'nursing_care_bookings', type: 'nursing' },
          { name: 'physiotherapy_bookings', type: 'physiotherapy' },
          { name: 'doctor_bookings', type: 'doctor' }
        ];

        for (const col of collections) {
          try {
            const q = query(
              collection(firestore, col.name),
              orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const bookingsFromCollection = querySnapshot.docs.map(doc => ({
              id: doc.id,
              _docId: doc.id,
              ...doc.data(),
              serviceType: col.type,
              _sourceCollection: col.name
            })) as unknown as Booking[];
            allBookings.push(...bookingsFromCollection);
          } catch (error: any) {
            if (error.code !== 'permission-denied') {
              console.warn(`Error fetching ${col.name}:`, error);
            }
          }
        }

        // إزالة التكرار بناءً على الـ id مع دمج البيانات لضمان عدم فقدان الـ userId
        const bookingsMap = new Map<string, Booking>();
        allBookings.forEach(booking => {
          const existing = bookingsMap.get(booking.id);
          if (existing) {
            // دمج الحجزين مع تفضيل البيانات الأحدث (موجودة في existing حالياً بسبب الترتيب)
            bookingsMap.set(booking.id, { ...booking, ...existing, userId: existing.userId || booking.userId });
          } else {
            bookingsMap.set(booking.id, booking);
          }
        });

        const uniqueBookings = Array.from(bookingsMap.values());

        // ترتيب حسب التاريخ
        uniqueBookings.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setBookings(uniqueBookings);
        console.log('Bookings loaded:', uniqueBookings.slice(0, 3).map(b => ({ id: b.id, userId: b.userId, serviceType: b.serviceType })));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading && isAdmin) {
      fetchBookings();
    }
  }, [firestore, isAdmin, isAuthLoading]);

  const getServiceIcon = (serviceType: string) => <span></span>;
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pending_confirmation':
      case 'awaiting_confirmation':
        return 'secondary';
      case 'confirmed':
      case 'scheduled':
        return 'default';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pending_confirmation':
      case 'awaiting_confirmation':
        return t.admin.dashboard.bookingsList.status.pending;
      case 'confirmed':
      case 'scheduled':
        return t.admin.dashboard.bookingsList.status.confirmed;
      case 'cancelled':
      case 'ملغي':
        return t.admin.dashboard.bookingsList.status.cancelled;
      case 'rejected':
      case 'مرفوض':
        return t.admin.dashboard.bookingsList.status.rejected;
      case 'completed':
      case 'مكتمل':
        return t.admin.dashboard.bookingsList.status.completed;
      default:
        return status;
    }
  };

  // تحويل الحالة من العربية إلى الإنجليزية للـ Select
  const normalizeStatusToEnglish = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'ملغي':
        return 'cancelled';
      case 'مرفوض':
        return 'rejected';
      case 'مكتمل':
        return 'completed';
      case 'في انتظار التأكيد':
      case 'pending_confirmation':
      case 'awaiting_confirmation':
        return 'pending';
      case 'تم التأكيد':
      case 'scheduled':
        return 'confirmed';
      default:
        return normalized;
    }
  };

  // فلترة الحجوزات
  const cancelledBookings = bookings.filter(b =>
    b.status?.toLowerCase() === 'cancelled' || b.status === 'ملغي'
  );

  const refundPendingBookings = cancelledBookings.filter(b =>
    b.paymentMethod === 'online' &&
    (!b.refundStatus || b.refundStatus.status === 'pending')
  );

  const refundCompletedBookings = cancelledBookings.filter(b =>
    b.paymentMethod === 'online' &&
    b.refundStatus?.status === 'completed'
  );

  // دالة تأكيد إتمام الاسترجاع
  const handleMarkRefundCompleted = async (booking: Booking) => {
    if (!auth.currentUser) {
      console.error('No authenticated user');
      return;
    }

    try {
      setMarkingRefundId(booking.id);

      const token = await auth.currentUser.getIdToken();

      // إرسال userId و collectionPath معاً لتحديث الحجز في كل الأماكن الممكنة
      const requestData = {
        bookingId: booking.id,
        userId: booking.userId || undefined,
        collectionPath: booking.serviceType ? `${booking.serviceType}_bookings` : undefined,
      };

      console.log('Marking refund completed for booking:', requestData);

      const response = await fetch('/api/admin/mark-refund-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || data.details || 'فشل تحديث حالة الاسترجاع');
      }

      toast({
        title: t.admin.dashboard.bookingsList.refundDialog.success,
        description: t.admin.dashboard.bookingsList.refundDialog.success,
      });

      // تحديث الـ state مباشرة
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === booking.id
            ? {
              ...b,
              refundStatus: {
                status: 'completed',
                message: 'تم استرجاع المبلغ بنجاح',
                requestedAt: new Date().toISOString(),
              },
            }
            : b
        )
      );

      console.log('State updated successfully');

    } catch (error: any) {
      console.error('Error marking refund as completed:', error);
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: error.message || t.admin.dashboard.actions.errorSaving,
      });
    } finally {
      setMarkingRefundId(null);
    }
  };

  // دالة تحديث حالة الحجز
  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    if (!auth.currentUser) return;
    if (newStatus === booking.status) return; // لا تحديث إذا كانت نفس الحالة

    try {
      setUpdatingStatusId(booking.id);

      const token = await auth.currentUser.getIdToken();

      // mapping service types to correct collection names
      const collectionMapping: Record<string, string> = {
        'nursing': 'nursing_care_bookings',
        'physiotherapy': 'physiotherapy_bookings',
        'doctor': 'doctor_bookings',
        'استشارة طبية': 'doctor_bookings',
        'كشف منزلي': 'doctor_bookings',
        'تمريض': 'nursing_care_bookings',
        'علاج طبيعي': 'physiotherapy_bookings'
      };

      // استخدام الجدول الأصلي إذا وجد، أو التخمين من النوع، أو افتراض أنه دكتور كحالة عامة
      let collectionPath = (booking as any)._sourceCollection ||
        (booking.serviceType ? collectionMapping[booking.serviceType] : null);

      if (!collectionPath) {
        if (booking.doctorId || booking.doctorName) collectionPath = 'doctor_bookings';
        else if (booking.packageName?.includes('تمريض')) collectionPath = 'nursing_care_bookings';
        else collectionPath = 'doctor_bookings'; // Default fallback
      }

      console.log('--- Database Update Debug ---');
      console.log('Booking Object:', booking);
      console.log('Target Status:', newStatus);
      console.log('Request Payload:', {
        bookingId: (booking as any)._docId || booking.id,
        userId: booking.userId,
        collectionPath,
        newStatus
      });

      const response = await fetch('/api/admin/update-booking-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: (booking as any)._docId || booking.id,
          userId: booking.userId || undefined,
          collectionPath,
          newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تحديث حالة الحجز');
      }

      toast({
        title: t.admin.dashboard.actions.successUpdate,
        description: `${t.admin.dashboard.bookingsList.table.status}: ${getStatusBadgeText(newStatus)}`,
      });

      // تحديث الحالة في الـ state مباشرة
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === booking.id ? { ...b, status: newStatus } : b
        )
      );

    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: error.message || t.admin.dashboard.actions.errorSaving,
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const renderBookingsTable = (bookingsList: Booking[], showActions = false) => (
    <div className="overflow-x-auto -mx-4 md:mx-0 custom-scrollbar">
      <div className="inline-block min-w-full align-middle px-4 md:px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.service}</TableHead>
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.patient}</TableHead>
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.phone}</TableHead>
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.date}</TableHead>
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.payment}</TableHead>
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.amount}</TableHead>
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.status}</TableHead>
              <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.changeStatus}</TableHead>
              {showActions && <TableHead className="text-start font-bold whitespace-nowrap">{t.admin.dashboard.bookingsList.table.actions}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={showActions ? 9 : 8} className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : bookingsList && bookingsList.length > 0 ? (
              bookingsList.map((booking) => {
                const isCancelled = booking.status?.toLowerCase() === 'cancelled' || booking.status === 'ملغي';
                const needsRefund = isCancelled && booking.paymentMethod === 'online' && (!booking.refundStatus || booking.refundStatus.status === 'pending');
                const refundCompleted = isCancelled && booking.paymentMethod === 'online' && booking.refundStatus?.status === 'completed';
                const isMarkingRefund = markingRefundId === booking.id;
                const isUpdatingStatus = updatingStatusId === booking.id;

                return (
                  <TableRow
                    key={booking.id}
                    className={needsRefund ? "bg-amber-50 dark:bg-amber-950/20" : refundCompleted ? "bg-green-50 dark:bg-green-950/20" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(booking.serviceType)}
                        <span>{booking.doctorName || booking.packageName || t.admin.dashboard.bookingsList.table.homeVisit}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.patientName}</TableCell>
                    <TableCell>{booking.patientPhone}</TableCell>
                    <TableCell>
                      <div>
                        <div>{new Date(booking.createdAt).toLocaleDateString('ar-EG')}</div>
                        {booking.appointmentDate && (
                          <div className="text-xs text-muted-foreground">
                            {t.admin.dashboard.bookingsList.table.appointment} {new Date(booking.appointmentDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                            {booking.appointmentTime && ` ${booking.appointmentTime}`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {booking.paymentMethod === 'online' ? (
                          <>
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{t.admin.dashboard.bookingsList.table.online}</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{t.admin.dashboard.bookingsList.table.cash}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.fee ? (
                        <span className="font-semibold">{booking.fee} {t.admin.dashboard.actions.currency}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {getStatusBadgeText(booking.status)}
                        </Badge>
                        {needsRefund && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                            <AlertCircle className="h-3 w-3 ml-1" />
                            {t.admin.dashboard.bookingsList.status.awaitingRefund}
                          </Badge>
                        )}
                        {refundCompleted && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle2 className="h-3 w-3 ml-1" />
                            {t.admin.dashboard.bookingsList.status.refunded}
                          </Badge>
                        )}
                        {booking.cancelledAt && (
                          <div className="text-xs text-muted-foreground">
                            {t.admin.dashboard.bookingsList.status.cancelled}: {new Date(booking.cancelledAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </div>
                        )}
                        {booking.refundStatus?.completedAt && (
                          <div className="text-xs text-green-600">
                            {t.admin.dashboard.bookingsList.status.refunded}: {new Date(booking.refundStatus.completedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={normalizeStatusToEnglish(booking.status)}
                        onValueChange={(value) => handleStatusChange(booking, value)}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger className="w-[160px]">
                          {isUpdatingStatus ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SelectValue placeholder={t.admin.dashboard.bookingsList.table.changeStatus} />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t.admin.dashboard.bookingsList.status.pending}</SelectItem>
                          <SelectItem value="confirmed">{t.admin.dashboard.bookingsList.status.confirmed}</SelectItem>
                          <SelectItem value="completed">{t.admin.dashboard.bookingsList.status.completed}</SelectItem>
                          <SelectItem value="cancelled">{t.admin.dashboard.bookingsList.status.cancelled}</SelectItem>
                          <SelectItem value="rejected">{t.admin.dashboard.bookingsList.status.rejected}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {showActions && (
                      <TableCell>
                        {needsRefund && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="default"
                                disabled={isMarkingRefund}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isMarkingRefund ? (
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 ml-2" />
                                )}
                                {t.admin.dashboard.bookingsList.status.refunded}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.admin.dashboard.bookingsList.refundDialog.title}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t.admin.dashboard.bookingsList.refundDialog.desc.replace('{amount}', String(booking.fee)).replace('{name}', booking.patientName)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t.admin.dashboard.actions.cancel}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleMarkRefundCompleted(booking)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {t.admin.dashboard.actions.confirm}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={showActions ? 9 : 8} className="text-center py-8">
                  {t.admin.dashboard.bookingsList.table.noBookings}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (isAuthLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-headline text-primary tracking-tight">{t.admin.dashboard.bookingsList.title}</h1>
          <p className="text-muted-foreground mt-1 font-medium">{t.admin.dashboard.bookingsList.subtitle}</p>
        </div>
      </div>

      {refundPendingBookings.length > 0 && (
        <Alert className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">{t.admin.dashboard.bookingsList.alerts.refundPending.replace('{count}', String(refundPendingBookings.length))}</AlertTitle>
          <AlertDescription className="text-amber-700">
            {t.admin.dashboard.bookingsList.alerts.refundDesc}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="flex w-full overflow-x-auto h-auto p-1 bg-muted/50 rounded-2xl mb-8 custom-scrollbar justify-start md:grid md:grid-cols-4">
          <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 whitespace-nowrap flex-1">
            {t.admin.dashboard.bookingsList.tabs.all} <span className="mr-2 opacity-60">({bookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-xl px-6 py-2.5 whitespace-nowrap flex-1">
            {t.admin.dashboard.bookingsList.tabs.cancelled} <span className="mr-2 opacity-60">({cancelledBookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="refunds" className="rounded-xl px-6 py-2.5 whitespace-nowrap flex-1">
            {t.admin.dashboard.bookingsList.tabs.refunds} <span className="mr-2 opacity-60">({refundPendingBookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl px-6 py-2.5 whitespace-nowrap flex-1">
            {t.admin.dashboard.bookingsList.tabs.completed} <span className="mr-2 opacity-60">({refundCompletedBookings.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="animate-in fade-in-50 duration-500">
          <Card className="shadow-xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="text-xl font-bold">{t.admin.dashboard.bookingsList.tabs.all}</CardTitle>
              <CardDescription className="font-medium">{t.admin.dashboard.bookingsList.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderBookingsTable(bookings)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled" className="animate-in fade-in-50 duration-500">
          <Card className="shadow-xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="text-xl font-bold">{t.admin.dashboard.bookingsList.tabs.cancelled}</CardTitle>
              <CardDescription className="font-medium">{t.admin.dashboard.bookingsList.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderBookingsTable(cancelledBookings)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="animate-in fade-in-50 duration-500">
          <Card className="shadow-xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="text-xl font-bold text-amber-600">{t.admin.dashboard.bookingsList.tabs.refunds}</CardTitle>
              <CardDescription className="font-medium text-amber-700/80">
                {t.admin.dashboard.bookingsList.alerts.refundDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderBookingsTable(refundPendingBookings, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="animate-in fade-in-50 duration-500">
          <Card className="shadow-xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <CardTitle className="text-xl font-bold text-green-600">{t.admin.dashboard.bookingsList.tabs.completed}</CardTitle>
              <CardDescription className="font-medium text-green-700/80">
                {t.admin.dashboard.bookingsList.status.refunded}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderBookingsTable(refundCompletedBookings)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
