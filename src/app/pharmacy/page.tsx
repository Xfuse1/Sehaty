
"use client"

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Camera, Bot, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { productsData, Product } from "@/lib/products-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function PharmacyPage() {
  const whatsappLink = "https://wa.me/201211886649";
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = productsData.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeTab === 'all' || product.category === activeTab;
      return matchesSearch && matchesCategory;
  });

  const categories = {
      'all': 'الكل',
      'skin-care': 'العناية بالبشرة',
      'hair-care': 'العناية بالشعر',
      'baby-care': 'العناية بالطفل',
      'essentials': 'أساسيات'
  }

  return (
    <div className="bg-background text-foreground">
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            الصيدلية الرقمية
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            عنايتك الكاملة تصلك لباب بيتك
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            تصفح مجموعتنا المختارة من منتجات العناية واطلبها بسهولة عبر واتساب.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">
        
        <section>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-primary/20">
            <CardHeader className="bg-primary/10 p-6">
                <CardTitle className="text-2xl text-primary font-headline text-center">هل لديك روشتة؟ اطلبها فوراً</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    صوّر الروشتة أو اكتب طلبك، وسنتواصل معك عبر واتساب للتوصيل.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col gap-4">
                         <Button variant="outline" className="h-24 flex-col gap-2 text-lg">
                            <Camera className="h-8 w-8" />
                            <span>صوّر الروشتة</span>
                        </Button>
                         <Textarea placeholder="أو اكتب اسم الدواء والكمية المطلوبة هنا..." className="min-h-[108px] text-base"/>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                        <p className="text-muted-foreground">اضغط إرسال وسيتم تحويلك إلى واتساب مباشرةً لاستكمال طلبك مع الصيدلي.</p>
                        <Button asChild size="lg" className="w-full text-lg">
                            <Link href={`${whatsappLink}?text=${encodeURIComponent("أرغب في طلب روشتة")}`} target="_blank">
                                <Bot className="ml-2 h-6 w-6" />
                                إرسال الطلب الآن
                            </Link>
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
                        placeholder="ابحث عن منتج..." 
                        className="pl-10 h-12 text-base"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto h-auto">
                        {Object.entries(categories).map(([key, value]) => (
                             <TabsTrigger key={key} value={key} className="text-base h-10">{value}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group flex flex-col">
                  <CardHeader className="p-0">
                    <div className="relative w-full h-48 bg-card flex items-center justify-center">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'contain' }}
                        className="transition-transform duration-300 group-hover:scale-110 p-4"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-lg font-semibold mb-2 h-12">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-3 h-20 overflow-hidden">{product.description}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold">{product.rating}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex-col items-start gap-4">
                    <p className="text-primary font-bold text-xl">{product.price.toFixed(2)} ر.س</p>
                    <Button asChild className="w-full" variant="secondary">
                      <Link href={`${whatsappLink}?text=${encodeURIComponent(`أرغب في طلب منتج: ${product.name}`)}`} target="_blank">
                        اطلب الآن عبر واتساب
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
                {filteredProducts.length === 0 && (
                    <div className="text-center text-muted-foreground py-16 col-span-full">
                        <p className="text-lg">لا توجد منتجات تطابق بحثك الحالي.</p>
                    </div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}
