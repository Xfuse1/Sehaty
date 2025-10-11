
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User, GraduationCap, Hospital, BadgeDollarSign, Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const surgeries = [
    {
        id: "rhinoplasty",
        name: "تجميل الأنف",
        description: "عملية تهدف إلى تحسين شكل الأنف وتناسقه مع ملامح الوجه، أو إصلاح المشاكل التنفسية.",
        doctors: [
            {
                name: "د. سالم عبدالله",
                qualifications: "استشاري جراحة تجميل، البورد الكندي",
                location: "مركز الرياض للجراحة التجميلية",
                price: "22,000 ر.س",
                image: "https://picsum.photos/seed/doctor7/200/200",
            },
            {
                name: "د. عائشة محمد",
                qualifications: "أخصائية جراحة الوجه والفكين",
                location: "مستشفى جدة التخصصي",
                price: "25,000 ر.س",
                image: "https://picsum.photos/seed/doctor8/200/200",
            },
        ],
    },
    {
        id: "liposuction",
        name: "شفط الدهون",
        description: "إجراء تجميلي يهدف إلى إزالة الدهون الزائدة من مناطق معينة في الجسم لتحسين الشكل العام.",
        doctors: [
            {
                name: "د. خالد الأحمدي",
                qualifications: "استشاري جراحة تجميل ونحت القوام",
                location: "عيادات بيوتي كلينك - الدمام",
                price: "18,000 ر.س",
                image: "https://picsum.photos/seed/doctor9/200/200",
            },
        ],
    },
    {
        id: "gastric_sleeve",
        name: "تكميم المعدة",
        description: "عملية جراحية لإنقاص الوزن تتم عن طريق تصغير حجم المعدة، مما يقلل من كمية الطعام المتناول.",
        doctors: [
            {
                name: "د. يوسف إبراهيم",
                qualifications: "استشاري جراحة السمنة والمناظير",
                location: "المستشفى السعودي الألماني - الرياض",
                price: "35,000 ر.س",
                image: "https://picsum.photos/seed/doctor10/200/200",
            },
            {
                name: "د. فهد عبدالعزيز",
                qualifications: "زمالة جراحة السمنة من فرنسا",
                location: "مستشفى دله - الرياض",
                price: "40,000 ر.س",
                image: "https://picsum.photos/seed/doctor11/200/200",
            },
        ],
    },
];

const whatsappLink = "https://wa.me/201211886649";

export default function SurgeryPage() {

    const handleBooking = (surgeryName: string, doctorName: string, location: string) => {
        const message = `
*طلب حجز استشارة لعملية جراحية*

*العملية المطلوبة:* ${surgeryName}
*مع الطبيب:* ${doctorName}
*في:* ${location}

أرغب في الاستفسار عن المواعيد المتاحة وتفاصيل الحجز.
        `;
        const encodedMessage = encodeURIComponent(message.trim());
        const finalWhatsappUrl = `${whatsappLink}?text=${encodedMessage}`;
        window.open(finalWhatsappUrl, '_blank');
    };

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        العمليات الجراحية
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        حلول جراحية متقدمة بأيدي خبراء
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        نقدم لكم نخبة من أفضل الجراحين في مختلف التخصصات لتحقيق أفضل النتائج بأمان تام.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-6">
                        {surgeries.map((surgery) => (
                            <AccordionItem value={surgery.id} key={surgery.id} className="border bg-card rounded-2xl shadow-sm">
                                <AccordionTrigger className="p-6 text-xl font-bold text-primary hover:no-underline">
                                    {surgery.name}
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                    <p className="text-muted-foreground mb-8">{surgery.description}</p>
                                    <div className="space-y-6">
                                        {surgery.doctors.map((doctor, index) => (
                                            <Card key={index} className="flex flex-col md:flex-row items-start gap-6 p-4 rounded-xl border-border">
                                                <div className="flex-shrink-0 flex flex-col items-center w-full md:w-40">
                                                    <Image src={doctor.image} alt={doctor.name} width={100} height={100} className="rounded-full border-4 border-primary/10" data-ai-hint="doctor portrait" />
                                                </div>
                                                <div className="flex-grow w-full">
                                                    <CardHeader className="p-0">
                                                        <CardTitle className="text-lg flex items-center gap-2"><User className="text-primary" />{doctor.name}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0 mt-4 space-y-3 text-sm">
                                                        <div className="flex items-start gap-2">
                                                            <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
                                                            <p><span className="font-semibold">المؤهلات:</span> {doctor.qualifications}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Hospital className="h-4 w-4 text-muted-foreground" />
                                                            <p><span className="font-semibold">المكان:</span> {doctor.location}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <p><span className="font-semibold">السعر التقريبي:</span> <span className="font-bold text-primary">{doctor.price}</span></p>
                                                        </div>
                                                    </CardContent>
                                                </div>
                                                <CardFooter className="p-0 w-full md:w-auto mt-4 md:mt-0 self-center">
                                                    <Button className="w-full md:w-auto" onClick={() => handleBooking(surgery.name, doctor.name, doctor.location)}>
                                                        <Bot className="ml-2 h-5 w-5" />
                                                        اطلب حجز الآن
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

