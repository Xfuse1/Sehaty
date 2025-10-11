
"use client";

import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, Zap, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// The shape of the data in Firestore
interface PhysiotherapyPackageData {
    id: string;
    PackageName: string;
    Price: number;
    Duration: string;
    Description?: string;
    Features?: string;
    isPopular?: boolean;
}

// The shape of the data we use in our UI
interface DisplayPackage {
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
    features: string[];
    isPopular: boolean;
}

export default function PhysiotherapyPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const packagesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'physical_therapy');
    }, [firestore]);

    const { data: rawPackages = [], isLoading: packagesLoading } = useCollection<PhysiotherapyPackageData>(packagesQuery);

    // Transform the raw data into the format we need for display
    const physiotherapyPackages: DisplayPackage[] = (rawPackages || []).map(pkg => ({
        id: pkg.id,
        name: pkg.PackageName || '',
        price: pkg.Price || 0,
        duration: pkg.Duration || '',
        description: pkg.Description || '',
        features: pkg.Features ? pkg.Features.split('\n').filter(Boolean) : [],
        isPopular: pkg.isPopular || false
    }));

    const handleBooking = (pkg: DisplayPackage) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'مطلوب تسجيل الدخول',
                description: 'الرجاء تسجيل الدخول أولاً لتتمكن من حجز باقة.',
            });
            router.push('/login');
        } else {
            // Convert back to the format expected by the booking page
            const bookingData = {
                id: pkg.id,
                PackageName: pkg.name,
                Price: pkg.price,
                Duration: pkg.duration,
                Description: pkg.description,
                Features: pkg.features.join('\n'),
                isPopular: pkg.isPopular
            };
            const packageData = encodeURIComponent(JSON.stringify(bookingData));
            router.push(`/physiotherapy-booking?package=${packageData}`);
        }
    };

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        العلاج الطبيعي المنزلي
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        استعد حركتك وصحتك في راحة منزلك
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        نقدم باقات علاج طبيعي منزلية مخصصة على أيدي أفضل الأخصائيين لمساعدتك على التعافي والعودة لحياتك الطبيعية.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                 {packagesLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : physiotherapyPackages && physiotherapyPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {physiotherapyPackages.map((pkg) => (
                            <Card 
                                key={pkg.id} 
                                className={`flex flex-col h-full rounded-2xl shadow-sm transition-all duration-300 ${pkg.isPopular ? 'border-2 border-primary shadow-2xl -translate-y-4' : 'border'}`}
                            >
                                {pkg.isPopular && (
                                    <Badge className="absolute -top-3 right-6 flex items-center gap-1 bg-primary border-primary">
                                        <Zap className="h-4 w-4" />
                                        الأكثر طلباً
                                    </Badge>
                                )}
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-bold text-primary">{pkg.name}</CardTitle>
                                    <CardDescription>{pkg.duration}</CardDescription>
                                    <div className="text-4xl font-extrabold text-foreground mt-4">
                                        {pkg.price} <span className="text-lg font-medium text-muted-foreground">ر.س</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-center text-muted-foreground mb-6">{pkg.description}</p>
                                    <ul className="space-y-3 text-sm">
                                        {pkg.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="flex-1">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        size="lg" 
                                        className="w-full" 
                                        variant={pkg.isPopular ? 'default' : 'secondary'}
                                        onClick={() => handleBooking(pkg)}
                                    >
                                        حجز الباقة الآن
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p>لا توجد باقات متاحة حالياً. يرجى التحقق مرة أخرى لاحقًا.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

    