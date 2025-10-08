
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar, Clock, User, Phone, BadgeDollarSign, ShieldPlus, HeartPulse, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Booking extends DocumentData {
  id: string;
  patientName: string;
  patientPhone: string;
  createdAt: string;
  serviceType: 'physiotherapy' | 'nursing_care' | 'doctor_appointment';
  status: 'confirmed' | 'pending_confirmation' | 'completed' | 'cancelled';
  packageName?: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
        case 'physiotherapy':
            return <HeartPulse className="h-5 w-5 text-blue-500" />;
        case 'nursing_care':
            return <ShieldPlus className="h-5 w-5 text-green-500" />;
        default:
            return <Stethoscope className="h-5 w-5 text-purple-500" />;
    }
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'default';
        case 'completed':
            return 'secondary';
        case 'cancelled':
            return 'destructive';
        case 'pending_confirmation':
            return 'outline';
        default:
            return 'outline';
    }
}
const getStatusBadgeText = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'مؤكد';
        case 'completed':
            return 'مكتمل';
        case 'cancelled':
            return 'ملغي';
        case 'pending_confirmation':
            return 'قيد التأكيد';
        default:
            return status;
    }
}


export default function BookingsPage() {
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

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
                    لا توجد حجوزات حالياً.
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
