
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Star, MapPin, BriefcaseMedical, CalendarClock, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import { initialSpecializedClinics } from '@/lib/site-content-data';
import { useUser } from '@/firebase'; // Assuming useUser gives us login status
import { useToast } from '@/hooks/use-toast';


// Mock data for doctors, will be replaced with Firebase data
const doctorsList = [
    {
        id: '1',
        name: 'د. فاطمة علي الأحمد',
        specialty: 'طب الأطفال وحديثي الولادة',
        rating: 4.8,
        reviews: 192,
        experience: 15,
        certifications: ['استشارية أطفال', 'زمالة أمريكية'],
        location: 'عيادة الأمل - جدة',
        nextAvailable: 'اليوم 03:00 م',
        price: 250,
        image: 'https://picsum.photos/seed/doctor1/200/200',
        available: true,
    },
    {
        id: '2',
        name: 'د. أحمد محمد السعيد',
        specialty: 'طب القلب والأوعية الدموية',
        rating: 4.9,
        reviews: 234,
        experience: 20,
        certifications: ['استشاري قلب', 'زمالة بريطانية'],
        location: 'مستشفى النور - الرياض',
        nextAvailable: 'غداً 10:00 ص',
        price: 300,
        image: 'https://picsum.photos/seed/doctor2/200/200',
        available: true,
    },
    {
        id: '3',
        name: 'د. سارة خالد المطيري',
        specialty: 'الأمراض الجلدية والتجميل',
        rating: 4.9,
        reviews: 298,
        experience: 12,
        certifications: ['استشارية جلدية', 'ماجستير تجميل'],
        location: 'عيادة الجمال الطبي - الرياض',
        nextAvailable: 'اليوم 05:00 م',
        price: 280,
        image: 'https://picsum.photos/seed/doctor3/200/200',
        available: true,
    },
    {
        id: '4',
        name: 'د. محمود حسن العمري',
        specialty: 'جراحة العظام والمفاصل',
        rating: 4.7,
        reviews: 155,
        experience: 18,
        certifications: ['استشاري عظام', 'زمالة ألمانية'],
        location: 'مركز العظام المتقدم - الدمام',
        nextAvailable: 'بعد غد 11:00 ص',
        price: 350,
        image: 'https://picsum.photos/seed/doctor4/200/200',
        available: true,
    },
    {
        id: '5',
        name: 'د. نورة سعد الدوسري',
        specialty: 'النساء والولادة',
        rating: 4.9,
        reviews: 312,
        experience: 14,
        certifications: ['استشارية نساء وولادة'],
        location: 'مستشفى الحياة - الرياض',
        nextAvailable: 'اليوم 04:30 م',
        price: 290,
        image: 'https://picsum.photos/seed/doctor5/200/200',
        available: true,
    },
    {
        id: '6',
        name: 'د. عبدالله يوسف القحطاني',
        specialty: 'طب العيون وجراحة الليزك',
        rating: 4.8,
        reviews: 187,
        experience: 16,
        certifications: ['استشاري عيون', 'زمالة بريطانية'],
        location: 'مركز الرؤية - جدة',
        nextAvailable: 'غداً 02:00 م',
        price: 320,
        image: 'https://picsum.photos/seed/doctor6/200/200',
        available: true,
    },
];


export default function SpecializedClinicsPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    // In a real app, this would be fetched from Firebase
    const [doctors, setDoctors] = useState(doctorsList);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    const handleBooking = (doctor: any) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'مطلوب تسجيل الدخول',
                description: 'الرجاء تسجيل الدخول أولاً لتتمكن من حجز موعد.',
            });
            router.push('/login');
        } else {
            const doctorData = encodeURIComponent(JSON.stringify(doctor));
            router.push(`/booking?doctor=${doctorData}`);
        }
    };

    return (
        <div className="bg-muted/30">
            <header className="container mx-auto py-12 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">اختر التخصص المناسب لحالتك الصحية</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
                    {initialSpecializedClinics.map(clinic => (
                        <Card 
                            key={clinic.id} 
                            className="text-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card"
                            onClick={() => setSelectedSpecialty(clinic.id)}
                        >
                            <div className="flex justify-center items-center h-12" dangerouslySetInnerHTML={{ __html: clinic.icon }} />
                            <p className="font-semibold mt-2 text-sm">{clinic.name}</p>
                            <p className="text-xs text-muted-foreground">{clinic.count} طبيب</p>
                        </Card>
                    ))}
                </div>
            </header>

            <main className="container mx-auto pb-16">
                 <div className="bg-card p-4 rounded-t-xl border-b">
                    <div className="flex justify-between items-center">
                         <h2 className="text-xl font-bold text-primary">الأطباء المتاحون</h2>
                         <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">تم العثور على {doctors.length} طبيب</p>
                             <Select defaultValue="highest-rated">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="ترتيب حسب" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="highest-rated">الأعلى تقييماً</SelectItem>
                                    <SelectItem value="lowest-price">الأقل سعراً</SelectItem>
                                    <SelectItem value="highest-price">الأعلى سعراً</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                 </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : doctors && doctors.length > 0 ? (
                    <div className="space-y-4 bg-card p-4 rounded-b-xl">
                        {doctors.map(doctor => (
                            <Card key={doctor.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                                {/* Doctor Info */}
                                <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                                     <Image src={doctor.image} alt={doctor.name} width={80} height={80} className="rounded-full border-2 border-primary/20" data-ai-hint="doctor portrait" />
                                     <div>
                                         <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{doctor.name}</h3>
                                            {doctor.available && <Badge variant="default" className="bg-green-500 hover:bg-green-600">متاح</Badge>}
                                         </div>
                                         <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                         <div className="flex items-center gap-4 mt-1 text-sm">
                                             <div className="flex items-center gap-1 text-amber-500">
                                                <Star className="w-4 h-4 fill-current"/>
                                                <span className="font-semibold">{doctor.rating}</span>
                                                <span className="text-xs text-muted-foreground">({doctor.reviews} تقييم)</span>
                                             </div>
                                              <div className="flex items-center gap-1">
                                                <BriefcaseMedical className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs">{doctor.experience} سنة خبرة</span>
                                              </div>
                                         </div>
                                     </div>
                                </div>
                                {/* Certifications */}
                                <div className="col-span-12 md:col-span-3 space-y-2 text-sm">
                                    {doctor.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-primary/70" />
                                            <span>{cert}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2">
                                       <MapPin className="w-4 h-4 text-primary/70" />
                                       <span>{doctor.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <CalendarClock className="w-4 h-4 text-primary/70" />
                                       <span>أقرب موعد: {doctor.nextAvailable}</span>
                                    </div>
                                </div>

                                {/* Booking */}
                                <div className="col-span-12 md:col-span-4 text-center md:text-left flex flex-row-reverse md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">رسوم الكشف</p>
                                        <p className="text-2xl font-bold text-primary">{doctor.price} ر.س</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto mt-0 md:mt-2">
                                        <Button className="flex-grow" onClick={() => handleBooking(doctor)}>احجز موعد</Button>
                                        <Button variant="outline" className="flex-grow">عرض الملف</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                         <Button variant="outline" className="w-full mt-4">عرض المزيد من الأطباء</Button>
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground bg-card rounded-b-xl">
                        <p>لا يوجد أطباء متاحون حالياً في هذا التخصص.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
