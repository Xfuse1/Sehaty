

"use client"

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Phone, Calendar, Clock, Stethoscope, Home, AlertTriangle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ConfirmationCard() {
    const searchParams = useSearchParams();
    const whatsappLink = "https://wtsi.me/201211886649";
    
    const bookingDetails = {
        patientName: searchParams.get('patientName') || 'غير متوفر',
        patientPhone: searchParams.get('patientPhone') || 'غير متوفر',
        appointmentDate: searchParams.get('appointmentDate') || 'غير متوفر',
        appointmentTime: searchParams.get('appointmentTime') || 'غير متوفر',
        doctorName: searchParams.get('doctorName') || 'غير متوفر',
        bookingId: searchParams.get('bookingId') || 'N/A',
    };

    const qrData = encodeURIComponent(JSON.stringify({
        bookingId: bookingDetails.bookingId,
        patientName: bookingDetails.patientName,
        appointment: `${bookingDetails.appointmentDate} - ${bookingDetails.appointmentTime}`
    }));
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=200x200`;

    const whatsappMessage = `
*🎉 تم تأكيد الحجز بنجاح! 🎉*

*-- تفاصيل الحجز --*
*رقم الحجز:* ${bookingDetails.bookingId}
*اسم المريض:* ${bookingDetails.patientName}
*رقم الهاتف:* ${bookingDetails.patientPhone}
*الطبيب:* ${bookingDetails.doctorName}
*التاريخ:* ${bookingDetails.appointmentDate}
*الوقت:* ${bookingDetails.appointmentTime}

---------------------
يرجى الاحتفاظ بهذه الرسالة لإظهارها عند الوصول.
    `;

    return (
        <div className="container py-12 flex justify-center items-center">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader className="text-center bg-green-50 rounded-t-lg pt-6">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold text-green-700">تم تأكيد حجزك بنجاح!</CardTitle>
                    <CardDescription className="text-green-600">سيتم عرض تفاصيل حجزك في صفحة "حجوزاتي".</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        
                        <Alert variant="default" className="bg-amber-50 border-amber-200">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertTitle className="font-bold text-amber-800">تنويه هام</AlertTitle>
                          <AlertDescription className="text-amber-700">
                            يرجى الاحتفاظ بصورة من بطاقة الحجز هذه أو الـ QR Code لإظهارها عند الوصول إلى العيادة لتسهيل عملية تأكيد الحضور.
                          </AlertDescription>
                        </Alert>

                        <div className="p-4 border-2 border-dashed rounded-lg">
                           <Image 
                                src={qrCodeUrl} 
                                alt="QR Code for booking confirmation" 
                                width={200} 
                                height={200} 
                                data-ai-hint="QR code"
                           />
                        </div>
                        <div className="w-full space-y-3 text-right">
                           <h4 className="font-bold text-center text-lg mb-4 border-b pb-2">تفاصيل الحجز</h4>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-primary" />
                                <span className="font-semibold">اسم المريض:</span>
                                <span className="text-muted-foreground mr-auto">{bookingDetails.patientName}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <span className="font-semibold">رقم الهاتف:</span>
                                <span className="text-muted-foreground mr-auto">{bookingDetails.patientPhone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Stethoscope className="h-5 w-5 text-primary" />
                                <span className="font-semibold">الطبيب:</span>
                                <span className="text-muted-foreground mr-auto">{bookingDetails.doctorName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="font-semibold">التاريخ:</span>
                                <span className="text-muted-foreground mr-auto">{bookingDetails.appointmentDate}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="font-semibold">الوقت:</span>
                                <span className="text-muted-foreground mr-auto">{bookingDetails.appointmentTime}</span>
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-3 mt-6">
                            <Button asChild className="w-full" size="lg">
                                <Link href={`${whatsappLink}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank">
                                    <MessageSquare className="ml-2 h-5 w-5" />
                                    مشاركة عبر واتساب
                                </Link>
                            </Button>
                            <Button asChild className="w-full" size="lg" variant="outline">
                                <Link href="/my-bookings">
                                    <Home className="ml-2 h-5 w-5" />
                                    العودة إلى حجوزاتي
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function BookingConfirmationPage() {
    return (
        <Suspense fallback={<div>جار التحميل...</div>}>
            <ConfirmationCard />
        </Suspense>
    );
}
