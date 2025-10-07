
"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Camera, FileText, Mic, Bot, Rocket, Clock, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

const careProducts = [
  {
    name: "كريم ستارفيل للتفتيح",
    price: "85.00 ر.س",
    imgSrc: "https://picsum.photos/seed/starville/400/300",
    imgHint: "whitening cream tube",
  },
  {
    name: "سيروم سيروبايب للشعر",
    price: "150.00 ر.س",
    imgSrc: "https://picsum.photos/seed/seropipe/400/300",
    imgHint: "hair serum bottle",
  },
  {
    name: "شامبو كلاري ضد القشرة",
    price: "110.75 ر.س",
    imgSrc: "https://picsum.photos/seed/clary/400/300",
    imgHint: "shampoo bottle",
  },
  {
    name: "زيت بندولين للأطفال",
    price: "95.00 ر.س",
    imgSrc: "https://picsum.photos/seed/penduline/400/300",
    imgHint: "baby oil bottle",
  },
  {
    name: "شامبو جونسون للأطفال",
    price: "45.00 ر.س",
    imgSrc: "https://picsum.photos/seed/johnson/400/300",
    imgHint: "baby shampoo",
  },
  {
    name: "لوشن ستارفيل مرطب",
    price: "120.00 ر.س",
    imgSrc: "https://picsum.photos/seed/starvillelotion/400/300",
    imgHint: "moisturizing lotion",
  },
  {
    name: "ماسك كلاري للشعر",
    price: "99.00 ر.س",
    imgSrc: "https://picsum.photos/seed/clarymask/400/300",
    imgHint: "hair mask jar",
  },
  {
    name: "كريم بندولين كيدز",
    price: "75.50 ر.س",
    imgSrc: "https://picsum.photos/seed/pendulinekids/400/300",
    imgHint: "kids cream tube",
  },
];

const features = [
    { icon: <Rocket className="h-8 w-8 text-primary" />, text: "توصيل سريع" },
    { icon: <Clock className="h-8 w-8 text-primary" />, text: "خدمة 24/7" },
    { icon: <Truck className="h-8 w-8 text-primary" />, text: "توصيل مجاني لفترة محدودة" },
];

export default function PharmacyPage() {
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
            تصفح مجموعتنا المختارة من منتجات العناية بالبشرة، الشعر، والأطفال، واطلبها بسهولة.
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
                            <Link href="https://wa.me/966000000000?text=أرغب%20في%20طلب%20روشتة" target="_blank">
                                <Bot className="ml-2 h-6 w-6" />
                                إرسال الطلب الآن
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {features.map((feature, index) => (
                <div key={index} className="p-6 bg-card rounded-xl border flex flex-col items-center gap-3">
                    {feature.icon}
                    <p className="font-semibold text-lg">{feature.text}</p>
                </div>
            ))}
        </section>

        <section>
            <div className="mb-12">
                <div className="relative max-w-2xl mx-auto">
                    <Input placeholder="ابحث عن منتج للعناية بالبشرة، الشعر، أو الأطفال..." className="pl-10 h-12 text-base"/>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {careProducts.map((product) => (
                <Card key={product.name} className="overflow-hidden group">
                  <CardHeader className="p-0">
                    <div className="relative w-full h-48 bg-card">
                      <Image
                        src={product.imgSrc}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint={product.imgHint}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold mb-2 h-12">{product.name}</CardTitle>
                    <p className="text-primary font-bold text-xl">{product.price}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" variant="secondary">
                      اطلب الآن
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        </section>
      </main>
    </div>
  );
}
