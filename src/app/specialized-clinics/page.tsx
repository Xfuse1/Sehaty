
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, DocumentData } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, Star, MapPin, Calendar as CalendarIcon, BriefcaseMedical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialSpecializedClinics, SpecializedClinicWithIcon } from '@/lib/site-content-data';

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
    tags: string[];
}

export default function SpecializedClinicsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('rating');

    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        let q = collection(firestore, 'doctors');
        return query(q, orderBy(sortBy, 'desc'));
    }, [firestore, sortBy]);

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
             const doctorData = encodeURIComponent(JSON.stringify(doctor));
             router.push(`/booking?doctor=${doctorData}`);
        }
    };
    
    const filteredDoctors = useMemo(() => {
        if (!doctors) return [];
        if (!selectedSpecialty) return doctors;
        return doctors.filter(doctor => doctor.specialty === selectedSpecialty);
    }, [doctors, selectedSpecialty]);

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                         <h2 className="text-2xl font-bold font-headline text-foreground">اختر التخصص المناسب لحالتك الصحية</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {initialSpecializedClinics.map(clinic => (
                            <Card 
                                key={clinic.id} 
                                className={`p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedSpecialty === clinic.name ? 'bg-primary/10 border-primary' : 'bg-card'}`}
                                onClick={() => setSelectedSpecialty(selectedSpecialty === clinic.name ? null : clinic.name)}
                            >
                                <div dangerouslySetInnerHTML={{ __html: clinic.icon || '<svg />' }} />
                                <p className="text-sm font-semibold text-center">{clinic.name}</p>
                            </Card>
                        ))}
                         <Card 
                            className={`p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${!selectedSpecialty ? 'bg-primary/10 border-primary' : 'bg-card'}`}
                            onClick={() => setSelectedSpecialty(null)}
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8.29 15.71L12 12l3.71 3.71"/><path d="m12 12-3.71-3.71L12 12l3.71-3.71"/></svg>
                            <p className="text-sm font-semibold text-center">الكل</p>
                        </Card>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold font-headline text-foreground">الأطباء المتاحون</h2>
                        <p className="text-muted-foreground text-sm">تم العثور على {filteredDoctors.length} طبيب</p>
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                             <SelectValue placeholder="ترتيب حسب..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                            <SelectItem value="price">الأقل سعراً</SelectItem>
                            <SelectItem value="experience">الأكثر خبرة</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : filteredDoctors.length > 0 ? (
                    <div className="space-y-6">
                        {filteredDoctors.map(doctor => (
                            <Card key={doctor.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl shadow-sm transition-shadow hover:shadow-md items-center">
                                {/* Doctor Info */}
                                <div className="md:col-span-8 flex gap-4">
                                    <Image src={doctor.image} alt={doctor.name} width={80} height={80} className="rounded-full border-4 border-background outline outline-1 outline-border h-20 w-20" data-ai-hint="doctor portrait" />
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-primary">{doctor.name}</h3>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">متصل</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">{doctor.specialty}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-bold">{doctor.rating}</span>
                                                <span>({doctor.reviews} تقييم)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BriefcaseMedical className="w-4 h-4" />
                                                <span>{doctor.experience} سنة خبرة</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {Array.isArray(doctor.tags) && doctor.tags.slice(0, 2).map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Location and Time */}
                                <div className="md:col-span-4 space-y-2 text-sm text-muted-foreground border-t md:border-t-0 md:border-r md:pr-6 pt-4 md:pt-0">
                                     <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/70" /> {doctor.location}</div>
                                     <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-primary/70" /> أقرب موعد: اليوم 10:00 م</div>
                                </div>
                                
                                <div className="md:col-span-12 border-t mt-4 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                     <div className="font-bold text-lg text-foreground">
                                        رسوم الكشف: <span className="text-primary text-xl">{doctor.price} ر.س</span>
                                     </div>
                                     <div className="flex gap-2 w-full md:w-auto">
                                        <Button variant="outline" className="flex-1 md:flex-initial">عرض الملف</Button>
                                        <Button className="flex-1 md:flex-initial" onClick={() => handleBookNowClick(doctor)}>احجز موعد</Button>
                                     </div>
                                </div>
                            </Card>
                        ))}
                         <div className="text-center pt-8">
                             <Button variant="outline">عرض المزيد من الأطباء</Button>
                         </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>لا يوجد أطباء متاحون في هذا التخصص حالياً.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

    