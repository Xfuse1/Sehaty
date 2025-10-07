
"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Search, Heart, Brain, Bone, Eye, Baby, Stethoscope, Scissors, Dna, Ear, Activity, Star, MapPin, Clock, Smile, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs } from 'firebase/firestore';

const specialties = [
  { name: "طب القلب", doctors: 30, icon: <Heart className="w-8 h-8 text-red-500" />, key: "cardiology" },
  { name: "طب الأعصاب", doctors: 22, icon: <Brain className="w-8 h-8 text-purple-500" />, key: "neurology" },
  { name: "طب العظام", doctors: 38, icon: <Bone className="w-8 h-8 text-gray-500" />, key: "orthopedics" },
  { name: "طب العيون", doctors: 25, icon: <Eye className="w-8 h-8 text-blue-500" />, key: "ophthalmology" },
  { name: "طب الأطفال", doctors: 40, icon: <Baby className="w-8 h-8 text-pink-500" />, key: "pediatrics" },
  { name: "الطب العام", doctors: 50, icon: <Stethoscope className="w-8 h-8 text-green-500" />, key: "general" },
  { name: "الجراحة", doctors: 28, icon: <Scissors className="w-8 h-8 text-slate-600" />, key: "surgery" },
  { name: "الجلدية", doctors: 44, icon: <Dna className="w-8 h-8 text-orange-500" />, key: "dermatology" },
  { name: "الباطنية", doctors: 48, icon: <Activity className="w-8 h-8 text-indigo-500" />, key: "internal" },
  { name: "الأنف والأذن", doctors: 29, icon: <Ear className="w-8 h-8 text-amber-600" />, key: "ent" },
  { name: "طب الأسنان", doctors: 35, icon: <Smile className="w-8 h-8 text-sky-500" />, key: "dentistry" },
  { name: "النساء والولادة", doctors: 41, icon: <Stethoscope className="w-8 h-8 text-rose-500" />, key: "gynecology" },
];

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  specialtyKey?: string;
  rating: number;
  reviews: number;
  experience: number;
  location: string;
  nextAppointment?: string;
  price: number;
  image: string;
  tags: string[];
  bio: string;
}


