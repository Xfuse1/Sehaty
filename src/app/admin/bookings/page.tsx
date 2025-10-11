
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BookingsPage() {
  const isLoading = false;
  const bookings: any[] = [];

  const getServiceIcon = (serviceType: string) => <span></span>;
  const getStatusBadgeVariant = (status: string) => 'outline';
  const getStatusBadgeText = (status: string) => status;

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
