"use client"

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Phone, MapPin, Calendar as CalendarIcon, Star, FileText, Upload, CreditCard, Wallet, Banknote, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

const availableTimes = ["09:00 ص", "10:00 ص", "11:00 ص", "01:00 م", "02:00 م", "03:00 م", "04:00 م", "05:00 م"];

function BookingFlow() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();
    const [doctor, setDoctor] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | undefined>();
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");
    const [isBooking, setIsBooking] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [whatsappReminder, setWhatsappReminder] = useState(true);
    const [visitReason, setVisitReason] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    const [patientDetails, setPatientDetails] = useState({
        name: '',
        phone: '',
    });

    useEffect(() => {
        if (!isUserLoading && !user) {
            sessionStorage.setItem('redirectAfterLogin', '/booking');
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
            try {
                const parsedDoctor = JSON.parse(decodeURIComponent(doctorData));
                if (JSON.stringify(parsedDoctor) !== JSON.stringify(doctor)) {
                    setDoctor(parsedDoctor);
                }
            } catch (e) {
                console.error("Failed to parse doctor data", e);
            }
        }
    }, [searchParams, doctor]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirmBooking = async () => {
        if (!acceptedTerms) {
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.booking.doctor.termsRequired,
            });
            return;
        }

        if (!selectedTime) {
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.booking.doctor.timeRequired,
            });
            return;
        }

        if (!visitReason.trim()) {
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.booking.doctor.reasonRequired,
            });
            return;
        }

        setIsBooking(true);

        if (!user) {
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.common.loginRequired,
            });
            setIsBooking(false);
            return;
        }

        const bookingId = `SH-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

        const bookingDetails = {
            id: bookingId,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorImage: doctor.image,
            doctorSpecialty: doctor.specialty,
            serviceType: 'استشارة طبية',
            userId: user.uid,
            patientName: patientDetails.name,
            patientPhone: patientDetails.phone,
            visitReason: visitReason,
            appointmentDate: selectedDate?.toISOString(),
            appointmentTime: selectedTime,
            paymentMethod: paymentMethod,
            fee: doctor?.price || 0,
            whatsappReminder: whatsappReminder,
            attachmentsCount: attachments.length,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
        };

        try {
            // حفظ الحجز في المكانين: top-level collection و user subcollection
            const globalBookingRef = doc(firestore, 'bookings', bookingId);
            const userBookingRef = doc(firestore, 'users', user.uid, 'bookings', bookingId);

            await Promise.all([
                setDocumentNonBlocking(globalBookingRef, bookingDetails),
                setDocumentNonBlocking(userBookingRef, bookingDetails),
            ]);

            toast({
                title: t.booking.doctor.bookingSuccess,
                description: t.booking.doctor.bookingNumber.replace('{id}', bookingId),
            });

            const dateString = bookingDetails.appointmentDate ? new Date(bookingDetails.appointmentDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : 'N/A';
            router.push(`/booking-confirmation?bookingId=${bookingId}&patientName=${encodeURIComponent(bookingDetails.patientName)}&patientPhone=${encodeURIComponent(bookingDetails.patientPhone)}&appointmentDate=${encodeURIComponent(dateString)}&appointmentTime=${encodeURIComponent(bookingDetails.appointmentTime || '')}&doctorName=${encodeURIComponent(bookingDetails.doctorName)}`);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: t.booking.doctor.errorOccurred,
                description: t.booking.doctor.bookingFailed,
            });
        } finally {
            setIsBooking(false);
        }
    };

    if (isUserLoading || !doctor) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="container mx-auto max-w-5xl">
                {/* عنوان الصفحة */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                        {t.booking.doctor.title}
                    </h1>
                    <p className="text-muted-foreground">
                        {t.booking.doctor.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* العمود الأيسر - معلومات الطبيب والموعد */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* بطاقة الطبيب */}
                        <Card className="sticky top-4 shadow-lg border-border/50">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">{t.booking.doctor.appointmentDetails}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* معلومات الطبيب */}
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={doctor.image || '/placeholder-doctor.jpg'}
                                            alt={doctor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{doctor.name}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{doctor.specialty}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="text-xs font-medium">{doctor.rating || '4.8'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.back()}
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        {t.booking.doctor.change}
                                    </button>
                                </div>

                                {/* التاريخ والوقت */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium">{t.booking.doctor.date}</span>
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {selectedDate?.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>

                                    {selectedTime && (
                                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium">{t.booking.doctor.time}</span>
                                            </div>
                                            <span className="text-sm font-semibold">{selectedTime}</span>
                                        </div>
                                    )}
                                </div>

                                {/* الرسوم */}
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">{t.booking.doctor.fee}</span>
                                        <span className="text-lg font-bold text-primary">
                                            {doctor.price || 200} {t.booking.currencySar}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="w-full justify-center">
                                        {t.booking.doctor.taxInclusive}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* العمود الأيمن - نموذج الحجز */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* اختيار التاريخ والوقت */}
                        <Card className="shadow-lg border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    {t.booking.doctor.chooseDateTime}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => date < new Date()}
                                        className="rounded-md border"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-3 block">{t.booking.doctor.chooseTime}</Label>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                        {availableTimes.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedTime === time
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-border hover:border-primary/50 hover:bg-accent'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* معلومات المريض */}
                        <Card className="shadow-lg border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    {t.booking.doctor.patientInfo}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t.booking.doctor.fullName}</Label>
                                        <Input
                                            id="name"
                                            value={patientDetails.name}
                                            onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                                            placeholder="أحمد محمد"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t.booking.doctor.mobileNumber}</Label>
                                        <div className="relative">
                                            <div className="absolute right-3 top-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>🇸🇦</span>
                                                <span dir="ltr">+966</span>
                                            </div>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                inputMode="numeric"
                                                value={patientDetails.phone}
                                                onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                                                placeholder="512345678"
                                                className="pr-24"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {t.booking.doctor.visitReason}
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        value={visitReason}
                                        onChange={(e) => setVisitReason(e.target.value)}
                                        placeholder={t.booking.doctor.visitReasonPlaceholder}
                                        className="min-h-[100px]"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t.booking.doctor.visitReasonHint}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attachments" className="flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        {t.booking.doctor.attachments}
                                        <span className="text-xs text-muted-foreground">{t.booking.doctor.optional}</span>
                                    </Label>
                                    <Input
                                        id="attachments"
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        className="cursor-pointer"
                                    />
                                    {attachments.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            {attachments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                                    <span className="text-sm truncate flex-1">{file.name}</span>
                                                    <button
                                                        onClick={() => removeAttachment(index)}
                                                        className={`text-xs text-red-500 hover:text-red-700 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}
                                                    >
                                                        {t.common.delete}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* طريقة الدفع */}
                        <Card className="shadow-lg border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    {t.booking.doctor.paymentMethod}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-accent">
                                            <RadioGroupItem value="cash" id="cash" />
                                            <label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                                                <Banknote className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium">{t.booking.doctor.payAtClinic}</p>
                                                    <p className="text-xs text-muted-foreground">{t.booking.doctor.payAtClinicDesc}</p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-accent">
                                            <RadioGroupItem value="card" id="card" />
                                            <label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">{t.booking.doctor.creditCard}</p>
                                                    <p className="text-xs text-muted-foreground">{t.booking.doctor.creditCardDesc}</p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4 cursor-pointer hover:bg-accent opacity-50">
                                            <RadioGroupItem value="wallet" id="wallet" disabled />
                                            <label htmlFor="wallet" className="flex items-center gap-2 cursor-not-allowed flex-1">
                                                <Wallet className="w-5 h-5 text-purple-600" />
                                                <div>
                                                    <p className="font-medium">{t.booking.doctor.eWallet}</p>
                                                    <p className="text-xs text-muted-foreground">{t.booking.doctor.soon}</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* الموافقات */}
                        <Card className="shadow-lg border-border/50">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start space-x-2 space-x-reverse">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm leading-relaxed cursor-pointer"
                                    >
                                        {t.booking.doctor.agreeTo}{" "}
                                        <Link href="/terms-of-use" className="text-primary hover:underline" target="_blank">
                                            {t.booking.doctor.termsAndConditions}
                                        </Link>{" "}
                                        {t.booking.doctor.and}{" "}
                                        <Link href="/privacy-policy" className="text-primary hover:underline" target="_blank">
                                            {t.booking.doctor.privacyPolicy}
                                        </Link>
                                        <span className="text-red-500 mr-1">*</span>
                                    </label>
                                </div>

                                <div className="flex items-start space-x-2 space-x-reverse">
                                    <Checkbox
                                        id="whatsapp"
                                        checked={whatsappReminder}
                                        onCheckedChange={(checked) => setWhatsappReminder(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="whatsapp"
                                        className="text-sm leading-relaxed cursor-pointer flex items-center gap-2"
                                    >
                                        <span>📱</span>
                                        {t.booking.doctor.whatsappReminder}
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* زر التأكيد */}
                        <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
                            <Button
                                onClick={handleConfirmBooking}
                                disabled={isBooking || !acceptedTerms}
                                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5 animate-spin`} />
                                        {t.booking.doctor.confirming}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                                        {t.booking.doctor.confirmAndPay.replace('{price}', String(doctor.price || 200)).replace('{currency}', t.booking.currencySar)}
                                    </>
                                )}
                            </Button>
                            {!acceptedTerms && (
                                <p className="text-xs text-center text-red-500 mt-2">
                                    {t.booking.doctor.termsRequired}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <BookingFlow />
        </Suspense>
    );
}
