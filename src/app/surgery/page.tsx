
"use client";

import { useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, GraduationCap, Hospital, BadgeDollarSign, Bot, Loader2, Scissors } from "lucide-react";
import Image from "next/image";
import { useLanguage } from '@/contexts/language-context';
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

export default function SurgeryPage() {
    const { language, t } = useLanguage();
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const surgeryT = t.servicePages.surgery;
    const firestore = useFirestore();

    const surgeryQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'surgeries');
    }, [firestore]);

    const { data: rawSurgeries, isLoading } = useCollection<any>(surgeryQuery);

    // Group surgeries by Category
    const groupedSurgeries = useMemo(() => {
        if (!rawSurgeries) return [];

        const groups: Record<string, any[]> = {};
        rawSurgeries.forEach(surg => {
            const cat = surg.Category || (language === 'ar' ? 'عام' : 'General');
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push({
                id: surg.id,
                name: surg.SurgeryName,
                description: surg.Description,
                price: surg.discountPrice || surg.Price,
                originalPrice: surg.Price,
                isPopular: surg.isPopular
            });
        });

        return Object.entries(groups).map(([name, items]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            items: items
        }));
    }, [rawSurgeries, language]);

    const whatsappLink = "https://wa.me/201000476674";

    const handleBooking = (surgeryName: string, price: any) => {
        const priceStr = price ? String(price) : '';
        const message = `
${surgeryT.whatsapp.title}

${surgeryT.whatsapp.surgery} ${surgeryName}
${priceStr ? `*السعر المقدر:* ${priceStr} ${t.clinics.currency}` : ''}

${surgeryT.whatsapp.prompt}
        `;
        const encodedMessage = encodeURIComponent(message.trim());
        const finalWhatsappUrl = `${whatsappLink}?text=${encodedMessage}`;
        window.open(finalWhatsappUrl, '_blank');
    };

    return (
        <div className="bg-background text-foreground" dir={dir}>
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary font-semibold">
                        {surgeryT.badge}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        {surgeryT.title}
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        {surgeryT.subtitle}
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : groupedSurgeries.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-6 text-start">
                            {groupedSurgeries.map((group) => (
                                <AccordionItem value={group.id} key={group.id} className="border bg-card rounded-2xl shadow-sm overflow-hidden">
                                    <AccordionTrigger className={`p-6 text-xl font-bold text-primary hover:no-underline hover:bg-primary/5 transition-colors ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {group.name}
                                    </AccordionTrigger>
                                    <AccordionContent className="p-6 pt-4 border-t">
                                        <div className="space-y-6">
                                            {group.items.map((item: any, index: number) => (
                                                <Card key={item.id || index} className={`group hover:shadow-md transition-shadow relative overflow-hidden ${item.isPopular ? 'border-primary/50 bg-primary/5' : ''}`}>
                                                    {item.isPopular && (
                                                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                                            {language === 'ar' ? 'الأكثر طلباً' : 'POPULAR'}
                                                        </div>
                                                    )}
                                                    <div className="p-6">
                                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                                            <div className="space-y-4 flex-1">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Scissors className="h-4 w-4 text-primary" />
                                                                        <h3 className="text-xl font-bold text-primary">{item.name}</h3>
                                                                    </div>
                                                                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                                                </div>

                                                                <div className="flex flex-wrap gap-4 text-sm font-medium">
                                                                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                                                                        <BadgeDollarSign className="h-4 w-4" />
                                                                        <span>{item.price} {t.clinics.currency}</span>
                                                                        {item.originalPrice > item.price && (
                                                                            <span className="text-xs line-through opacity-70 ml-1">{item.originalPrice}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-center">
                                                                <Button
                                                                    className="w-full md:w-auto px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                                                                    onClick={() => handleBooking(item.name, item.price)}
                                                                >
                                                                    <Bot className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                                                                    {surgeryT.bookNow}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-muted-foreground/20">
                            <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد عمليات متاحة حالياً' : 'No surgeries available at the moment'}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

