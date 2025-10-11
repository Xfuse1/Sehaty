
"use client"

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Loader2, GraduationCap, Briefcase, Star, Info, Calendar as CalendarIcon, User, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Doctor extends DocumentData {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    experience: number;
    location: string;
    price: number;
    image: string;
    bio: string;
}

export default function SpecializedClinicsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");

    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'doctors');
    }, [firestore]);

    const { data: doctors, isLoading } = useCollection<Doctor>(doctorsQuery);

    const handleBookNowClick = (doctor: Doctor) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'مطلوب تسجيل الدخول',
                description: 'يجب تسجيل الدخول أولاً لتتمكن من حجز موعد.',
            });
            router.push('/login');
        } else {
            setSelectedDoctor(doctor);
            setIsDialogOpen(true);
        }
    };
    
    const handleConfirmBooking = () => {
        if(!selectedDoctor) return;
        
        setIsBooking(true);
        // Simulate booking process
        setTimeout(() => {
            setIsBooking(false);
            setIsDialogOpen(false);
            toast({
                title: 'تم الحجز بنجاح!',
                description: `تم تأكيد موعدك مع د. ${selectedDoctor.name}.`,
            });
             const doctorData = encodeURIComponent(JSON.stringify(selectedDoctor));
             router.push(`/booking?doctor=${doctorData}`);
        }, 1500);
    }

    const groupedDoctors = useMemoFirebase(() => {
        if (!doctors) return {};
        return doctors.reduce((acc, doctor) => {
            const specialty = doctor.specialty;
            if (!acc[specialty]) {
                acc[specialty] = [];
            }
            acc[specialty].push(doctor);
            return acc;
        }, {} as Record<string, Doctor[]>);
    }, [doctors]) || {};


    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        العيادات المتخصصة
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        رعاية متكاملة تحت سقف واحد
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        نخبة من الأطباء والاستشاريين في مختلف التخصصات الطبية لتقديم أفضل رعاية صحية لك ولعائلتك.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : Object.keys(groupedDoctors).length > 0 ? (
                    <div className="space-y-16">
                        {Object.entries(groupedDoctors).map(([specialty, docs]) => (
                            <section key={specialty}>
                                <h2 className="text-3xl font-bold font-headline text-foreground mb-8 border-r-4 border-primary pr-4">{specialty}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {docs.map(doctor => (
                                        <Card key={doctor.id} className="overflow-hidden group transition-shadow hover:shadow-xl flex flex-col">
                                            <CardHeader className="flex flex-row items-center gap-4 p-4">
                                                <Image src={doctor.image} alt={doctor.name} width={80} height={80} className="rounded-full border-4 border-primary/10" data-ai-hint="doctor portrait" />
                                                <div className="w-full">
                                                    <CardTitle className="text-lg text-primary">{doctor.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                                     <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span className="font-bold">{doctor.rating}</span>
                                                        <span className="text-muted-foreground">({doctor.reviews} مراجعة)</span>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 flex-grow">
                                                <Accordion type="single" collapsible>
                                                    <AccordionItem value="item-1" className="border-0">
                                                        <AccordionTrigger className="text-sm py-2 hover:no-underline justify-start gap-2">
                                                            <Info className="h-4 w-4" /> عرض التفاصيل
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                                                            <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary/70" /> {doctor.experience} سنوات خبرة</p>
                                                            <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary/70" /> {doctor.bio}</p>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </CardContent>
                                            <div className="p-4 bg-muted/50 mt-auto">
                                                <Button className="w-full" onClick={() => handleBookNowClick(doctor)}>
                                                    احجز الآن مقابل {doctor.price} ر.س
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>لا يوجد أطباء متاحون في العيادات المتخصصة حالياً.</p>
                        <p>يرجى التحقق من <Link href="/doctors-directory" className="text-primary underline">دليل الأطباء العام</Link>.</p>
                    </div>
                )}
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحجز مع د. {selectedDoctor?.name}</DialogTitle>
                        <DialogDescription>
                            أنت على وشك حجز موعد. يرجى إدخال بياناتك واختيار طريقة الدفع.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="patient-name">اسم المريض</Label>
                            <Input id="patient-name" defaultValue={user?.displayName || ''} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="patient-phone">رقم الهاتف</Label>
                            <Input id="patient-phone" defaultValue={user?.phoneNumber || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label>طريقة الدفع</Label>
                             <RadioGroup defaultValue="cash" onValueChange={setPaymentMethod}>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="visa" id="r-visa" />
                                    <Label htmlFor="r-visa" className="flex-grow cursor-pointer">
                                        الدفع بالبطاقة (Visa/Mastercard)
                                        <Badge variant="default" className="mr-2 text-xs">يضمن تأكيد الموعد</Badge>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse mt-2">
                                    <RadioGroupItem value="cash" id="r-cash" />
                                    <Label htmlFor="r-cash" className="flex-grow cursor-pointer">الدفع عند الوصول للعيادة</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={handleConfirmBooking} disabled={isBooking}>
                            {isBooking && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            {isBooking ? 'جارِ التأكيد...' : `تأكيد الحجز`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

    