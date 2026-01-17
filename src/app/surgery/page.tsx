
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, GraduationCap, Hospital, BadgeDollarSign, Bot } from "lucide-react";
import Image from "next/image";
import { useLanguage } from '@/contexts/language-context';

export default function SurgeryPage() {
    const { language, t } = useLanguage();
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const surgeryT = t.servicePages.surgery;

    const surgeries = surgeryT.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        doctors: item.doctors.map((doc: { name: string; qual: string; loc: string; price: string }, index: number) => ({
            name: doc.name,
            qualifications: doc.qual,
            location: doc.loc,
            price: `${doc.price} ${t.clinics.currency}`,
            image: `https://picsum.photos/seed/doctor_surg_${item.id}_${index}/200/200`,
        }))
    }));

    const whatsappLink = "https://wa.me/201000476674";

    const handleBooking = (surgeryName: string, doctorName: string, location: string) => {
        const message = `
${surgeryT.whatsapp.title}

${surgeryT.whatsapp.surgery} ${surgeryName}
${surgeryT.whatsapp.doctor} ${doctorName}
${surgeryT.whatsapp.place} ${location}

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
                    <Accordion type="single" collapsible className="w-full space-y-6">
                        {surgeries.map((surgery) => (
                            <AccordionItem value={surgery.id} key={surgery.id} className="border bg-card rounded-2xl shadow-sm">
                                <AccordionTrigger className={`p-6 text-xl font-bold text-primary hover:no-underline ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                    {surgery.name}
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                    <p className="text-muted-foreground mb-8">{surgery.description}</p>
                                    <div className="space-y-6">
                                        {surgery.doctors.map((doctor: any, index: number) => (
                                            <Card key={index} className="flex flex-col md:flex-row items-start gap-6 p-4 rounded-xl border-border">
                                                <div className="flex-shrink-0 flex flex-col items-center w-full md:w-40">
                                                    <Image src={doctor.image} alt={doctor.name} width={100} height={100} className="rounded-full border-4 border-primary/10" data-ai-hint="doctor portrait" />
                                                </div>
                                                <div className="flex-grow w-full">
                                                    <CardHeader className="p-0">
                                                        <CardTitle className="text-lg flex items-center gap-2"><User className="text-primary h-5 w-5" />{doctor.name}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0 mt-4 space-y-3 text-sm">
                                                        <div className="flex items-start gap-2">
                                                            <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
                                                            <p><span className="font-semibold">{surgeryT.qualifications}:</span> {doctor.qualifications}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Hospital className="h-4 w-4 text-muted-foreground" />
                                                            <p><span className="font-semibold">{surgeryT.location}:</span> {doctor.location}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <p><span className="font-semibold">{surgeryT.approxPrice}:</span> <span className="font-bold text-primary">{doctor.price}</span></p>
                                                        </div>
                                                    </CardContent>
                                                </div>
                                                <CardFooter className="p-0 w-full md:w-auto mt-4 md:mt-0 self-center">
                                                    <Button className="w-full md:w-auto whitespace-nowrap px-6" onClick={() => handleBooking(surgery.name, doctor.name, doctor.location)}>
                                                        <Bot className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
                                                        {surgeryT.bookNow}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </main>
        </div>
    );
}

