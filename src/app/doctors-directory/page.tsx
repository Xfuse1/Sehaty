
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, DocumentData } from 'firebase/firestore';

// Define the Doctor type based on what we expect from Firestore
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
}

export default function DoctorsDirectoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'doctors');
    }, [firestore]);

    const { data: doctors, isLoading: doctorsLoading } = useCollection<Doctor>(doctorsQuery);

    const handleBooking = (doctor: Doctor) => {
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
    
    const filteredDoctors = (doctors || []).filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        دليل الأطباء
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                        ابحث عن أفضل الأطباء لحجز موعد
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        نوفر لك قائمة بأفضل الأطباء المتعاقدين معنا لحجز مباشر وسريع.
                    </p>
                    <div className="mt-8 max-w-2xl mx-auto flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Input 
                                placeholder="ابحث بالاسم أو التخصص..." 
                                className="pl-10 h-12 text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16">
                {doctorsLoading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredDoctors.length > 0 ? filteredDoctors.map(doc => (
                            <Card key={doc.id} className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex-shrink-0 flex flex-col items-center w-full md:w-40">
                                    <Image src={doc.image} alt={doc.name} width={100} height={100} className="rounded-full border-4 border-background outline outline-2 outline-border" data-ai-hint="doctor portrait" />
                                    <div className="text-center mt-3">
                                        <div className="flex items-center justify-center gap-1 text-amber-500">
                                            <Star className="w-5 h-5 fill-current" />
                                            <span className="font-bold">{doc.rating}</span>
                                            <span className="text-xs text-muted-foreground">({doc.reviews} مراجعة)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-grow border-t md:border-t-0 md:border-r border-dashed pt-6 md:pt-0 md:pr-6 w-full">
                                    <h3 className="text-xl font-bold text-primary">{doc.name}</h3>
                                    <p className="text-muted-foreground font-medium">{doc.specialty}</p>
                                    <div className="text-sm space-y-2 text-muted-foreground mt-3">
                                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/70" /> {doc.location}</div>
                                        <div className="flex items-center gap-2"><strong>{doc.experience}</strong> سنة خبرة</div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-48 border-t md:border-t-0 pt-6 md:pt-0 gap-4 self-center">
                                    <div className="font-bold text-lg">{(doc.price)} ريال</div>
                                    <Button className="w-full" onClick={() => handleBooking(doc)}>احجز الآن</Button>
                                </div>
                            </Card>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">لا توجد نتائج مطابقة لبحثك.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
