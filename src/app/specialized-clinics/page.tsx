
"use client"

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { initialSpecializedClinics, SpecializedClinic, siteContentPaths } from '@/lib/site-content-data';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Loader2 } from 'lucide-react';

export default function SpecializedClinicsPage() {
    const [clinics, setClinics] = useState<SpecializedClinic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchClinics() {
            if (!firestore) return;
            
            const docRef = doc(firestore, 'siteContent', siteContentPaths.specializedClinics);

            try {
                setIsLoading(true);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Assuming the data is stored in a field called 'clinicsList'
                    if (data.clinicsList && Array.isArray(data.clinicsList)) {
                        setClinics(data.clinicsList);
                    } else {
                         // If the field is missing or not an array, use initial data
                        setClinics(initialSpecializedClinics);
                    }
                } else {
                    // If the document doesn't exist, create it with the initial data
                    console.log("Document not found. Creating with initial data.");
                    await setDoc(docRef, { clinicsList: initialSpecializedClinics });
                    setClinics(initialSpecializedClinics);
                    toast({
                        title: "تم إعداد المحتوى",
                        description: "تم إنشاء بيانات العيادات المتخصصة لأول مرة.",
                    });
                }
            } catch (error) {
                console.error("Error fetching or creating clinics data:", error);
                toast({
                    variant: "destructive",
                    title: "حدث خطأ",
                    description: "فشل في جلب بيانات العيادات. سنستخدم البيانات الافتراضية.",
                });
                // Fallback to initial data on error
                setClinics(initialSpecializedClinics);
            } finally {
                setIsLoading(false);
            }
        }

        fetchClinics();
    }, [firestore, toast]);

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
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {clinics.map((clinic) => (
                            <Card key={clinic.id} className="overflow-hidden group transition-shadow hover:shadow-xl">
                                <CardHeader className="p-0">
                                    <div className="relative w-full h-56">
                                        <Image
                                            src={clinic.image}
                                            alt={clinic.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            className="transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <CardTitle className="text-2xl font-bold text-primary mb-2">{clinic.name}</CardTitle>
                                    <p className="text-muted-foreground">
                                        {clinic.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
