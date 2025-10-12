
"use client"

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { Loader2, PhoneCall, Bot, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HomeVisitPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isBooking, setIsBooking] = useState(false);
    const [patientDetails, setPatientDetails] = useState({
        name: '',
        phone: '',
        address: '',
        age: '',
        caseDescription: '',
    });

    useEffect(() => {
        if (user) {
            setPatientDetails(prev => ({
                ...prev,
                name: user.displayName || '',
                phone: user.phoneNumber || ''
            }));
        }
    }, [user]);

    const whatsappLink = "https://wa.me/201211886649";
    const emergencyPhoneNumber = "01212451294";

    const handleConfirmRequest = () => {
        setIsBooking(true);
        
        if (!user) {
             toast({
                variant: "destructive",
                title: "خطأ",
                description: "يجب تسجيل الدخول أولاً لطلب زيارة.",
            });
            setIsBooking(false);
            return;
        }

        const bookingId = `homevisit_${Date.now()}`;
        const bookingDetails = {
            id: bookingId,
            serviceType: 'home_visit',
            userId: user.uid,
            patientName: patientDetails.name,
            patientPhone: patientDetails.phone,
            patientAddress: patientDetails.address,
            patientAge: patientDetails.age,
            caseDescription: patientDetails.caseDescription,
            status: 'pending_confirmation',
            createdAt: new Date().toISOString(),
        };

        // Save to user's bookings subcollection
        const userBookingRef = doc(firestore, "users", user.uid, "bookings", bookingId);
        setDocumentNonBlocking(userBookingRef, bookingDetails, { merge: true });

        // Save to home_visits collection
        const visitRef = doc(firestore, "home_visits", bookingId);
        setDocumentNonBlocking(visitRef, bookingDetails, { merge: true });

        toast({
            title: "تم استلام طلبك",
            description: "سيتم تحويلك لواتساب للتواصل وتأكيد موعد الزيارة.",
        });

        const message = `
        *طلب كشف منزلي جديد*

        *بيانات المريض:*
        - الاسم: ${bookingDetails.patientName}
        - العمر: ${bookingDetails.patientAge}
        - رقم الموبايل: ${bookingDetails.patientPhone}
        - العنوان: ${bookingDetails.patientAddress}

        *وصف الحالة:*
        ${bookingDetails.caseDescription}

        *تفاصيل الطلب:*
        - رقم الطلب: ${bookingDetails.id}
        `;

        const encodedMessage = encodeURIComponent(message.trim());
        const finalWhatsappUrl = `${whatsappLink}?text=${encodedMessage}`;

       //-- window.location.href = finalWhatsappUrl;

        setTimeout(() => {
            setIsBooking(false);
        }, 5000);
    }

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        الكشف المنزلي
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        طبيبك يأتي إليك، في راحة منزلك
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        خدمة أسهل، أطباء محترفون، نصلك في الموعد لنوفر لك الرعاية التي تحتاجها دون عناء.
                    </p>
                </div>
            </header>

            <main className="container py-16">
                <div className="max-w-4xl mx-auto space-y-12">
                
                    <Alert variant="destructive" className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl shadow-lg">
                        <div>
                            <AlertTitle className="text-xl font-bold">حالة طارئة؟</AlertTitle>
                            <AlertDescription className="mt-1">
                                لا تتردد بالاتصال بنا مباشرة للحالات العاجلة والحرجة.
                            </AlertDescription>
                        </div>
                        <Button asChild size="lg" className="mt-4 sm:mt-0 sm:mr-auto animate-pulse">
                            <a href={`tel:${emergencyPhoneNumber}`}>
                                <PhoneCall className="ml-2 h-5 w-5" />
                                اتصال طوارئ
                            </a>
                        </Button>
                    </Alert>

                    <Card className="shadow-xl border-t-4 border-primary">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold">اطلب زيارة منزلية الآن</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                    <Label htmlFor="age">العمر</Label>
                                    <Input id="age" type="number" value={patientDetails.age} onChange={(e) => setPatientDetails({...patientDetails, age: e.target.value})} placeholder="أدخل عمرك" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="address">العنوان بالكامل</Label>
                                    <Input id="address" value={patientDetails.address} onChange={(e) => setPatientDetails({...patientDetails, address: e.target.value})} placeholder="المدينة، الحي، الشارع" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="caseDescription">وصف الحالة والأعراض</Label>
                                    <Textarea id="caseDescription" value={patientDetails.caseDescription} onChange={(e) => setPatientDetails({...patientDetails, caseDescription: e.target.value})} placeholder="صف بإيجاز الأعراض التي تعاني منها، ومتى بدأت..." />
                                </div>
                            </div>
                            <Button 
                                className="w-full" 
                                size="lg"
                                disabled={!patientDetails.name || !patientDetails.address || !patientDetails.caseDescription || isBooking}
                                onClick={handleConfirmRequest}
                           >
                                {isBooking ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Bot className="ml-2 h-5 w-5" />}
                                {isBooking ? "جارِ إرسال الطلب..." : "إرسال الطلب عبر واتساب"}
                           </Button>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8">
                        <div className="flex flex-col items-center gap-3 p-4">
                            <Sparkles className="h-10 w-10 text-primary"/>
                            <h3 className="font-bold text-lg">خدمة أسهل</h3>
                            <p className="text-muted-foreground text-sm">اطلب طبيبك بضغطة زر وأنت في مكانك.</p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-4">
                            <ShieldCheck className="h-10 w-10 text-primary"/>
                            <h3 className="font-bold text-lg">أطباء محترفون</h3>
                            <p className="text-muted-foreground text-sm">فريق من الأطباء المعتمدين لضمان أفضل رعاية.</p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-4">
                            <Clock className="h-10 w-10 text-primary"/>
                            <h3 className="font-bold text-lg">نصلك في الموعد</h3>
                            <p className="text-muted-foreground text-sm">نلتزم بالمواعيد لنوفر وقتك وجهدك.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
