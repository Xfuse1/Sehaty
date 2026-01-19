
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, DocumentData } from 'firebase/firestore';
import { useLanguage } from '@/contexts/language-context';

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
    const { language, t } = useLanguage();
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const directoryT = t.servicePages.doctorsDirectory;

    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'doctors');
    }, [firestore]);

    const { data, isLoading: doctorsLoading } = useCollection<Doctor>(doctorsQuery);
    const doctors = Array.isArray(data) ? data : [];

    const handleBooking = (doctor: Doctor) => {
        if (!user) {
            sessionStorage.setItem('redirectAfterLogin', '/doctors-directory');
            toast({
                variant: 'destructive',
                title: directoryT.loginRequired,
                description: directoryT.loginDesc,
            });
            router.push('/login');
        } else {
            const doctorData = encodeURIComponent(JSON.stringify(doctor));
            router.push(`/booking?doctor=${doctorData}`);
        }
    };

    const filteredDoctors = (doctors || []).filter(doc => {
        const searchTermLower = searchTerm.toLowerCase();
        const doctorName = (doc.name || '').toLowerCase();
        const doctorSpecialty = (doc.specialty || '').toLowerCase();

        return doctorName.includes(searchTermLower) ||
            doctorSpecialty.includes(searchTermLower);
    });

    return (
        <div className="bg-background text-foreground" dir={dir}>
            <header className="bg-primary/5 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary font-semibold">
                        {directoryT.badge}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                        {directoryT.title}
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        {directoryT.subtitle}
                    </p>
                    <div className="mt-8 max-w-2xl mx-auto flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Input
                                placeholder={directoryT.searchPlaceholder}
                                className={`${language === 'ar' ? 'pr-10' : 'pl-10'} h-12 text-base`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
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
                                        <div className="flex items-center justify-center gap-1 text-accent">
                                            <Star className="w-5 h-5 fill-current" />
                                            <span className="font-bold">{doc.rating}</span>
                                            <span className="text-xs text-muted-foreground">({doc.reviews} {directoryT.reviews})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex-grow border-t md:border-t-0 ${language === 'ar' ? 'md:border-r pr-6' : 'md:border-l pl-6'} border-dashed pt-6 md:pt-0 w-full`}>
                                    <h3 className="text-xl font-bold text-primary">
                                        {language === 'en' && doc.name_en ? doc.name_en : doc.name}
                                    </h3>
                                    <p className="text-muted-foreground font-medium">
                                        {language === 'en' && doc.specialty_en ? doc.specialty_en : doc.specialty}
                                    </p>
                                    <div className="text-sm space-y-2 text-muted-foreground mt-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary/70" />
                                            {language === 'en' && doc.location_en ? doc.location_en : doc.location}
                                        </div>
                                        <div className="flex items-center gap-2"><strong>{doc.experience}</strong> {directoryT.experience}</div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-48 border-t md:border-t-0 pt-6 md:pt-0 gap-4 self-center">
                                    <div className="font-bold text-lg">{doc.price} {t.clinics.currency}</div>
                                    <Button className="w-full" onClick={() => handleBooking(doc)}>{directoryT.bookNow}</Button>
                                </div>
                            </Card>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">{directoryT.noResults}</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
