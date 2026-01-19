"use client"

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { uploadToCloudinary, uploadVoiceToCloudinary } from '@/lib/cloudinary';
import { savePatientPrescription } from '@/lib/patient-records';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarIcon, Upload, Mic, Bot, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VoiceRecorder } from '@/components/voice-recorder';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

function NursingCareBookingFlow() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();
    const [pkg, setPkg] = useState<any>(null);
    const [isFirstBooking, setIsFirstBooking] = useState(false);
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
    const [voiceRecordingUrl, setVoiceRecordingUrl] = useState<string | null>(null);
    const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
    const [tempVoiceBlob, setTempVoiceBlob] = useState<Blob | null>(null);
    const [tempVoiceUrl, setTempVoiceUrl] = useState<string | null>(null);

    useEffect(() => {
        const checkFirstBooking = async () => {
            if (!user || !firestore) return;
            try {
                const { getDocs, query, collection, where, limit } = await import('firebase/firestore');
                const bookingCollections = ['bookings', 'doctor_bookings', 'physiotherapy_bookings', 'nursing_care_bookings'];
                const results = await Promise.all(
                    bookingCollections.map(colName =>
                        getDocs(query(collection(firestore, colName), where('userId', '==', user.uid), limit(1)))
                    )
                );
                const hasAnyBooking = results.some(snap => !snap.empty);
                setIsFirstBooking(!hasAnyBooking);
            } catch (error) {
                console.error("Error checking first booking:", error);
            }
        };
        checkFirstBooking();
    }, [user, firestore]);

    const basePrice = pkg?.discountPrice || pkg?.price || pkg?.Price || 0;
    const firstTimeDiscountPrice = isFirstBooking ? Math.round(basePrice * 0.75) : basePrice;
    const finalPrice = firstTimeDiscountPrice;

    const whatsappLink = "https://wa.me/201000476674";
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        if (!isUserLoading && !user) {
            sessionStorage.setItem('redirectAfterLogin', '/nursing-care-booking');
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
                    setPkg(parsedPackage);
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
                toast({ title: t.booking.uploading, description: t.common.wait });

                const imageUrl = await uploadToCloudinary(file);
                setUploadedImageUrl(imageUrl);

                if (!user) {
                    toast({
                        variant: "destructive",
                        title: t.booking.error,
                        description: t.common.loginRequired,
                    });
                    return;
                }

                await savePatientPrescription(
                    user.uid,
                    patientDetails.name,
                    imageUrl
                );

                toast({
                    title: t.booking.uploadSuccess,
                    description: language === 'ar' ? "يمكنك رؤية معاينة الصورة أدناه" : "You can see the image preview below"
                });
            } catch (error) {
                console.error('Error uploading file:', error);
                toast({
                    variant: "destructive",
                    title: t.booking.uploadError,
                    description: t.booking.uploadErrorDesc
                });
                setUploadedImageUrl(null);
            }
        }
    };

    const handleConfirmBooking = async () => {
        setIsBooking(true);

        if (!user || !pkg) {
            toast({
                variant: "destructive",
                title: t.booking.error,
                description: !user ? t.common.loginRequired : "Package data missing",
            });
            setIsBooking(false);
            return;
        }

        const bookingId = `nursingbooking_${Date.now()}`;
        const bookingDetails: Record<string, any> = {
            id: bookingId,
            packageId: pkg.id,
            packageName: language === 'en' && pkg.PackageName_en ? pkg.PackageName_en : (pkg.name || pkg.PackageName),
            packagePrice: finalPrice,
            originalPrice: pkg.price || pkg.Price,
            hasFirstBookingDiscount: isFirstBooking,
            serviceType: 'nursing_care',
            userId: user.uid,
            patientName: patientDetails.name,
            patientPhone: patientDetails.phone,
            patientAddress: patientDetails.address,
            patientAge: patientDetails.age,
            caseDescription: patientDetails.caseDescription,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'online' ? 'pending' : 'not_required',
            status: 'pending_confirmation',
            createdAt: new Date().toISOString(),
        };

        bookingDetails.packageImageUrl = pkg.imageUrl || null;

        if (uploadedImageUrl) {
            bookingDetails.prescriptionUrl = uploadedImageUrl;
        }

        if (voiceRecordingUrl) {
            (bookingDetails as any).voiceRecordingUrl = voiceRecordingUrl;
        }

        const userBookingRef = doc(firestore, "users", user.uid, "bookings", bookingId);
        setDocumentNonBlocking(userBookingRef, bookingDetails, { merge: true });

        const adminBookingRef = doc(firestore, "nursing_care_bookings", bookingId);
        setDocumentNonBlocking(adminBookingRef, bookingDetails, { merge: true });

        toast({
            title: t.booking.bookingSuccess,
            description: t.booking.bookingSuccessDesc,
        });

        const serviceName = language === 'ar' ? 'التمريض المنزلي' : 'Home Nursing';
        const message = `
*${t.booking.whatsapp.title.replace('{service}', serviceName)}*

*${t.booking.whatsapp.packageDetails}*
- ${t.booking.whatsapp.packageName} ${bookingDetails.packageName}
- ${t.booking.whatsapp.price} ${bookingDetails.packagePrice} ${t.booking.currency}

*${t.booking.whatsapp.patientDetails}*
- ${t.booking.whatsapp.name} ${bookingDetails.patientName}
- ${t.booking.whatsapp.age} ${bookingDetails.patientAge}
- ${t.booking.whatsapp.mobile} ${bookingDetails.patientPhone}
- ${t.booking.whatsapp.address} ${bookingDetails.patientAddress}

*${t.booking.whatsapp.caseDescription}*
${bookingDetails.caseDescription}

*${t.booking.whatsapp.orderDetails}*
- ${t.booking.whatsapp.orderId} ${bookingDetails.id}
- ${t.booking.whatsapp.paymentMethod} ${bookingDetails.paymentMethod === 'cash' ? t.booking.whatsapp.cash : t.booking.whatsapp.online}
${bookingDetails.prescriptionUrl ? `\n*${t.booking.whatsapp.medicalReport}*\n${bookingDetails.prescriptionUrl}` : ''}
${(bookingDetails as any).voiceRecordingUrl ? `\n\n*${t.booking.whatsapp.voiceMessage}*\n${(bookingDetails as any).voiceRecordingUrl}` : ''}
`;

        const encodedMessage = encodeURIComponent(message.trim());
        const finalWhatsappUrl = `${whatsappLink}?text=${encodedMessage}`;

        if (paymentMethod === 'online') {
            try {
                const resp = await fetch('/api/kashier/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: bookingDetails.packagePrice,
                        orderId: bookingDetails.id,
                        description: `Booking ${bookingDetails.packageName}`,
                        merchantRedirect: `${window.location.origin}/payment/success`,
                        failureRedirect: `${window.location.origin}/payment/failure`,
                        metadata: { serviceType: bookingDetails.serviceType, userId: bookingDetails.userId }
                    }),
                });

                const data = await resp.json();
                if (data?.checkoutUrl) {
                    const redirectingUrl = `/payment/redirecting?checkoutUrl=${encodeURIComponent(data.checkoutUrl)}&orderId=${encodeURIComponent(bookingDetails.id)}`;
                    window.location.href = redirectingUrl;
                    return;
                } else {
                    toast({ variant: 'destructive', title: t.booking.error, description: t.booking.whatsapp.failedPayment });
                }
            } catch (error) {
                toast({ variant: 'destructive', title: t.booking.error, description: t.booking.error });
            }
        }

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
        <div className="container py-12" dir={dir}>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline text-primary">{t.booking.nursingTitle}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t.booking.aboutToBook} "{language === 'en' && pkg.PackageName_en ? pkg.PackageName_en : (pkg.name || pkg.PackageName)}". {t.booking.completeDetails}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.booking.patientDetailsTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="name">{t.booking.fullName}</Label>
                                    <Input id="name" value={patientDetails.name} onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="phone">{t.booking.mobileNumber}</Label>
                                    <Input id="phone" value={patientDetails.phone} onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })} placeholder="05xxxxxxx" />
                                </div>
                                <div>
                                    <Label htmlFor="age">{t.booking.age}</Label>
                                    <Input id="age" type="number" value={patientDetails.age} onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })} placeholder={t.booking.agePlaceholder} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="address">{t.booking.fullAddress}</Label>
                                    <Input id="address" value={patientDetails.address} onChange={(e) => setPatientDetails({ ...patientDetails, address: e.target.value })} placeholder={t.booking.addressPlaceholder} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="caseDescription">{t.booking.caseDescription}</Label>
                                    <Textarea id="caseDescription" value={patientDetails.caseDescription} onChange={(e) => setPatientDetails({ ...patientDetails, caseDescription: e.target.value })} placeholder={t.booking.caseDescriptionPlaceholder} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t.booking.documentsTitle}</CardTitle>
                            <CardDescription>{t.booking.documentsDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-8 w-8" />
                                <span>{t.booking.uploadButton}</span>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                            </Button>
                            {uploadedImageUrl && (
                                <div className="relative border rounded-lg overflow-hidden md:col-span-3">
                                    <img
                                        src={uploadedImageUrl}
                                        alt="Uploaded prescription"
                                        className="w-full h-auto max-h-48 object-contain"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'}`}
                                        onClick={() => {
                                            setUploadedImageUrl(null);
                                            setFileName(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                            toast({
                                                title: t.booking.imageDeleted,
                                                description: t.booking.imageDeletedDesc
                                            });
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {fileName && !uploadedImageUrl && <p className="text-sm text-muted-foreground md:col-span-3">{t.booking.selectedFile} {fileName}</p>}

                            <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="h-24 flex-col gap-2 relative">
                                        <Mic className="h-8 w-8" />
                                        <span>{t.booking.voiceTitle}</span>
                                        {voiceRecordingUrl && (
                                            <Badge variant="default" className={`absolute -top-2 ${language === 'ar' ? '-right-2' : '-left-2'}`}>{t.booking.recorded}</Badge>
                                        )}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{t.booking.voiceTitle}</DialogTitle>
                                    </DialogHeader>

                                    {!tempVoiceBlob ? (
                                        <VoiceRecorder
                                            maxDuration={180}
                                            onRecordingComplete={(blob, url) => {
                                                setTempVoiceBlob(blob);
                                                setTempVoiceUrl(url);
                                            }}
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-center p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground mb-2">{t.booking.voiceSuccess}</p>
                                                {tempVoiceUrl && (
                                                    <audio controls src={tempVoiceUrl} className="w-full mt-2" />
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => {
                                                        if (tempVoiceUrl) URL.revokeObjectURL(tempVoiceUrl);
                                                        setTempVoiceBlob(null);
                                                        setTempVoiceUrl(null);
                                                    }}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Mic className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                                    {t.booking.reRecord}
                                                </Button>

                                                <Button
                                                    onClick={async () => {
                                                        try {
                                                            toast({ title: t.booking.saving, description: t.booking.uploadingVoice });
                                                            const cloudinaryUrl = await uploadVoiceToCloudinary(tempVoiceBlob!);
                                                            setVoiceRecordingUrl(cloudinaryUrl);
                                                            if (tempVoiceUrl) URL.revokeObjectURL(tempVoiceUrl);
                                                            setTempVoiceBlob(null);
                                                            setTempVoiceUrl(null);
                                                            toast({ title: t.booking.saved, description: t.booking.saveSuccess });
                                                            setTimeout(() => setIsVoiceDialogOpen(false), 1000);
                                                        } catch (error) {
                                                            toast({ variant: "destructive", title: t.booking.uploadError, description: t.booking.uploadErrorDesc });
                                                        }
                                                    }}
                                                    className="flex-1"
                                                >
                                                    <Upload className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                                                    {t.booking.saveRecord}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>

                            <Button asChild variant="outline" className="h-24 flex-col gap-2 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700">
                                <Link href={`${whatsappLink}?text=${encodeURIComponent(t.booking.nursingInquiry)}`} target="_blank">
                                    <Bot className="h-8 w-8" />
                                    <span>{t.booking.contactUs}</span>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t.booking.paymentTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''}`}>
                                    <RadioGroupItem value="cash" id="r1" />
                                    <Label htmlFor="r1" className="flex-grow">{t.booking.payAtService}</Label>
                                </div>
                                <div className={`flex items-center space-x-2 ${language === 'ar' ? 'space-x-reverse' : ''} mt-4`}>
                                    <RadioGroupItem value="online" id="r2" />
                                    <Label htmlFor="r2" className="flex-grow">
                                        {t.booking.payNow}
                                        <Badge variant="secondary" className={`${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{t.booking.priorityBooking}</Badge>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader className="text-center">
                            <CardTitle className="text-primary">{pkg ? (language === 'en' && pkg.PackageName_en ? pkg.PackageName_en : (pkg.name || pkg.PackageName)) : 'Loading...'}</CardTitle>
                            <CardDescription>{pkg ? (language === 'en' && pkg.Duration_en ? pkg.Duration_en : (pkg.duration || pkg.Duration)) : ''}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="border-t pt-4">
                                <h4 className="font-bold mb-4">{t.booking.summaryTitle}</h4>
                                <p className="text-muted-foreground text-xs mb-4">{pkg ? (language === 'en' && pkg.Description_en ? pkg.Description_en : (pkg.description || pkg.Description)) : ''}</p>
                                <div className="flex justify-between mt-4 pt-4 border-t">
                                    <span className="text-muted-foreground font-bold">{t.booking.packagePrice}</span>
                                    <div className="text-right">
                                        {(pkg.discountPrice > 0 || isFirstBooking) && (
                                            <span className="text-xs line-through text-muted-foreground block">
                                                {pkg.price || pkg.Price} {t.booking.currencySar}
                                            </span>
                                        )}
                                        {isFirstBooking && (
                                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 mb-1">
                                                {language === 'ar' ? 'خصم 25% لأول حجز' : '25% First Booking Discount'}
                                            </Badge>
                                        )}
                                        <span className="font-bold text-lg text-primary block">
                                            {finalPrice} {t.booking.currencySar}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-6"
                                size="lg"
                                disabled={!patientDetails.name || !patientDetails.address || isBooking}
                                onClick={handleConfirmBooking}
                            >
                                {isBooking ? <Loader2 className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5 animate-spin`} /> : <CalendarIcon className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />}
                                {isBooking ? t.booking.sendingRequest : t.booking.sendRequest}
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