export default function ClinicsPage() {
    const [doctorsData, setDoctorsData] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('highest-rated');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchDoctors() {
            if (!firestore) return;
            try {
                setIsLoading(true);
                const doctorsCol = collection(firestore, 'doctors');
                const doctorsSnapshot = await getDocs(doctorsCol);
                const doctorsList = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
                setDoctorsData(doctorsList);
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
                toast({
                  variant: "destructive",
                  title: "خطأ في جلب الأطباء",
                  description: "لم نتمكن من تحميل قائمة الأطباء. يرجى المحاولة مرة أخرى.",
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchDoctors();
    }, [firestore, toast]);


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
    
    const filteredDoctors = doctorsData
        .filter(doctor => 
            (selectedSpecialty ? doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) : true) &&
            (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) || 
             doctor.location.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'highest-rated') {
                return b.rating - a.rating;
            }
            if (sortBy === 'lowest-price') {
                return a.price - b.price;
            }
            return 0;
        });

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        العيادات المتخصصة
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                        أفضل الأطباء في جميع التخصصات
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        ابحث عن الطبيب المناسب من بين مئات الأطباء المعتمدين في مختلف التخصصات الطبية
                    </p>
                    <div className="mt-8 max-w-2xl mx-auto flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Input 
                                placeholder="ابحث عن طبيب، تخصص، أو عيادة..." 
                                className="pl-10 h-12 text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                        <Button size="lg" className="h-12">بحث</Button>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-16 space-y-16">
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">التخصصات الطبية</h2>
                        <p className="text-muted-foreground mt-2">اختر التخصص المناسب لحالتك الصحية</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {specialties.map((spec) => (
                            <Card 
                                key={spec.key}
                                className={`p-4 flex flex-col items-center justify-center text-center rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${selectedSpecialty === spec.key ? 'border-primary shadow-lg bg-primary/5' : 'border-transparent'}`}
                                onClick={() => setSelectedSpecialty(spec.key === selectedSpecialty ? null : spec.key)}
                            >
                                <div className="p-3 bg-accent rounded-full mb-3">
                                    {spec.icon}
                                </div>
                                <h3 className="font-semibold text-sm md:text-base">{spec.name}</h3>
                                <p className="text-xs text-muted-foreground">{spec.doctors} طبيب</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">الأطباء المتاحون</h2>
                            <p className="text-muted-foreground">تم العثور على {filteredDoctors.length} طبيب</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">ترتيب حسب:</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="اختر ترتيب" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="highest-rated">الأعلى تقييماً</SelectItem>
                                    <SelectItem value="lowest-price">الأقل سعراً</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                         <div className="text-center py-8">
                            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                            <p className="mt-2 text-muted-foreground">جارِ تحميل بيانات الأطباء...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredDoctors.length > 0 ? filteredDoctors.map(doc => (
                                <Card key={doc.id} className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                                    <div className="flex-shrink-0 flex flex-col items-center w-full md:w-40">
                                        <div className="relative">
                                            <Image src={doc.image} alt={doc.name} width={100} height={100} className="rounded-full border-4 border-background outline outline-2 outline-border" data-ai-hint="doctor portrait" />
                                            <Badge className="absolute bottom-1 right-1 bg-green-500 border-green-500 text-white">متصل</Badge>
                                        </div>
                                        <div className="text-center mt-3">
                                            <div className="flex items-center justify-center gap-1 text-amber-500">
                                                <Star className="w-5 h-5 fill-current" />
                                                <span className="font-bold">{doc.rating}</span>
                                                <span className="text-xs text-muted-foreground">({doc.reviews})</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{doc.experience} سنة خبرة</p>
                                        </div>
                                    </div>

                                    <div className="flex-grow border-t md:border-t-0 md:border-r border-dashed pt-6 md:pt-0 md:pr-6 w-full">
                                        <h3 className="text-xl font-bold text-primary">{doc.name}</h3>
                                        <p className="text-muted-foreground font-medium">{doc.specialty}</p>
                                        <div className="flex flex-wrap gap-2 my-3">
                                            {doc.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                        </div>
                                        <div className="text-sm space-y-2 text-muted-foreground">
                                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/70" /> {doc.location}</div>
                                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary/70" /> أقرب موعد: {doc.nextAppointment || "استفسر للحجز"}</div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex flex-col items-center justify-between w-full md:w-48 border-t md:border-t-0 pt-6 md:pt-0 gap-4">
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">رسوم الكشف</p>
                                            <p className="text-3xl font-bold text-foreground">{doc.price} <span className="text-lg">ر.س</span></p>
                                        </div>
                                        <div className="w-full flex flex-col gap-2">
                                            <Button className="w-full" onClick={() => handleBooking(doc)}>احجز موعد</Button>
                                            <Button variant="outline" className="w-full" onClick={() => setSelectedDoctor(doc)}>عرض الملف</Button>
                                        </div>
                                    </div>
                                </Card>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">لا يوجد أطباء مطابقون لبحثك.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
            
            <Dialog open={!!selectedDoctor} onOpenChange={(isOpen) => !isOpen && setSelectedDoctor(null)}>
                <DialogContent className="sm:max-w-[425px]">
                     {selectedDoctor && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-primary">{selectedDoctor.name}</DialogTitle>
                                <DialogDescription>
                                    {selectedDoctor.specialty}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <p className="text-muted-foreground leading-relaxed">{selectedDoctor.bio}</p>
                                <div className="flex items-center justify-between text-sm border-t pt-4">
                                    <span className="text-muted-foreground">التقييم:</span>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold">{selectedDoctor.rating}</span>
                                        <span className="text-xs">({selectedDoctor.reviews} مراجعة)</span>
                                    </div>
                                </div>
                                 <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">سنوات الخبرة:</span>
                                    <span className="font-bold">{selectedDoctor.experience} سنة</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">رسوم الكشف:</span>
                                    <span className="font-bold text-primary">{selectedDoctor.price} ر.س</span>
                                </div>
                            </div>
                             <div className="mt-4 flex gap-2">
                                <Button className="flex-1" onClick={() => {
                                    handleBooking(selectedDoctor);
                                    setSelectedDoctor(null);
                                }}>حجز</Button>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" className="flex-1">
                                        إغلاق
                                    </Button>
                                </DialogClose>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

    