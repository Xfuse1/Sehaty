
"use client"

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Phone, Calendar, Clock, Stethoscope, Home } from 'lucide-react';
import Link from 'next/link';

function ConfirmationCard() {
    const searchParams = useSearchParams();
    
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

    return (
        <div className="container py-12 flex justify-center items-center">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader className="text-center bg-green-50 rounded-t-lg pt-6">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold text-green-700">تم تأكيد حجزك بنجاح!</CardTitle>
                    <CardDescription className="text-green-600"> احتفظ بهذه البطاقة لإظهارها عند الوصول.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-6">
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

                        <Button asChild className="w-full mt-6" size="lg">
                            <Link href="/my-bookings">
                                <Home className="ml-2 h-5 w-5" />
                                العودة إلى حجوزاتي
                            </Link>
                        </Button>
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
