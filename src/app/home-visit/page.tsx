
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/language-context';

export default function HomeVisitPage() {
    const { language, t } = useLanguage();
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const visitT = t.servicePages.homeVisit;

    const { user } = useUser();
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

    const whatsappLink = "https://wa.me/201000476674";
    const emergencyPhoneNumber = "01000476674";

    const handleConfirmRequest = () => {
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

        const userBookingRef = doc(firestore, "users", user.uid, "bookings", bookingId);
        setDocumentNonBlocking(userBookingRef, bookingDetails, { merge: true });

        const visitRef = doc(firestore, "home_visits", bookingId);
        setDocumentNonBlocking(visitRef, bookingDetails, { merge: true });

        toast({
            title: t.booking.bookingSuccess,
            description: t.booking.bookingSuccessDesc,
        });

        const message = `
*${visitT.whatsapp.title}*

*${visitT.whatsapp.patientDetails}*
- ${visitT.whatsapp.name} ${bookingDetails.patientName}
- ${visitT.whatsapp.age} ${bookingDetails.patientAge}
- ${visitT.whatsapp.mobile} ${bookingDetails.patientPhone}
- ${visitT.whatsapp.address} ${bookingDetails.patientAddress}

*${visitT.whatsapp.caseDescription}*
${bookingDetails.caseDescription}

*${visitT.whatsapp.orderDetails}*
- ${visitT.whatsapp.orderId} ${bookingDetails.id}
        `;

        const encodedMessage = encodeURIComponent(message.trim());
        const finalWhatsappUrl = `${whatsappLink}?text=${encodedMessage}`;

        window.open(finalWhatsappUrl, '_blank');

        setTimeout(() => {
            setIsBooking(false);
        }, 5000);
    }

    return (
        <div className="bg-background text-foreground" dir={dir}>
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-accent-foreground font-semibold">
                        {visitT.badge}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        {visitT.title}
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        {visitT.subtitle}
                    </p>
                </div>
            </header>

            <main className="container py-16">
                <div className="max-w-4xl mx-auto space-y-12">

                    <Alert variant="destructive" className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl shadow-lg">
                        <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <AlertTitle className="text-xl font-bold">{visitT.emergency.title}</AlertTitle>
                            <AlertDescription className="mt-1">
                                {visitT.emergency.desc}
                            </AlertDescription>
                        </div>
                        <Button asChild size="lg" className={`mt-4 sm:mt-0 ${language === 'ar' ? 'sm:mr-auto' : 'sm:ml-auto'} animate-pulse`}>
                            <a href={`tel:${emergencyPhoneNumber}`}>
                                <PhoneCall className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                                {visitT.emergency.button}
                            </a>
                        </Button>
                    </Alert>

                    <Card className="shadow-xl border-t-4 border-primary">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold">{visitT.form.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">{visitT.form.name}</Label>
                                    <Input id="name" value={patientDetails.name} onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="phone">{visitT.form.phone}</Label>
                                    <Input id="phone" value={patientDetails.phone} onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })} placeholder="e.g., 05xxxxxxx" />
                                </div>
                                <div>
                                    <Label htmlFor="age">{visitT.form.age}</Label>
                                    <Input id="age" type="number" value={patientDetails.age} onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })} placeholder={visitT.form.agePlaceholder} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="address">{visitT.form.address}</Label>
                                    <Input id="address" value={patientDetails.address} onChange={(e) => setPatientDetails({ ...patientDetails, address: e.target.value })} placeholder={visitT.form.addressPlaceholder} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="caseDescription">{visitT.form.symptoms}</Label>
                                    <Textarea id="caseDescription" value={patientDetails.caseDescription} onChange={(e) => setPatientDetails({ ...patientDetails, caseDescription: e.target.value })} placeholder={visitT.form.symptomsPlaceholder} />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                disabled={!patientDetails.name || !patientDetails.address || !patientDetails.caseDescription || isBooking}
                                onClick={handleConfirmRequest}
                            >
                                {isBooking ? <Loader2 className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5 animate-spin`} /> : <Bot className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />}
                                {isBooking ? visitT.form.sending : visitT.form.submit}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8">
                        <div className="flex flex-col items-center gap-3 p-4">
                            <Sparkles className="h-10 w-10 text-primary" />
                            <h3 className="font-bold text-lg">{visitT.features.easy.title}</h3>
                            <p className="text-muted-foreground text-sm">{visitT.features.easy.desc}</p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-4">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                            <h3 className="font-bold text-lg">{visitT.features.pro.title}</h3>
                            <p className="text-muted-foreground text-sm">{visitT.features.pro.desc}</p>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-4">
                            <Clock className="h-10 w-10 text-primary" />
                            <h3 className="font-bold text-lg">{visitT.features.ontime.title}</h3>
                            <p className="text-muted-foreground text-sm">{visitT.features.ontime.desc}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

