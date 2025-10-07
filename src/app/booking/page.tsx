
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Phone, MapPin, Calendar as CalendarIcon, Star } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const availableTimes = ["09:00 ص", "10:00 ص", "11:00 ص", "01:00 م", "02:00 م", "03:00 م"];

function BookingFlow() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [doctor, setDoctor] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | undefined>();
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");
    const [isBooking, setIsBooking] = useState(false);
    const [patientDetails, setPatientDetails] = useState({
        name: '',
        phone: '',
        address: '',
        age: '',
    });


    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        } else if (user) {
            setPatientDetails(prev => ({
                ...prev,
                name: user.displayName || '',
                phone: user.phoneNumber || '',
            }))
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        const doctorData = searchParams.get('doctor');
        if (doctorData) {
            setDoctor(JSON.parse(decodeURIComponent(doctorData)));
        } else {
             if (!doctor) {
                // Prevent infinite redirect loop, only redirect if doctor is not set
                // router.push('/new-booking');
            }
        }
    }, [searchParams, router, doctor]);

    const handleConfirmBooking = () => {
        setIsBooking(true);
        
        if (!user) {
             toast({
                variant: "destructive",
                title: "خطأ",
                description: "يجب تسجيل الدخول أولاً.",
            });
            setIsBooking(false);
            return;
        }

        const bookingId = `booking_${Date.now()}`;
        const bookingDetails = {
            id: bookingId,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorImage: doctor.image,
            doctorSpecialty: doctor.specialty,
            userId: user.uid,
            patientName: patientDetails.name,
            patientPhone: patientDetails.phone,
            patientAddress: patientDetails.address,
            patientAge: patientDetails.age,
            appointmentDate: selectedDate?.toISOString(),
            appointmentTime: selectedTime,
            paymentMethod: paymentMethod,
            status: 'confirmed',
        };

        const bookingRef = doc(firestore, "users", user.uid, "bookings", bookingId);
        setDocumentNonBlocking(bookingRef, bookingDetails, { merge: true });

        // Simulate API call
        setTimeout(() => {
            const queryParams = new URLSearchParams({
                patientName: bookingDetails.patientName,
                patientPhone: bookingDetails.patientPhone,
                appointmentDate: selectedDate?.toLocaleDateString('ar-EG') || 'N/A',
                appointmentTime: bookingDetails.appointmentTime || 'N/A',
                doctorName: bookingDetails.doctorName,
                bookingId: bookingDetails.id,
            }).toString();

            router.push(`/booking-confirmation?${queryParams}`); 
        }, 1000);
    }

    if (isUserLoading || !user || !doctor) {
        return (
            <div className="container py-12 flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="container py-12">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline text-primary">تأكيد الحجز</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    أنت على وشك حجز موعد جديد. يرجى مراجعة التفاصيل وتأكيد الحجز.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Patient Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>1. تأكيد بيانات المريض</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">الاسم الكامل</Label>
                                    <Input id="name" value={patientDetails.name} onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})} />
                                </div>
                                <div>
                                    <Label htmlFor="phone">رقم الموبايل</Label>
                                    <Input id="phone" value={patientDetails.phone} onChange={(e) => setPatientDetails({...patientDetails, phone: e.target.value})} placeholder="e.g., 05xxxxxxx"/>
                                </div>
                                <div>
                                    <Label htmlFor="address">العنوان</Label>
                                    <Input id="address" value={patientDetails.address} onChange={(e) => setPatientDetails({...patientDetails, address: e.target.value})} placeholder="المدينة، الحي، الشارع" />
                                </div>
                                <div>
                                    <Label htmlFor="age">العمر</Label>
                                    <Input id="age" type="number" value={patientDetails.age} onChange={(e) => setPatientDetails({...patientDetails, age: e.target.value})} placeholder="أدخل عمرك" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment Slot */}
                    <Card>
                        <CardHeader>
                            <CardTitle>2. اختر الموعد المناسب</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-4 text-center">اختر التاريخ</h3>
                                <div className="flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        className="rounded-md border"
                                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4 text-center">اختر الوقت</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableTimes.map(time => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? "default" : "outline"}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle>3. اختر طريقة الدفع</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="cash" onValueChange={setPaymentMethod}>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="cash" id="r1" />
                                    <Label htmlFor="r1" className="flex-grow">الدفع عند الوصول</Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse mt-4">
                                    <RadioGroupItem value="online" id="r2" />
                                    <Label htmlFor="r2" className="flex-grow">
                                        الدفع الآن (أونلاين)
                                        <Badge variant="secondary" className="mr-2">يضمن تأكيد الحجز</Badge>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Doctor Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <Image src={doctor.image} alt={doctor.name} layout="fill" className="rounded-full object-cover border-4 border-primary/20" data-ai-hint="doctor portrait" />
                            </div>
                            <CardTitle className="text-primary">{doctor.name}</CardTitle>
                            <CardDescription>{doctor.specialty}</CardDescription>
                            <div className="flex items-center justify-center gap-1 text-amber-500 text-sm mt-2">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold">{doctor.rating}</span>
                                <span>({doctor.reviews} مراجعة)</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                           <div className="border-t pt-4">
                                <h4 className="font-bold mb-4">ملخص الحجز</h4>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">التاريخ:</span>
                                    <span className="font-semibold">{selectedDate ? selectedDate.toLocaleDateString('ar-EG') : 'لم يحدد'}</span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-muted-foreground">الوقت:</span>
                                    <span className="font-semibold">{selectedTime || 'لم يحدد'}</span>
                                </div>
                                <div className="flex justify-between mt-4 pt-4 border-t">
                                    <span className="text-muted-foreground font-bold">رسوم الكشف:</span>
                                    <span className="font-bold text-lg text-primary">{doctor.price} ر.س</span>
                                </div>
                           </div>
                           <Button 
                                className="w-full mt-6" 
                                size="lg"
                                disabled={!selectedDate || !selectedTime || isBooking}
                                onClick={handleConfirmBooking}
                           >
                                {isBooking ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <CalendarIcon className="ml-2 h-5 w-5" />}
                                {isBooking ? "جارِ تأكيد الحجز..." : "تأكيد الحجز"}
                           </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="container py-12 flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <BookingFlow />
        </Suspense>
    )
}
