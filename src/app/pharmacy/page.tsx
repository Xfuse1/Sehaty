
"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Camera, Bot, Star, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { savePrescriptionToAirtable } from '@/lib/airtable';
import { useLanguage } from '@/contexts/language-context';

interface Product {
  id: number;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  price: number;
  rating: number;
  image: string;
  category: string;
}

interface SearchResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string;
}

export default function PharmacyPage() {
  const { language, t } = useLanguage();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const pharmaT = t.servicePages.pharmacy;

  const whatsappLink = "https://wa.me/201000476674";
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [prescriptionText, setPrescriptionText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const db = useFirestore();

  // دالة البحث من الخادم
  const searchProducts = useCallback(async (searchQuery: string, category: string, pageNum: number = 1, append: boolean = false) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: category,
        lang: language,
        page: pageNum.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/pharmacy/search?${params}`);
      const result: SearchResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to search products');
      }

      if (append) {
        setProducts(prev => [...prev, ...result.data]);
      } else {
        setProducts(result.data);
      }

      setHasMore(result.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Search error:', err);
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ في البحث' : 'Search Error',
        description: err instanceof Error ? err.message : 'Failed to load products'
      });
    } finally {
      setIsLoading(false);
    }
  }, [language, toast]);

  // تحميل البيانات الأولية
  useEffect(() => {
    searchProducts('', 'all', 1);
  }, [searchProducts]);

  // البحث مع debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm, activeTab, 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, searchProducts]);

  const handleLoadMore = () => {
    searchProducts(searchTerm, activeTab, page + 1, true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يرجى تسجيل الدخول أولاً" : "Please login first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      setUploadedImageUrl(imageUrl);

      // Save to Airtable
      await savePrescriptionToAirtable(
        user.uid,
        user.displayName || 'Unknown User',
        imageUrl
      );

      // Save to Firestore for real-time updates
      await addDoc(collection(db, "prescriptions"), {
        userId: user.uid,
        patientName: user.displayName || 'Unknown User',
        imageUrl,
        text: prescriptionText,
        type: "pharmacy",
        status: "pending",
        createdAt: Timestamp.now(),
      });

      toast({
        title: language === 'ar' ? "تم رفع الروشتة" : "Prescription uploaded",
        description: language === 'ar' ? "يمكنك رؤية معاينة الصورة أدناه" : "You can see the image preview below",
      });
    } catch (error) {
      console.error("Error uploading prescription:", error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل رفع الروشتة" : "Failed to upload prescription",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-background text-foreground" dir={dir}>
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-accent-foreground font-semibold">
            {pharmaT.badge}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            {pharmaT.title}
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            {pharmaT.subtitle}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">

        <section>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-primary/20">
            <CardHeader className="bg-primary/10 p-6">
              <CardTitle className="text-2xl text-primary font-headline text-center">{pharmaT.prescriptionCard.title}</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                {pharmaT.prescriptionCard.desc}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="prescription-upload"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-32 flex flex-col items-center justify-center gap-2"
                    disabled={isUploading || !user}
                  >
                    <Camera className="w-8 h-8" />
                    <span>{isUploading ? pharmaT.prescriptionCard.uploading : pharmaT.prescriptionCard.uploadText}</span>
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
                  {!user && (
                    <div className="text-sm text-muted-foreground text-center">
                      {language === 'ar' ? "يرجى" : "Please"} <Link href="/login" className="text-primary hover:underline">{language === 'ar' ? "تسجيل الدخول" : "login"}</Link> {language === 'ar' ? "لتتمكن من تحميل الروشتة" : "to be able to upload a prescription"}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <Textarea
                    placeholder={pharmaT.prescriptionCard.notesPlaceholder}
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    className="min-h-[128px] resize-none"
                    disabled={isUploading || !user}
                  />
                </div>
                <div className="flex flex-col items-center justify-center text-center gap-4">
                  <p className="text-muted-foreground">{pharmaT.prescriptionCard.whatsappPrompt}</p>
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={() => {
                      if (!user) {
                        toast({
                          variant: "destructive",
                          title: language === 'ar' ? "خطأ" : "Error",
                          description: language === 'ar' ? "يجب تسجيل الدخول أولاً" : "You must login first",
                        });
                        return;
                      }

                      const userName = user.displayName || user.email || 'Unknown User';
                      let message = language === 'ar' ? `*طلب روشتة من الصيدلية*\n\n` : `*Pharmacy Prescription Order*\n\n`;
                      message += `${language === 'ar' ? '*الاسم:*' : '*Name:*'} ${userName}\n`;
                      message += `${language === 'ar' ? '*رقم المستخدم:*' : '*User ID:*'} ${user.uid}\n\n`;

                      if (prescriptionText) {
                        message += `${language === 'ar' ? '*الأدوية المطلوبة/الملاحظات:*' : '*Required Meds/Notes:*'}\n${prescriptionText}\n\n`;
                      }

                      if (uploadedImageUrl) {
                        message += `${language === 'ar' ? '*صورة الروشتة:*' : '*Prescription Image:*'}\n${uploadedImageUrl}\n\n`;
                      }

                      message += language === 'ar' ? `نرجو التواصل معي لتأكيد الطلب والسعر والتوصيل.` : `Please contact me to confirm the order, price, and delivery.`;

                      window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');

                      // Clear form
                      setPrescriptionText("");
                      setUploadedImageUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <Bot className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-6 w-6`} />
                    {pharmaT.prescriptionCard.sendButton}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-12 space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <Input
                placeholder={pharmaT.searchPlaceholder}
                className={`${language === 'ar' ? 'pr-10' : 'pl-10'} h-12 text-base`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto h-auto">
                {Object.entries(pharmaT.categories).map(([key, value]) => (
                  <TabsTrigger key={key} value={key} className="text-base h-10">{value as string}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {isLoading && products.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => {
                  const name = product.name[language as 'ar' | 'en'] || product.name.ar;
                  const description = product.description[language as 'ar' | 'en'] || product.description.ar;
                  return (
                    <Card key={product.id} className="relative group flex flex-col break-words">
                      <CardHeader className="p-0">
                        <div className="relative w-full h-48 bg-card flex items-center justify-center">
                          <Image
                            src={product.image}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            style={{ objectFit: 'contain' }}
                            className="transition-transform duration-300 group-hover:scale-110 p-4"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                        <CardTitle className="text-lg font-semibold mb-2 h-12 break-all">{name}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-3 h-20 overflow-hidden">{description}</p>
                        <div className="flex items-center gap-1 text-accent">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="font-bold">{product.rating}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex-col items-start gap-4">
                        <p className="text-primary font-bold text-xl">{product.price.toFixed(2)} {t.clinics.currency}</p>
                        <Button asChild className="w-full" variant="secondary">
                          <Link href={`${whatsappLink}?text=${encodeURIComponent(language === 'ar' ? `أرغب في طلب منتج: ${name}` : `I would like to order product: ${name}`)}`} target="_blank">
                            {pharmaT.orderNow}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
                {products.length === 0 && (
                  <div className="text-center text-muted-foreground py-16 col-span-full">
                    <p className="text-lg">{pharmaT.noProducts}</p>
                  </div>
                )}
              </div>

              {/* زر تحميل المزيد */}
              {hasMore && products.length > 0 && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                      </>
                    ) : (
                      language === 'ar' ? 'تحميل المزيد' : 'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div >
  );
}

