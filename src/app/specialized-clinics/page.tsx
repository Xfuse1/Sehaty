'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Star, MapPin, BriefcaseMedical, CalendarClock, GraduationCap, Search, Filter, Stethoscope, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge';
import { QuizBanner } from '@/components/home/quiz-banner';
import { initialSpecializedClinics } from '@/lib/site-content-data';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

export default function SpecializedClinicsPage() {
    const { t, language } = useLanguage();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

    // Firestore collection query
    const doctorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'doctors');
    }, [firestore]);

    const { data: doctors, isLoading: doctorsLoading } = useCollection<any>(doctorsQuery);

    const handleBooking = (doctor: any) => {
        if (!user) {
            sessionStorage.setItem('redirectAfterLogin', '/specialized-clinics');
            toast({
                variant: 'destructive',
                title: language === 'ar' ? 'مطلوب تسجيل الدخول' : 'Login Required',
                description: language === 'ar' ? 'الرجاء تسجيل الدخول أولاً لتتمكن من حجز موعد.' : 'Please login first to book an appointment.',
            });
            router.push('/login');
        } else {
            const doctorData = encodeURIComponent(JSON.stringify(doctor));
            router.push(`/booking?doctor=${doctorData}`);
        }
    };

    // Filter specialties based on search
    const filteredSpecialties = initialSpecializedClinics.filter(clinic => {
        const translated = (t.clinics.items as any)[clinic.id];
        if (!translated) return false;
        return translated.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            translated.desc.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Filter doctors
    // Filter doctors
    const filteredDoctors = (doctors || []).filter((d: any) => {
        if (!selectedSpecialty) return false;

        const clinic = initialSpecializedClinics.find(c => c.id === selectedSpecialty);
        const translated = (t.clinics.items as any)[selectedSpecialty];
        const clinicName = translated?.name || '';

        const docSpecialtyId = (d.specialtyId || '').toString().toLowerCase();
        const docSpecialtyName = (d.specialty || '').toString().toLowerCase();
        const docSpecialtyEn = (d.specialty_en || '').toString().toLowerCase();
        const selectedId = String(selectedSpecialty).toLowerCase();
        const selectedNameNormalized = clinicName.toLowerCase();

        // 1. Check exact ID match (if doctor has specialtyId field)
        if (docSpecialtyId === selectedId) return true;

        // 2. Check english specialty match with ID (useful if admin enters "Cardiology" for specialty_en)
        if (docSpecialtyEn.includes(selectedId)) return true;

        // 3. Robust keyword matching for Arabic/English Names
        // Split clinic name into words (e.g. "طب القلب" -> ["طب", "القلب"])
        // We check if "القلب" is in the doctor's specialty string.
        const keywords = selectedNameNormalized.split(' ').filter((w: string) => w.length > 2);

        const hasKeywordMatch = keywords.some((keyword: string) => {
            // Check direction 1: Doctor specialty contains clinic keyword (e.g. "Cardiovascular" contains "Cardio")
            if (docSpecialtyName.includes(keyword) || docSpecialtyEn.includes(keyword)) return true;

            // Check direction 2: Clinic keyword contains doctor specialty (e.g. "الباطنة" contains "باطنة")
            // specific check for Arabic AL- prefix difference
            if (docSpecialtyName.length > 2 && keyword.includes(docSpecialtyName)) return true;

            return false;
        });

        if (hasKeywordMatch) return true;

        // 4. Fallback: direct inclusion check
        return docSpecialtyName.includes(selectedNameNormalized);
    });

    const activeSpecialtyData = initialSpecializedClinics.find(c => c.id === selectedSpecialty);
    const activeTranslated = selectedSpecialty ? (t.clinics.items as any)[selectedSpecialty] : null;

    return (
        <div className="bg-background min-h-screen pb-20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <QuizBanner />
            {/* Header & Search */}
            <header className="bg-primary/5 py-12 md:py-16">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-primary/10 dark:bg-primary/20 text-primary border-primary/30 backdrop-blur-md px-4 py-1.5 rounded-full font-bold">
                        {t.clinics.badge}
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-bold font-headline text-foreground mb-6">
                        {t.clinics.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        {t.clinics.subtitle}
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <Input
                            placeholder={t.clinics.searchPlaceholder}
                            className={`h-12 ${language === 'ar' ? 'pr-12' : 'pl-12'} text-lg rounded-full shadow-sm border-primary/20 focus-visible:ring-primary`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5`} />
                    </div>
                </div>
            </header>

            {/* Specialties Grid */}
            <section className="container mx-auto px-4 -mt-8 mb-16 relative z-10">
                {!selectedSpecialty ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Featured Items - First 2 */}
                            {filteredSpecialties.slice(0, 2).map((clinic) => {
                                const tr = (t.clinics.items as any)[clinic.id];
                                return (
                                    <Card
                                        key={clinic.id}
                                        className="group overflow-hidden rounded-2xl border cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                        onClick={() => setSelectedSpecialty(clinic.id)}
                                    >
                                        <div className="flex flex-col sm:flex-row h-full">
                                            <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                                                <Image
                                                    src={clinic.image}
                                                    alt={tr.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 40vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                                            </div>
                                            <div className="p-6 flex flex-col justify-center sm:w-3/5 bg-card">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-2 rounded-full bg-primary/10 text-primary" dangerouslySetInnerHTML={{ __html: clinic.icon }} />
                                                    <h3 className="font-bold text-xl">{tr.name}</h3>
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{tr.desc}</p>
                                                <div className="mt-auto flex items-center justify-between text-sm">
                                                    <span className="text-primary font-semibold bg-primary/5 px-2 py-1 rounded-md">
                                                        {clinic.count} {t.clinics.availableDoctors}
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {t.clinics.startingFrom} {clinic.startingPrice} {t.clinics.currency}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredSpecialties.slice(2).map((clinic) => {
                                const tr = (t.clinics.items as any)[clinic.id];
                                return (
                                    <Card
                                        key={clinic.id}
                                        className="group rounded-xl overflow-hidden border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                        onClick={() => setSelectedSpecialty(clinic.id)}
                                    >
                                        <div className="relative h-40 w-full overflow-hidden">
                                            <Image
                                                src={clinic.image}
                                                alt={tr.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className={`absolute bottom-3 ${language === 'ar' ? 'right-3' : 'left-3'} text-white font-bold text-lg flex items-center gap-2`}>
                                                <div className="w-8 h-8 flex items-center justify-center bg-black/40 dark:bg-primary/20 backdrop-blur-md rounded-full border border-white/20" dangerouslySetInnerHTML={{ __html: clinic.icon }} />
                                                <span className="drop-shadow-md">{tr.name}</span>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{tr.desc}</p>
                                            <div className="flex items-center justify-between text-sm border-t pt-3">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Stethoscope className="w-4 h-4" />
                                                    <span>{clinic.count} {language === 'ar' ? 'أطباء' : 'Doctors'}</span>
                                                </div>
                                                <div className="font-semibold text-primary">
                                                    {language === 'ar' ? 'من' : 'From'} {clinic.startingPrice} {t.clinics.currency}
                                                </div>
                                            </div>
                                            <Button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white">
                                                {language === 'ar' ? 'عرض الأطباء' : 'View Doctors'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Button
                            variant="ghost"
                            className={`mb-6 hover:bg-transparent ${language === 'ar' ? 'pl-0' : 'pr-0'} gap-2`}
                            onClick={() => setSelectedSpecialty(null)}
                        >
                            <ChevronLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                            {language === 'ar' ? 'العودة للتخصصات' : 'Back to Specialties'}
                        </Button>

                        <div className="bg-card rounded-xl border p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-primary/5 border">
                                    <Image src={activeSpecialtyData?.image || ''} alt={activeTranslated?.name || ''} fill className="object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{activeTranslated?.name}</h2>
                                    <p className="text-muted-foreground">{activeTranslated?.desc}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Filter className="w-4 h-4" />
                                    {language === 'ar' ? 'تصفية' : 'Filter'}
                                </Button>
                                <Button className="bg-primary text-primary-foreground">
                                    {language === 'ar' ? 'الأقرب لي' : 'Nearest to me'}
                                </Button>
                            </div>
                        </div>

                        {doctorsLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        ) : filteredDoctors && filteredDoctors.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredDoctors.map((doctor: any) => (
                                    <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="flex flex-row items-stretch">
                                            {/* Image Size adjusted for mobile/desktop */}
                                            <div className="relative w-32 sm:w-48 min-h-[160px] shrink-0 bg-muted/20">
                                                <Image
                                                    src={doctor.image}
                                                    alt={doctor.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="p-5 sm:p-7 flex-1 flex flex-col">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                                    <div className="space-y-3 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-xl sm:text-2xl text-foreground">
                                                                {language === 'en' && doctor.name_en ? doctor.name_en : doctor.name}
                                                            </h3>
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0.5 text-[10px] sm:text-xs">
                                                                {language === 'ar' ? 'متاح اليوم' : 'Available Today'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-primary/80 text-sm sm:text-base font-semibold">
                                                            {language === 'en' && doctor.specialty_en ? doctor.specialty_en : doctor.specialty}
                                                        </p>

                                                        <div className="flex flex-wrap gap-3 items-center pt-1">
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold">
                                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                                <span>{doctor.rating}</span>
                                                                <span className="opacity-60 font-normal">({doctor.reviews})</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                                                                <BriefcaseMedical className="w-3.5 h-3.5" />
                                                                {doctor.experience} {language === 'ar' ? 'سنة خبرة' : 'years XP'}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm pl-1">
                                                                <MapPin className="w-4 h-4 text-primary/60" />
                                                                <span className="truncate max-w-[150px]">{language === 'en' && doctor.location_en ? doctor.location_en : doctor.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`p-4 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 min-w-[120px] text-center sm:${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                                        <p className="text-xs text-muted-foreground dark:text-muted-foreground/90 font-medium mb-1 uppercase tracking-wider">{language === 'ar' ? 'سعر الكشف' : 'Consultation'}</p>
                                                        <p className="text-2xl font-black text-primary leading-none">{doctor.price} <span className="text-sm font-bold opacity-80">{t.clinics.currency}</span></p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto sm:pt-4 border-t border-dashed border-muted-foreground/20">
                                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                                        <CalendarClock className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="whitespace-nowrap">{language === 'ar' ? 'أقرب موعد:' : 'Next available:'}</span>
                                                        <span className="text-foreground font-medium truncate">{doctor.nextAvailable || (language === 'ar' ? 'غداً، 10:00 ص' : 'Tomorrow, 10:00 AM')}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 w-full">
                                                        <Button variant="outline" className="w-full text-xs sm:text-sm h-10 px-1" onClick={() => setSelectedDoctor(doctor)}>
                                                            {language === 'ar' ? 'عرض الملف' : 'View Profile'}
                                                        </Button>
                                                        <Button className="w-full text-xs sm:text-sm h-10 px-1 font-bold shadow-md hover:shadow-xl transition-all" onClick={() => handleBooking(doctor)}>
                                                            {t.clinics.doctorsSection.bookNow}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-muted/20 rounded-xl border-dashed border-2">
                                <BriefcaseMedical className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-bold text-foreground">{t.clinics.doctorsSection.noDoctors}</h3>
                                <p className="text-muted-foreground mt-2">
                                    {language === 'ar' ? 'نعمل على إضافة المزيد من الأطباء لهذا التخصص قريباً.' : 'We are working on adding more doctors for this specialty soon.'}
                                </p>
                                <Button variant="link" className="mt-4" onClick={() => setSelectedSpecialty(null)}>
                                    {language === 'ar' ? 'تصفح تخصصات أخرى' : 'Browse other specialties'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Partners Section */}
            <section className="container mx-auto py-16 text-center border-t">
                <p className="text-muted-foreground mb-8 text-sm font-semibold uppercase tracking-wider">
                    {language === 'ar' ? 'شركاء الرعاية الصحية' : 'Healthcare Partners'}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <h3 className="text-xl md:text-2xl font-bold font-mono text-foreground">
                        {language === 'ar' ? 'مستشفى المستقبل' : 'Future Hospital'}
                    </h3>
                    <h3 className="text-xl md:text-2xl font-bold font-mono text-foreground">
                        {language === 'ar' ? 'المركز الطبي الدولي' : 'International Medical Center'}
                    </h3>
                    <h3 className="text-xl md:text-2xl font-bold font-mono text-foreground">
                        {language === 'ar' ? 'عيادات النخبة' : 'Elite Clinics'}
                    </h3>
                    <h3 className="text-xl md:text-2xl font-bold font-mono text-foreground">
                        {language === 'ar' ? 'مجموعة الرعاية' : 'Care Group'}
                    </h3>
                </div>
            </section>

            <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
                <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-card">
                    {selectedDoctor && (
                        <div className="flex flex-col h-full max-h-[90vh]">
                            {/* Header Section with Background Pattern */}
                            <div className="relative p-8 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Stethoscope className="w-24 h-24 rotate-12" />
                                </div>
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
                                    <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-background shadow-xl shrink-0 group">
                                        <Image src={selectedDoctor.image} alt={selectedDoctor.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-right space-y-3">
                                        <div>
                                            <DialogTitle className="text-2xl sm:text-3xl font-bold text-foreground font-headline mb-1">
                                                {language === 'en' && selectedDoctor.name_en ? selectedDoctor.name_en : selectedDoctor.name}
                                            </DialogTitle>
                                            <DialogDescription className="text-lg font-medium text-primary/80">
                                                {language === 'en' && selectedDoctor.specialty_en ? selectedDoctor.specialty_en : selectedDoctor.specialty}
                                            </DialogDescription>
                                        </div>
                                        <div className="flex justify-center sm:justify-start gap-3">
                                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 px-3 py-1 gap-1.5 rounded-full">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="font-bold">{selectedDoctor.rating}</span>
                                            </Badge>
                                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 gap-1.5 rounded-full">
                                                <BriefcaseMedical className="w-3.5 h-3.5" />
                                                <span className="font-bold">{selectedDoctor.experience} {language === 'ar' ? 'سنة خبرة' : 'years XP'}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section with Custom Scrollbar */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
                                {selectedDoctor.overview && (
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-lg flex items-center gap-2 text-foreground/90">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Stethoscope className="w-4 h-4 text-primary" />
                                            </div>
                                            {language === 'ar' ? 'نبذة عن الطبيب' : 'About Doctor'}
                                        </h4>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5 text-muted-foreground leading-relaxed text-sm break-all">
                                            {language === 'en' && selectedDoctor.overview_en ? selectedDoctor.overview_en : selectedDoctor.overview}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[1.5rem] bg-gradient-to-tr from-primary/10 dark:from-primary/20 to-transparent border border-primary/20 text-center space-y-2 group hover:border-primary/40 transition-colors">
                                        <p className="text-xs font-semibold text-muted-foreground/80 dark:text-muted-foreground uppercase tracking-wider">{language === 'ar' ? 'سعر الكشف' : 'Consultation'}</p>
                                        <p className="text-2xl font-black text-primary">{selectedDoctor.price} {t.clinics.currency}</p>
                                    </div>
                                    <div className="p-5 rounded-[1.5rem] bg-gradient-to-tr from-muted/50 dark:from-muted/20 to-transparent border border-muted-foreground/20 text-center space-y-2 hover:border-muted-foreground/40 transition-colors">
                                        <p className="text-xs font-semibold text-muted-foreground/80 dark:text-muted-foreground uppercase tracking-wider">{language === 'ar' ? 'وقت الانتظار' : 'Waiting Time'}</p>
                                        <p className="text-2xl font-black text-foreground">15 {language === 'ar' ? 'دقيقة' : 'min'}</p>
                                    </div>
                                </div>

                                {selectedDoctor.certifications && selectedDoctor.certifications.length > 0 && (
                                    <div className="space-y-4 pb-4">
                                        <h4 className="font-bold text-lg flex items-center gap-2 text-foreground/90">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <GraduationCap className="w-4 h-4 text-primary" />
                                            </div>
                                            {language === 'ar' ? 'المؤهلات العلمية' : 'Education & Certifications'}
                                        </h4>
                                        <div className="grid gap-3">
                                            {selectedDoctor.certifications.map((cert: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10">
                                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                    <span className="text-sm font-medium text-muted-foreground">{cert}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Section */}
                            <div className="p-8 pt-4 bg-background/80 backdrop-blur-md border-t border-muted/20">
                                <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.5)] hover:-translate-y-1 transition-all duration-300" onClick={() => {
                                    handleBooking(selectedDoctor);
                                    setSelectedDoctor(null);
                                }}>
                                    {t.clinics.doctorsSection.bookNow}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                }
            `}</style>
        </div>
    );
}
