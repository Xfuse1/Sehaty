
"use client"

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { savePatientPrescription } from '@/lib/patient-records';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarIcon, Upload, Mic, Bot } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

function NursingCareBookingFlow() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [pkg, setPackage] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");
    const [isBooking, setIsBooking] = useState(false);
    const [patientDetails, setPatientDetails] = useState({
        name: '',
        phone: '',
        address: '',
        age: '',
        caseDescription: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    const whatsappLink = "https://wa.me/201211886649";

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        } else if (user) {
            setPatientDetails(prev => ({
                ...prev,
                name: user.displayName || '',
                phone: user.phoneNumber || '',
            }));
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        const packageData = searchParams.get('package');
        if (packageData) {
            try {
                const parsedPackage = JSON.parse(decodeURIComponent(packageData));
                if (JSON.stringify(parsedPackage) !== JSON.stringify(pkg)) {
                    setPackage(parsedPackage);
                }
            } catch (e) {
                console.error("Failed to parse package data", e);
            }
        }
    }, [searchParams, pkg]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setFileName(file.name);
                toast({ title: "جاري رفع الملف", description: "يرجى الانتظار..." });
                
                // Upload to Cloudinary
                const imageUrl = await uploadToCloudinary(file);
                setUploadedImageUrl(imageUrl); // Store the URL in state
                
                if (!user) {
                    toast({
                        variant: "destructive",
                        title: "خطأ",
                        description: "يجب تسجيل الدخول أولاً.",
                    });
                    return;
                }

                // Save to Airtable Patients Images
                await savePatientPrescription(
                    user.uid,
                    patientDetails.name,
                    imageUrl
                );

                toast({ 
                    title: "تم رفع الملف بنجاح", 
                    description: "تم حفظ الروشتة في قاعدة البيانات" 
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                toast({
                    variant: "destructive",
                    title: "خطأ في رفع الملف",
                    description: "يرجى المحاولة مرة أخرى"
                });
                setUploadedImageUrl(null);
            }
        }
    };
    
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

        const bookingId = `nursingbooking_${Date.now()}`;
        // Create booking details object with all required fields
        const bookingDetails: Record<string, any> = {
            id: bookingId,
            packageId: pkg.id,
            packageName: pkg.name,
            packagePrice: pkg.price,
            serviceType: 'nursing_care',
            userId: user.uid,
            patientName: patientDetails.name,
            patientPhone: patientDetails.phone,
            patientAddress: patientDetails.address,
            patientAge: patientDetails.age,
            caseDescription: patientDetails.caseDescription,
            paymentMethod: paymentMethod,
            status: 'pending_confirmation',
            createdAt: new Date().toISOString(),
        };

        // Add package image URL if available, otherwise use a placeholder
        bookingDetails.packageImageUrl = pkg.imageUrl || null;

        // Add prescription URL if available
        if (uploadedImageUrl) {
            bookingDetails.prescriptionUrl = uploadedImageUrl;
        }

        const userBookingRef = doc(firestore, "users", user.uid, "bookings", bookingId);
        setDocumentNonBlocking(userBookingRef, bookingDetails, { merge: true });

        const adminBookingRef = doc(firestore, "nursing_care_bookings", bookingId);
        setDocumentNonBlocking(adminBookingRef, bookingDetails, { merge: true });

        toast({
            title: "تم استلام طلب الحجز",
            description: "سيتم تحويلك لواتساب للتواصل وتأكيد الموعد.",
        });

        const message = `
        *طلب حجز باقة رعاية تمريضية*

        *تفاصيل الباقة:*
        - اسم الباقة: ${bookingDetails.packageName}
        - السعر: ${bookingDetails.packagePrice} ج.م

        *بيانات المريض:*
        - الاسم: ${bookingDetails.patientName}
        - العمر: ${bookingDetails.patientAge}
        - رقم الموبايل: ${bookingDetails.patientPhone}
        - العنوان: ${bookingDetails.patientAddress}

        *وصف الحالة:*
        ${bookingDetails.caseDescription}

        *تفاصيل الطلب:*
        - رقم الطلب: ${bookingDetails.id}
        - طريقة الدفع: ${bookingDetails.paymentMethod === 'cash' ? 'عند تقديم الخدمة' : 'أونلاين'}
        ${bookingDetails.prescriptionUrl ? `\n*الروشتة الطبية:*\n${bookingDetails.prescriptionUrl}` : ''}
        `;

        const encodedMessage = encodeURIComponent(message);
        const finalWhatsappUrl = `${whatsappLink}?text=${encodedMessage}`;

        window.location.href = finalWhatsappUrl;

        setTimeout(() => {
            setIsBooking(false);
        }, 5000);
    }

    if (isUserLoading || !user || !pkg) {
        return (
            <div className="container py-12 flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="container py-12">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline text-primary">حجز باقة رعاية تمريضية</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    أنت على وشك حجز باقة "{pkg.name}". يرجى استكمال البيانات التالية.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. بيانات المريض</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
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
                                    <Label htmlFor="address">العنوان بالكامل (لتحديد موعد الزيارة)</Label>
                                    <Input id="address" value={patientDetails.address} onChange={(e) => setPatientDetails({...patientDetails, address: e.target.value})} placeholder="المدينة، الحي، الشارع" />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="caseDescription">وصف الحالة</Label>
                                    <Textarea id="caseDescription" value={patientDetails.caseDescription} onChange={(e) => setPatientDetails({...patientDetails, caseDescription: e.target.value})} placeholder="صف بإيجاز الحالة الصحية، والأدوية المطلوبة، وأي تفاصيل أخرى مهمة..." />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. المستندات والروشتات (اختياري)</CardTitle>
                             <CardDescription>يمكنك إرفاق الروشتات أو التقارير الطبية لتوضيح الحالة.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-8 w-8" />
                                <span>رفع روشتة أو تقرير</span>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf"/>
                             </Button>
                             {fileName && <p className="text-sm text-muted-foreground md:col-span-3">الملف المختار: {fileName}</p>}
                             
                             <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => toast({ title: "قريبا!", description: "ميزة التسجيل الصوتي قيد التطوير." })}>
                                <Mic className="h-8 w-8" />
                                <span>تسجيل رسالة صوتية</span>
                                <Badge variant="secondary" className="absolute -top-2 -right-2">قريباً</Badge>
                             </Button>

                             <Button asChild variant="outline" className="h-24 flex-col gap-2 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700">
                                <Link href={`${whatsappLink}?text=${encodeURIComponent(`أرغب في الاستفسار عن حجز رعاية تمريضية.`)}`} target="_blank">
                                    <Bot className="h-8 w-8" />
                                    <span>تواصل معنا</span>
                                </Link>
                             </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>3. اختر طريقة الدفع</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="cash" id="r1" />
                                    <Label htmlFor="r1" className="flex-grow">الدفع عند تقديم الخدمة</Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse mt-4">
                                    <RadioGroupItem value="online" id="r2" />
                                    <Label htmlFor="r2" className="flex-grow">
                                        الدفع الآن (أونلاين)
                                        <Badge variant="secondary" className="mr-2">يضمن أولوية الحجز</Badge>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader className="text-center">
                            <CardTitle className="text-primary">{pkg.name}</CardTitle>
                            <CardDescription>{pkg.duration}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                           <div className="border-t pt-4">
                                <h4 className="font-bold mb-4">ملخص الباقة</h4>
                                <p className="text-muted-foreground text-xs mb-4">{pkg.description}</p>
                                <div className="flex justify-between mt-4 pt-4 border-t">
                                    <span className="text-muted-foreground font-bold">سعر الباقة:</span>
                                    <span className="font-bold text-lg text-primary">{pkg.price}ج.م</span>
                                </div>
                           </div>
                           <Button 
                                className="w-full mt-6" 
                                size="lg"
                                disabled={!patientDetails.name || !patientDetails.address || isBooking}
                                onClick={handleConfirmBooking}
                           >
                                {isBooking ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <CalendarIcon className="ml-2 h-5 w-5" />}
                                {isBooking ? "جارِ إرسال الطلب..." : "إرسال طلب الحجز"}
                           </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function NursingCareBookingPage() {
    return (
        <Suspense fallback={<div className="container py-12 flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <NursingCareBookingFlow />
        </Suspense>
    )
}
