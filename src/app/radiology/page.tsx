
"use client";

import { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Camera, Bot, Upload, FileDown, BookOpen, User, Loader2, Radio } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/firebase';

const commonScans = [
  {
    name: "أشعة سينية على الصدر (X-ray)",
    price: "250 ر.س",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500"><path d="M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"/><path d="M12 12L17.5 17.5"/><path d="M12 12L6.5 6.5"/><path d="M12 12l5.5-5.5"/><path d="M12 12l-5.5 5.5"/><circle cx="12" cy="12" r="10"/></svg>
    ,
  },
  {
    name: "موجات فوق صوتية (سونار) على البطن",
    price: "350 ر.س",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-500"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"/><path d="M5 9h14"/><path d="M12 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>,
  },
  {
    name: "أشعة دوبلر على الأوردة",
    price: "450 ر.س",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-purple-500"><path d="M16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4Z"/><path d="M12 18v-6"/><path d="m10 14 2-2 2 2"/></svg>,
  },
  {
    name: "موجات صوتية (ايكو) على القلب",
    price: "500 ر.س",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-rose-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  },
];

const mockResults = [
    { id: 1, name: "أشعة سينية على الصدر", date: "2024-06-10", url: "#" },
    { id: 2, name: "سونار على البطن والحوض", date: "2024-04-18", url: "#" },
];

const faqItems = [
    {
        question: "هل أحتاج إلى تحضير معين قبل إجراء الأشعة؟",
        answer: "بعض أنواع الأشعة تتطلب تحضيرات خاصة مثل الصيام أو شرب كميات معينة من الماء. على سبيل المثال، أشعة السونار على البطن تتطلب الصيام. سيقوم فريقنا بإعلامك بكافة التعليمات اللازمة عند تأكيد الموعد."
    },
    {
        question: "كم من الوقت يستغرق ظهور نتائج الأشعة؟",
        answer: "عادةً ما يتم كتابة تقرير الأشعة من قبل طبيب متخصص ويستغرق من 24 إلى 48 ساعة. سيتم إشعارك فور جهوزية النتائج على حسابك في التطبيق."
    },
    {
        question: "هل خدمة الأشعة المنزلية آمنة؟",
        answer: "نعم، نستخدم أجهزة أشعة متنقلة حديثة وآمنة تمامًا، ويقوم بالخدمة فنيون متخصصون يتبعون أعلى معايير السلامة والوقاية من الإشعاع لضمان سلامتك وسلامة أسرتك."
    }
];

export default function RadiologyPage() {
  const whatsappLink = "https://wa.me/201211886649";
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isUserLoading } = useUser();

  const handleRequest = (serviceName: string) => {
    const message = `أرغب في حجز موعد لعمل "${serviceName}" في المنزل.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`${whatsappLink}?text=${encodedMessage}`, '_blank');
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        toast({ title: "تم اختيار الملف", description: `تم اختيار ملف ${file.name}. سيتم إرساله عبر واتساب.` });
        const message = `أرغب في الاستفسار عن أشعة من خلال روشتة مرفقة.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`${whatsappLink}?text=${encodedMessage}`, '_blank');
    }
  };

  return (
    <div className="bg-background text-foreground">
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            الأشعة المنزلية
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            تشخيص دقيق في راحة بيتك
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            اطلب خدمات الأشعة المتنقلة (سونار، أشعة سينية) بسهولة، ويصلك فريقنا المتخصص لإجرائها في منزلك.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">
        
        <section>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-t-4 border-primary">
            <CardHeader className="p-6 text-center">
                <CardTitle className="text-2xl text-primary font-headline">اطلب أشعة عبر الروشتة</CardTitle>
                <CardDescription className="text-muted-foreground">
                    صوّر أو ارفع روشتة الأشعة، وسنتواصل معك فوراً بالسعر والموعد.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col gap-4">
                         <Button variant="outline" className="h-24 flex-col gap-2 text-lg" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-8 w-8" />
                            <span>ارفع صورة الروشتة</span>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf"/>
                        </Button>
                         <Textarea placeholder="أو اكتب أسماء الأشعة المطلوبة هنا..." className="min-h-[108px] text-base"/>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                        <p className="text-muted-foreground">سيتم تحويلك إلى واتساب لاستكمال الطلب مع المختص.</p>
                        <Button asChild size="lg" className="w-full text-lg">
                            <Link href={`${whatsappLink}?text=${encodeURIComponent("أرغب في طلب أشعة عبر الواتساب")}`} target="_blank">
                                <Bot className="ml-2 h-6 w-6" />
                                تواصل وابدأ الطلب
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </section>

        <section>
            <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold text-foreground">الأشعة الأكثر طلباً</h2>
                 <p className="text-muted-foreground mt-2">اختر الخدمة المطلوبة لطلبها مباشرة.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {commonScans.map((scan) => (
                <Card key={scan.name} className="overflow-hidden group flex flex-col">
                    <CardHeader className="flex flex-col items-center text-center p-6">
                        <div className="p-4 bg-accent rounded-full mb-4">
                            {scan.icon}
                        </div>
                        <CardTitle className="text-lg font-semibold h-12">{scan.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-grow text-center">
                         <p className="text-primary font-bold text-2xl">{scan.price}</p>
                    </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" variant="secondary" onClick={() => handleRequest(scan.name)}>
                      اطلب هذه الخدمة
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        </section>
        
        {isUserLoading ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : user ? (
            <section>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground">تقاريري السابقة</h2>
                    <p className="text-muted-foreground mt-2">يمكنك عرض وتحميل تقارير الأشعة السابقة من هنا.</p>
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                    {mockResults.map(result => (
                        <Card key={result.id} className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-semibold">{result.name}</p>
                                <p className="text-sm text-muted-foreground">تاريخ: {result.date}</p>
                            </div>
                            <Button variant="outline" size="icon" onClick={() => toast({ title: "جاري تحميل الملف..." })}>
                                <FileDown className="h-5 w-5" />
                                <span className="sr-only">Download PDF</span>
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>
        ) : (
             <Card className="max-w-3xl mx-auto text-center p-8 bg-gray-50">
                 <User className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                 <CardTitle>سجل الدخول لعرض تقاريرك</CardTitle>
                 <CardDescription className="mt-2">قم بتسجيل الدخول إلى حسابك لعرض سجل تقارير الأشعة الخاصة بك وتنزيلها.</CardDescription>
                 <Button asChild className="mt-6">
                     <Link href="/login">تسجيل الدخول</Link>
                 </Button>
             </Card>
        )}

        <section>
            <div className="text-center mb-12">
                 <BookOpen className="h-12 w-12 mx-auto text-primary mb-4"/>
                 <h2 className="text-3xl font-bold text-foreground">دليلك لخدمات الأشعة</h2>
                 <p className="text-muted-foreground mt-2">معلومات لمساعدتك على فهم خدماتنا بشكل أفضل.</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-lg font-semibold text-right hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
        </section>

      </main>
    </div>
  );
}

    