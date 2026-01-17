
"use client";

import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, Zap, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection } from 'firebase/firestore';
import { useLanguage } from '@/contexts/language-context';

interface PhysioPackage {
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
    features: string[];
    isPopular: boolean;
}

export default function PhysiotherapyPage() {
    const { language, t } = useLanguage();
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const physioT = t.servicePages.physio;

    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const packagesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'physical_therapy');
    }, [firestore]);

    const { data: rawPackages, isLoading: packagesLoading } = useCollection(packagesQuery);

    const physioPackages = rawPackages?.map(doc => {
        const name = (language === 'en' && doc.PackageName_en) ? doc.PackageName_en : (doc.PackageName || '');
        const description = (language === 'en' && doc.Description_en) ? doc.Description_en : (doc.Description || '');
        const featuresStr = (language === 'en' && doc.Features_en) ? doc.Features_en : (doc.Features || '');

        return {
            id: doc.id,
            name,
            price: doc.Price || 0,
            duration: (language === 'en' && doc.Duration_en) ? doc.Duration_en : (doc.Duration || ''),
            description,
            features: featuresStr ? featuresStr.split('\n').filter((f: string) => Boolean(f)) : [],
            isPopular: doc.isPopular || false
        };
    });

    const handleBooking = (pkg: PhysioPackage) => {
        if (!user) {
            sessionStorage.setItem('redirectAfterLogin', '/physiotherapy');
            toast({
                variant: 'destructive',
                title: t.common.error,
                description: t.common.loginRequired,
            });
            router.push('/login');
        } else {
            const packageData = encodeURIComponent(JSON.stringify(pkg));
            router.push(`/physiotherapy-booking?package=${packageData}`);
        }
    };

    return (
        <div className="bg-background text-foreground" dir={dir}>
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-accent-foreground font-semibold">
                        {physioT.badge}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        {physioT.title}
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        {physioT.subtitle}
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                {packagesLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : physioPackages && physioPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {physioPackages.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className={`relative flex flex-col h-full rounded-2xl shadow-sm transition-all duration-300 break-words ${pkg.isPopular ? 'border-2 border-primary shadow-2xl -translate-y-4' : 'border'}`}
                            >
                                {pkg.isPopular && (
                                    <Badge className={`absolute -top-3 ${language === 'ar' ? 'right-6' : 'left-6'} flex items-center gap-1 bg-primary border-primary`}>
                                        <Zap className="h-4 w-4" />
                                        {physioT.popular}
                                    </Badge>
                                )}
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-bold text-primary">{pkg.name}</CardTitle>
                                    <CardDescription>{pkg.duration}</CardDescription>
                                    <div className="text-4xl font-extrabold text-foreground mt-4">
                                        {pkg.price} <span className="text-lg font-medium text-muted-foreground">{t.clinics.currency}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-hidden">
                                    <p className="text-center text-muted-foreground mb-6 break-all">{pkg.description}</p>
                                    <ul className="space-y-3 text-sm">
                                        {pkg.features.map((feature: string, index: number) => (
                                            <li key={index} className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                <span className="flex-1 break-all">{feature}</span>
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
                                        {physioT.bookNow}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p>{physioT.noPackages}</p>
                    </div>
                )}
            </main>
        </div>
    );
}