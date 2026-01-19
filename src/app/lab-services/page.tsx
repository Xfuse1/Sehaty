
"use client";

import { useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bot, Upload, Droplet, TestTube, Heart, Sun, BookOpen, Loader2, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { savePatientPrescription } from '@/lib/patient-records';
import { useLanguage } from '@/contexts/language-context';
import { useCollection } from '@/firebase/firestore/use-collection';

export default function LabServicesPage() {
  const { language, t } = useLanguage();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const labT = t.servicePages.lab;

  const firestore = useFirestore();
  const labTestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'lab_tests');
  }, [firestore]);

  const { data, isLoading: isTestsLoading } = useCollection<any>(labTestsQuery);
  const labTests = Array.isArray(data) ? data : [];

  const getTestIcon = (index: number) => {
    const icons = [
      <Sun key="0" className="h-8 w-8 text-amber-500" />,
      <Droplet key="1" className="h-8 w-8 text-red-500" />,
      <TestTube key="2" className="h-8 w-8 text-blue-500" />,
      <Heart key="3" className="h-8 w-8 text-rose-500" />,
    ];
    return icons[index % icons.length];
  };

  const faqItems = (labT.guide?.faq || []).map((item: any) => ({
    question: item.q,
    answer: item.a
  }));

  const whatsappLink = "https://wa.me/201000476674";
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const db = useFirestore();
  const [testDescription, setTestDescription] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleTestRequest = (testName: string) => {
    const message = language === 'ar' ? `أرغب في حجز موعد لعمل "${testName}" في المنزل.` : `I would like to book an appointment for "${testName}" at home.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`${whatsappLink}?text=${encodedMessage}`, '_blank');
  }

  const saveLabRequest = async (data: {
    userId: string;
    userName: string;
    testDescription: string;
    prescriptionUrl: string;
  }) => {
    try {
      const labRequestsRef = collection(db, 'lab-requests');
      await addDoc(labRequestsRef, {
        userId: data.userId,
        userName: data.userName,
        testDescription: data.testDescription,
        prescriptionUrl: data.prescriptionUrl,
        createdAt: Timestamp.now(),
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving lab request:', error);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: language === 'ar' ? "خطأ في تحميل الملف" : "File upload error",
          description: language === 'ar' ? "يجب تسجيل الدخول أولاً" : "Please login first",
        });
        return;
      }

      toast({
        title: language === 'ar' ? "جاري تحميل الملف" : "Uploading file",
        description: language === 'ar' ? "يرجى الانتظار..." : "Please wait..."
      });

      const imageUrl = await uploadToCloudinary(file);
      setUploadedImageUrl(imageUrl);

      toast({
        title: language === 'ar' ? "تم رفع الملف بنجاح" : "File uploaded successfully",
        description: language === 'ar' ? "يمكنك الآن إضافة وصف للتحليل والضغط على زر التواصل" : "You can now add a description and click the contact button"
      });
    } catch (error) {
      console.error('Error handling file:', error);
      toast({
        variant: "destructive",
        title: language === 'ar' ? "خطأ في تحميل الملف" : "File upload error",
        description: language === 'ar' ? "حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى." : "An error occurred while uploading. Please try again."
      });
    }
  };

  return (
    <div className="bg-background text-foreground" dir={dir}>
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-accent-foreground font-semibold">
            {labT.badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            {labT.title}
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            {labT.subtitle}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">

        <section>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-t-4 border-primary">
            <CardHeader className="p-6 text-center">
              <CardTitle className="text-2xl text-primary font-headline">{labT.prescriptionCard.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {labT.prescriptionCard.desc}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="h-24 flex-col gap-2 text-lg" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-8 w-8" />
                    <span>{labT.prescriptionCard.uploadText}</span>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
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
                    placeholder={labT.prescriptionCard.notesPlaceholder}
                    className="min-h-[108px] text-base"
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-center justify-center text-center gap-4">
                  <p className="text-muted-foreground">{labT.prescriptionCard.whatsappPrompt}</p>
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={async () => {
                      try {
                        if (!user) {
                          toast({
                            variant: "destructive",
                            title: language === 'ar' ? "خطأ" : "Error",
                            description: language === 'ar' ? "يجب تسجيل الدخول أولاً" : "Please login first",
                          });
                          return;
                        }

                        const userName = user.displayName || user.email || user.phoneNumber || user.uid;

                        if (uploadedImageUrl || testDescription) {
                          await saveLabRequest({
                            userId: user.uid,
                            userName: userName,
                            prescriptionUrl: uploadedImageUrl || '',
                            testDescription: testDescription.trim() || 'No description provided'
                          });

                          if (uploadedImageUrl) {
                            await savePatientPrescription(
                              user.uid,
                              userName,
                              uploadedImageUrl
                            );
                          }
                        }

                        let message = language === 'ar' ? `*طلب تحليل مختبري*\n\n` : `*Lab Test Request*\n\n`;
                        message += `${language === 'ar' ? '*الاسم:*' : '*Name:*'} ${userName}\n`;
                        message += `${language === 'ar' ? '*رقم المستخدم:*' : '*User ID:*'} ${user.uid}\n\n`;

                        if (testDescription) {
                          message += `${language === 'ar' ? '*التحاليل المطلوبة:*' : '*Required Tests:*'}\n${testDescription}\n\n`;
                        }

                        if (uploadedImageUrl) {
                          message += `${language === 'ar' ? '*صورة الروشتة:*' : '*Prescription Image:*'}\n${uploadedImageUrl}\n\n`;
                        }

                        message += language === 'ar' ? `نرجو التواصل معي لتأكيد الطلب والسعر والموعد.` : `Please contact me to confirm the order, price, and appointment.`;

                        window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');

                        setTestDescription("");
                        setUploadedImageUrl(null);
                      } catch (error) {
                        console.error('Error saving request:', error);
                        toast({
                          variant: "destructive",
                          title: language === 'ar' ? "خطأ في حفظ الطلب" : "Error saving request",
                          description: language === 'ar' ? "حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى." : "An error occurred. Please try again."
                        });
                      }
                    }}
                  >
                    <Bot className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-6 w-6`} />
                    {labT.prescriptionCard.sendButton}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">{labT.commonTests.title}</h2>
            <p className="text-muted-foreground mt-2">{labT.commonTests.subtitle}</p>
          </div>
          {isTestsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(labTests || []).map((test, index) => (
                <Card key={test.id} className="relative group flex flex-col break-words">
                  <CardHeader className="flex flex-col items-center text-center p-6">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      {getTestIcon(index)}
                    </div>
                    <CardTitle className="text-lg font-semibold h-12 break-all">{test.TestName}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-grow text-center">
                    <div className="text-primary font-bold text-2xl">
                      {test.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-sm line-through text-muted-foreground">{test.Price} {t.clinics.currency}</span>
                          <span>{test.discountPrice} {t.clinics.currency}</span>
                        </div>
                      ) : (
                        `${test.Price} ${t.clinics.currency}`
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" variant="secondary" onClick={() => handleTestRequest(test.TestName)}>
                      {labT.commonTests.orderButton}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>


        <section>
          <div className="text-center mb-12">
            <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-bold text-foreground">{labT.guide.title}</h2>
            <p className="text-muted-foreground mt-2">{labT.guide.subtitle}</p>
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
