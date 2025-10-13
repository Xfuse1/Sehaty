
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

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
}

export default function BookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const firestore = useFirestore();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Define collections to fetch from
        const collections = [
          { name: 'nursing_care_bookings', type: 'nursing' },
          { name: 'physiotherapy_bookings', type: 'physiotherapy' },
          { name: 'doctor_bookings', type: 'doctor' }
        ];

        const allBookings: Booking[] = [];

        // Fetch bookings from each collection
        for (const col of collections) {
          const q = query(
            collection(firestore, col.name),
            orderBy('createdAt', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const bookingsFromCollection = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            serviceType: col.type
          })) as Booking[];

          allBookings.push(...bookingsFromCollection);
        }

        // Sort all bookings by date
        allBookings.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        setBookings(allBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [firestore]);

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
        return 'في انتظار التأكيد';
      case 'confirmed':
      case 'scheduled':
        return 'تم التأكيد';
      case 'cancelled':
        return 'ملغي';
      case 'rejected':
        return 'مرفوض';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">إدارة الحجوزات</h1>
        <p className="text-muted-foreground mt-1">عرض وتتبع جميع حجوزات العملاء.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الحجوزات</CardTitle>
          <CardDescription>هذه قائمة بجميع الحجوزات التي تمت عبر التطبيق.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الخدمة</TableHead>
                <TableHead>اسم المريض</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>تاريخ الحجز</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           {getServiceIcon(booking.serviceType)}
                           <span>{booking.doctorName || booking.packageName || "زيارة منزلية"}</span>
                        </div>
                    </TableCell>
                    <TableCell>{booking.patientName}</TableCell>
                    <TableCell>{booking.patientPhone}</TableCell>
                    <TableCell>{new Date(booking.createdAt).toLocaleDateString('ar-EG')}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {getStatusBadgeText(booking.status)}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    لا توجد حجوزات حالياً. (سيتم تفعيل هذه الميزة عند ربطها بقاعدة البيانات)
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
