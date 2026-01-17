
"use client";

import { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary } from '@/lib/cloudinary';
import { savePatientPrescription } from '@/lib/patient-records';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Camera, Bot, Upload, FileDown, BookOpen, User, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/firebase';
import { useLanguage } from '@/contexts/language-context';

export default function RadiologyPage() {
  const { language, t } = useLanguage();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const radioT = t.servicePages.radiology;

  const commonScans = radioT.items.map((item: any, index: number) => ({
    name: item.name,
    price: `${item.price} ${t.clinics.currency}`,
    icon: [
      <svg key="0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500"><path d="M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" /><path d="M12 12L17.5 17.5" /><path d="M12 12L6.5 6.5" /><path d="M12 12l5.5-5.5" /><path d="M12 12l-5.5 5.5" /><circle cx="12" cy="12" r="10" /></svg>,
      <svg key="1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-500"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z" /><path d="M5 9h14" /><path d="M12 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>,
      <svg key="2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-purple-500"><path d="M16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4Z" /><path d="M12 18v-6" /><path d="m10 14 2-2 2 2" /></svg>,
      <svg key="3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-rose-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
    ][index] || <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><circle cx="12" cy="12" r="10" /></svg>,
  }));

  const mockResults = [
    { id: 1, name: language === 'ar' ? "أشعة سينية على الصدر" : "Chest X-ray", date: "2024-06-10", url: "#" },
    { id: 2, name: language === 'ar' ? "سونار على البطن والحوض" : "Abdominal & Pelvic Ultrasound", date: "2024-04-18", url: "#" },
  ];

  const faqItems = radioT.guide.faq.map((item: any) => ({
    question: item.q,
    answer: item.a
  }));

  const whatsappLink = "https://wa.me/201000476674";
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isUserLoading } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [scanDescription, setScanDescription] = useState("");

  const handleRequest = (serviceName: string) => {
    const message = language === 'ar' ? `أرغب في حجز موعد لعمل "${serviceName}" في المنزل.` : `I would like to book an appointment for "${serviceName}" at home.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`${whatsappLink}?text=${encodedMessage}`, '_blank');
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        toast({ title: language === 'ar' ? "جاري رفع الملف" : "Uploading file", description: language === 'ar' ? "يرجى الانتظار..." : "Please wait..." });

        const imageUrl = await uploadToCloudinary(file);
        setUploadedImageUrl(imageUrl);

        if (!user) {
          toast({
            variant: "destructive",
            title: language === 'ar' ? "خطأ" : "Error",
            description: language === 'ar' ? "يجب تسجيل الدخول أولاً" : "Please login first",
          });
          return;
        }

        await savePatientPrescription(
          user.uid,
          user.displayName || 'Unknown',
          imageUrl
        );

        toast({
          title: language === 'ar' ? "تم رفع الملف بنجاح" : "File uploaded successfully",
          description: language === 'ar' ? "يمكنك رؤية معاينة الصورة أدناه" : "You can see the image preview below"
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          variant: "destructive",
          title: language === 'ar' ? "خطأ في رفع الملف" : "File upload error",
          description: language === 'ar' ? "يرجى المحاولة مرة أخرى" : "Please try again"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="bg-background text-foreground" dir={dir}>
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-accent-foreground font-semibold">
            {radioT.badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            {radioT.title}
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            {radioT.subtitle}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">

        <section>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-t-4 border-primary">
            <CardHeader className="p-6 text-center">
              <CardTitle className="text-2xl text-primary font-headline">{radioT.prescriptionCard.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {radioT.prescriptionCard.desc}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 text-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span>{radioT.prescriptionCard.uploading}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8" />
                        <span>{radioT.prescriptionCard.uploadText}</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf"
                      disabled={isUploading}
                    />
                  </Button>
                  {uploadedImageUrl && (
                    <div className="relative border rounded-lg overflow-hidden">
                      <img
                        src={uploadedImageUrl}
                        alt="Uploaded prescription"
                        className="w-full h-auto max-h-48 object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className={`absolute top-2 ${language === 'ar' ? 'left-2' : 'right-2'}`}
                        onClick={() => {
                          setUploadedImageUrl(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                          toast({
                            title: language === 'ar' ? "تم حذف الصورة" : "Image deleted",
                            description: language === 'ar' ? "يمكنك رفع صورة جديدة" : "You can upload a new image"
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Textarea
                    placeholder={radioT.prescriptionCard.notesPlaceholder}
                    className="min-h-[108px] text-base"
                    value={scanDescription}
                    onChange={(e) => setScanDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-center justify-center text-center gap-4">
                  <p className="text-muted-foreground">{radioT.prescriptionCard.whatsappPrompt}</p>
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={() => {
                      if (!user) {
                        toast({
                          variant: "destructive",
                          title: language === 'ar' ? "خطأ" : "Error",
                          description: language === 'ar' ? "يجب تسجيل الدخول أولاً" : "Please login first",
                        });
                        return;
                      }

                      const userName = user.displayName || user.email || user.phoneNumber || user.uid;
                      let message = language === 'ar' ? `*طلب أشعة منزلية*\n\n` : `*Home Radiology Request*\n\n`;
                      message += `${language === 'ar' ? '*الاسم:*' : '*Name:*'} ${userName}\n`;
                      message += `${language === 'ar' ? '*رقم المستخدم:*' : '*User ID:*'} ${user.uid}\n\n`;

                      if (scanDescription) {
                        message += `${language === 'ar' ? '*الأشعة المطلوبة:*' : '*Required Scans:*'}\n${scanDescription}\n\n`;
                      }

                      if (uploadedImageUrl) {
                        message += `${language === 'ar' ? '*صورة الروشتة:*' : '*Prescription Image:*'}\n${uploadedImageUrl}\n\n`;
                      }

                      message += language === 'ar' ? `نرجو التواصل معي لتأكيد الطلب والسعر والموعد.` : `Please contact me to confirm the order, price, and appointment.`;

                      window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');

                      setScanDescription("");
                      setUploadedImageUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <Bot className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-6 w-6`} />
                    {radioT.prescriptionCard.sendButton}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">{radioT.commonScans.title}</h2>
            <p className="text-muted-foreground mt-2">{radioT.commonScans.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {commonScans.map((scan) => (
              <Card key={scan.name} className="relative group flex flex-col break-words">
                <CardHeader className="flex flex-col items-center text-center p-6">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {scan.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold h-12 break-all">{scan.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-grow text-center">
                  <p className="text-primary font-bold text-2xl">{scan.price}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" variant="secondary" onClick={() => handleRequest(scan.name)}>
                    {radioT.commonScans.orderButton}
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
              <h2 className="text-3xl font-bold text-foreground">{radioT.reports.title}</h2>
              <p className="text-muted-foreground mt-2">{radioT.reports.subtitle}</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {mockResults.map(result => (
                <Card key={result.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{result.name}</p>
                    <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'font-arabic' : ''}`}>
                      {language === 'ar' ? 'تاريخ:' : 'Date:'} {result.date}
                    </p>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => toast({ title: language === 'ar' ? "جاري تحميل الملف..." : "Downloading file..." })}>
                    <FileDown className="h-5 w-5" />
                    <span className="sr-only">{language === 'ar' ? "تحميل PDF" : "Download PDF"}</span>
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <Card className="max-w-3xl mx-auto text-center p-8 bg-muted/50">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>{radioT.reports.loginRequired}</CardTitle>
            <CardDescription className="mt-2">{radioT.reports.loginDesc}</CardDescription>
            <Button asChild className="mt-6">
              <Link href="/login">{language === 'ar' ? "تسجيل الدخول" : "Login"}</Link>
            </Button>
          </Card>
        )}

        <section>
          <div className="text-center mb-12">
            <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-bold text-foreground">{radioT.guide.title}</h2>
            <p className="text-muted-foreground mt-2">{radioT.guide.subtitle}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className={`text-lg font-semibold ${language === 'ar' ? 'text-right' : 'text-left'} hover:no-underline`}>
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
