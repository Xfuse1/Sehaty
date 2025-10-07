
"use client";

import { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Camera, Bot, Upload, Droplet, TestTube, Heart, Sun, FileDown, BookOpen, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/firebase';

const commonTests = [
  {
    name: "تحليل فيتامين د",
    price: "180 ر.س",
    icon: <Sun className="h-8 w-8 text-amber-500" />,
  },
  {
    name: "صورة دم كاملة (CBC)",
    price: "90 ر.س",
    icon: <Droplet className="h-8 w-8 text-red-500" />,
  },
  {
    name: "وظائف كلى (Creatinine)",
    price: "50 ر.س",
    icon: <TestTube className="h-8 w-8 text-blue-500" />,
  },
  {
    name: "ملف الدهون (Lipid Profile)",
    price: "150 ر.س",
    icon: <Heart className="h-8 w-8 text-rose-500" />,
  },
];

const mockResults = [
    { id: 1, name: "صورة دم كاملة (CBC)", date: "2024-05-15", url: "#" },
    { id: 2, name: "تحليل فيتامين د (Vitamin D)", date: "2024-03-22", url: "#" },
    { id: 3, name: "ملف الدهون (Lipid Profile)", date: "2024-03-22", url: "#" },
];

const faqItems = [
    {
        question: "ماذا تعني رموز H و L بجانب النتائج؟",
        answer: "يرمز 'H' إلى 'High' (مرتفع)، ويعني أن النتيجة أعلى من المعدل الطبيعي. بينما يرمز 'L' إلى 'Low' (منخفض)، ويعني أن النتيجة أقل من المعدل الطبيعي. كلاهما قد يستدعي استشارة الطبيب."
    },
    {
        question: "ما هو 'النطاق المرجعي' أو 'Reference Range'؟",
        answer: "هو نطاق القيم الذي يعتبر طبيعيًا وصحيًا لمعظم الناس. إذا كانت نتيجتك تقع ضمن هذا النطاق، فهي غالبًا ما تكون طبيعية. ومع ذلك، يجب دائمًا مناقشة النتائج مع طبيبك."
    },
    {
        question: "هل أحتاج إلى الصيام قبل إجراء التحاليل؟",
        answer: "بعض التحاليل، مثل تحليل السكر وملف الدهون، تتطلب الصيام لمدة 8-12 ساعة للحصول على نتائج دقيقة. سيقوم المختبر دائمًا بإعلامك إذا كان الصيام ضروريًا للتحليل الذي تطلبه."
    }
];

export default function LabServicesPage() {
  const whatsappLink = "https://wa.me/201211886649";
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isUserLoading } = useUser();

  const handlePrescriptionRequest = () => {
    const message = `أرغب في الاستفسار عن تحليل طبي من خلال روشتة مرفقة.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`${whatsappLink}?text=${encodedMessage}`, '_blank');
  }

  const handleTestRequest = (testName: string) => {
    const message = `أرغب في حجز موعد لعمل "${testName}" في المنزل.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`${whatsappLink}?text=${encodedMessage}`, '_blank');
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        toast({ title: "تم اختيار الملف", description: `تم اختيار ملف ${file.name}. سيتم إرساله عبر واتساب.` });
        handlePrescriptionRequest();
    }
  };

  return (
    <div className="bg-background text-foreground">
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            التحاليل المخبرية المنزلية
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            دقتنا في التحليل، راحتك هي الأساس
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            اطلب تحاليلك الطبية بسهولة، وسحب العينات يتم في منزلك. دقة، سرعة، وراحة تامة.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">
        
        <section>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-t-4 border-primary">
            <CardHeader className="p-6 text-center">
                <CardTitle className="text-2xl text-primary font-headline">اطلب تحليلاً عبر الروشتة</CardTitle>
                <CardDescription className="text-muted-foreground">
                    صوّر أو ارفع روشتة التحاليل، وسنتواصل معك فوراً بالسعر والموعد.
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
                         <Textarea placeholder="أو اكتب أسماء التحاليل المطلوبة هنا..." className="min-h-[108px] text-base"/>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                        <p className="text-muted-foreground">سيتم تحويلك إلى واتساب لاستكمال الطلب مع المختص.</p>
                        <Button asChild size="lg" className="w-full text-lg">
                            <Link href={`${whatsappLink}?text=${encodeURIComponent("أرغب في طلب تحليل عبر الواتساب")}`} target="_blank">
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
                 <h2 className="text-3xl font-bold text-foreground">التحاليل الأكثر طلباً</h2>
                 <p className="text-muted-foreground mt-2">اختر التحليل المطلوب لطلبه مباشرة.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {commonTests.map((test) => (
                <Card key={test.name} className="overflow-hidden group flex flex-col">
                    <CardHeader className="flex flex-col items-center text-center p-6">
                        <div className="p-4 bg-accent rounded-full mb-4">
                            {test.icon}
                        </div>
                        <CardTitle className="text-lg font-semibold h-12">{test.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-grow text-center">
                         <p className="text-primary font-bold text-2xl">{test.price}</p>
                    </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" variant="secondary" onClick={() => handleTestRequest(test.name)}>
                      اطلب هذا التحليل
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
                    <h2 className="text-3xl font-bold text-foreground">نتائجي السابقة</h2>
                    <p className="text-muted-foreground mt-2">يمكنك عرض وتحميل نتائج تحاليلك السابقة من هنا.</p>
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
                 <CardTitle>سجل الدخول لعرض نتائجك</CardTitle>
                 <CardDescription className="mt-2">قم بتسجيل الدخول إلى حسابك لعرض سجل نتائج التحاليل الخاصة بك وتنزيلها.</CardDescription>
                 <Button asChild className="mt-6">
                     <Link href="/login">تسجيل الدخول</Link>
                 </Button>
             </Card>
        )}

        <section>
            <div className="text-center mb-12">
                 <BookOpen className="h-12 w-12 mx-auto text-primary mb-4"/>
                 <h2 className="text-3xl font-bold text-foreground">دليلك لقراءة التحاليل</h2>
                 <p className="text-muted-foreground mt-2">معلومات لمساعدتك على فهم نتائج تحاليلك بشكل أفضل.</p>
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


    