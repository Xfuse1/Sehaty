
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin, Phone, Building } from "lucide-react";
import Image from "next/image";
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const contractedDoctors = [
    {
        id: "doctor1",
        name: "د. فاطمة على الأحمد",
        specialty: "طب الأطفال وحديثي الولادة",
        specialtyKey: "pediatrics",
        rating: 4.9,
        reviews: 153,
        experience: 15,
        location: "عيادة الأمل - جدة",
        price: 250,
        image: "https://picsum.photos/seed/doctor1/200/200",
    },
    {
        id: "doctor3",
        name: "د. سارة خالد المطيري",
        specialty: "الأمراض الجلدية والتجميل",
        specialtyKey: "dermatology",
        rating: 4.9,
        reviews: 289,
        experience: 12,
        location: "عيادة الجمال الطبي - الرياض",
        price: 280,
        image: "https://picsum.photos/seed/doctor3/200/200",
    },
];

const directoryList = [
    { type: 'doctor', name: 'د. محمد خان', specialty: 'طب عام', location: 'الرياض، حي العليا', phone: '011-462-XXXX' },
    { type: 'doctor', name: 'د. ليلى المصري', specialty: 'طب أسنان', location: 'جدة، حي السلامة', phone: '012-665-XXXX' },
    { type: 'pharmacy', name: 'صيدلية النهدي', specialty: 'صيدلية', location: 'فروع متعددة', phone: '920000955' },
    { type: 'pharmacy', name: 'صيدلية الدواء', specialty: 'صيدلية', location: 'فروع متعددة', phone: '920000828' },
    { type: 'doctor', name: 'د. عبدالله القحطاني', specialty: 'أنف وأذن وحنجرة', location: 'الدمام، حي الشاطئ', phone: '013-833-XXXX' },
]

export default function DoctorsDirectoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const handleBooking = (doctor: typeof contractedDoctors[0]) => {
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
    
    const filteredContractedDoctors = contractedDoctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDirectory = directoryList.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        دليل الأطباء والصيدليات
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                        بوابتك للوصول إلى الرعاية الصحية
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        ابحث عن الأطباء والصيدليات، سواء المتعاقدين معنا للحجز المباشر أو غيرهم للتواصل المباشر.
                    </p>
                    <div className="mt-8 max-w-2xl mx-auto flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Input 
                                placeholder="ابحث بالاسم، التخصص، أو المدينة..." 
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
                 <Tabs defaultValue="contracted" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12">
                        <TabsTrigger value="contracted" className="text-base h-10">شركاؤنا (للحجز المباشر)</TabsTrigger>
                        <TabsTrigger value="directory" className="text-base h-10">الدليل العام (للتواصل)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="contracted" className="mt-8">
                        <div className="space-y-6">
                            {filteredContractedDoctors.map(doc => (
                                <Card key={doc.id} className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                                    <div className="flex-shrink-0 flex flex-col items-center w-full md:w-40">
                                        <Image src={doc.image} alt={doc.name} width={100} height={100} className="rounded-full border-4 border-background outline outline-2 outline-border" data-ai-hint="doctor portrait" />
                                        <div className="text-center mt-3">
                                            <div className="flex items-center justify-center gap-1 text-amber-500">
                                                <Star className="w-5 h-5 fill-current" />
                                                <span className="font-bold">{doc.rating}</span>
                                                <span className="text-xs text-muted-foreground">({doc.reviews})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-grow border-t md:border-t-0 md:border-r border-dashed pt-6 md:pt-0 md:pr-6 w-full">
                                        <h3 className="text-xl font-bold text-primary">{doc.name}</h3>
                                        <p className="text-muted-foreground font-medium">{doc.specialty}</p>
                                        <div className="text-sm space-y-2 text-muted-foreground mt-3">
                                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/70" /> {doc.location}</div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-48 border-t md:border-t-0 pt-6 md:pt-0 gap-4 self-center">
                                        <Button className="w-full" onClick={() => handleBooking(doc)}>احجز الآن</Button>
                                    </div>
                                </Card>
                            ))}
                             {filteredContractedDoctors.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">لا توجد نتائج مطابقة لبحثك في قائمة شركائنا.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="directory" className="mt-8">
                        <div className="space-y-4">
                            {filteredDirectory.map((item, index) => (
                                <Card key={index} className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                        <div className="sm:col-span-1 flex items-center gap-3">
                                            {item.type === 'doctor' ? 
                                              <Image src={`https://picsum.photos/seed/dir_doc${index}/100/100`} alt={item.name} width={50} height={50} className="rounded-full" data-ai-hint="doctor portrait" />
                                              : <div className="p-3 bg-gray-100 rounded-full"><Building className="w-6 h-6 text-gray-500" /></div>
                                            }
                                            <div>
                                                <p className="font-bold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-1 flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span>{item.location}</span>
                                        </div>
                                        <div className="sm:col-span-1 flex items-center gap-2 text-sm font-semibold text-primary">
                                            <Phone className="w-4 h-4" />
                                            <a href={`tel:${item.phone}`} className="hover:underline" dir="ltr">{item.phone}</a>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {filteredDirectory.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">لا توجد نتائج مطابقة لبحثك في الدليل العام.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
