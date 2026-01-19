
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the Doctor type
interface Doctor {
    id: string;
    name: string;
    name_en?: string;
    specialty: string;
    specialty_en?: string;
    rating: number;
    reviews: number;
    experience: number;
    location: string;
    location_en?: string;
    price: number;
    image: string;
}

interface SearchResponse {
    success: boolean;
    data: Doctor[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
    error?: string;
}

export default function DoctorsDirectoryPage() {
    const { language, t } = useLanguage();
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const directoryT = t.servicePages.doctorsDirectory;

    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);

    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    // دالة البحث من الخادم
    const searchDoctors = useCallback(async (searchQuery: string, pageNum: number = 1, append: boolean = false) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                page: pageNum.toString(),
                limit: '20'
            });

            const response = await fetch(`/api/doctors/search?${params}`);
            const result: SearchResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to search doctors');
            }

            if (append) {
                setDoctors(prev => [...prev, ...result.data]);
            } else {
                setDoctors(result.data);
            }

            setHasMore(result.pagination.hasMore);
            setTotal(result.pagination.total);
            setPage(pageNum);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load doctors');
            toast({
                variant: 'destructive',
                title: language === 'ar' ? 'خطأ في البحث' : 'Search Error',
                description: err instanceof Error ? err.message : 'Failed to load doctors'
            });
        } finally {
            setIsLoading(false);
        }
    }, [language, toast]);

    // تحميل البيانات الأولية عند فتح الصفحة
    useEffect(() => {
        searchDoctors('', 1);
    }, [searchDoctors]);

    // البحث مع debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== undefined) {
                searchDoctors(searchTerm, 1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, searchDoctors]);

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

    const handleLoadMore = () => {
        searchDoctors(searchTerm, page + 1, true);
    };

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
                    {total > 0 && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            {language === 'ar' ? `تم العثور على ${total} طبيب` : `Found ${total} doctors`}
                        </p>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 py-16">
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {isLoading && doctors.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {doctors.length > 0 ? doctors.map(doc => (
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

                        {/* زر تحميل المزيد */}
                        {hasMore && doctors.length > 0 && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    variant="outline"
                                    size="lg"
                                    className="min-w-[200px]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                                        </>
                                    ) : (
                                        language === 'ar' ? 'تحميل المزيد' : 'Load More'
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
