"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ShoppingCart } from "lucide-react";

const offers = [
  {
    name: "كريم ستارفيل للتفتيح",
    oldPrice: "110.00",
    newPrice: "85.00",
    imgSrc: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/starville-whitening-cream-60gm-01662985303.png",
    imgHint: "whitening cream tube",
    discount: "23%",
  },
  {
    name: "سيروم سيروبايب للشعر",
    oldPrice: "180.00",
    newPrice: "150.00",
    imgSrc: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/seropipe-hair-serum-100ml-lotion-01654093952.png",
    imgHint: "hair serum bottle",
    discount: "17%",
  },
  {
    name: "شامبو كلاري ضد القشرة",
    oldPrice: "130.00",
    newPrice: "110.75",
    imgSrc: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/clary-anti-dandruff-shampoo-for-oily-hair-250ml-01698759367.png",
    imgHint: "shampoo bottle",
    discount: "15%",
  },
  {
    name: "زيت بندولين للأطفال",
    oldPrice: "120.00",
    newPrice: "95.00",
    imgSrc: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/penduline-plus-hair-oil-120ml-01689694294.png",
    imgHint: "baby oil bottle",
    discount: "21%",
  },
  {
    name: "شامبو جونسون للأطفال",
    oldPrice: "55.00",
    newPrice: "45.00",
    imgSrc: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/johnsons-baby-shampoo-500ml-01663236085.png",
    imgHint: "baby shampoo",
    discount: "18%",
  },
   {
    name: "لوشن ستارفيل مرطب",
    oldPrice: "150.00",
    newPrice: "120.00",
    imgSrc: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/1634215984-starville-hydrating-lotion-for-normal-to-dry-skin-200ml.png",
    imgHint: "moisturizing lotion",
    discount: "20%",
  },
];

const whatsappLink = "https://wa.me/201211886649";

export default function PharmacyOffers() {
  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            عروض حصرية
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            أقوى عروض الصيدليات
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            اكتشف أفضل الخصومات على منتجات العناية بالبشرة، الشعر، ومنتجات الأطفال.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
            direction: 'rtl',
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {offers.map((offer, index) => (
              <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="p-1 h-full">
                  <Card className="h-full overflow-hidden group transition-shadow duration-300 hover:shadow-xl flex flex-col">
                    <CardContent className="p-4 flex flex-col items-center text-center flex-grow">
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={offer.imgSrc}
                          alt={offer.name}
                          fill
                          style={{ objectFit: 'contain' }}
                          className="transition-transform duration-300 group-hover:scale-110 p-2"
                          data-ai-hint={offer.imgHint}
                        />
                         <Badge variant="destructive" className="absolute top-2 left-2">
                           خصم {offer.discount}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-md flex-grow">{offer.name}</h3>
                      <div className="my-3">
                        <span className="text-destructive text-lg font-bold ml-2">
                          {offer.newPrice} ر.س
                        </span>
                        <span className="text-muted-foreground line-through text-sm">
                          {offer.oldPrice} ر.س
                        </span>
                      </div>
                       <Button asChild className="w-full mt-auto" size="sm">
                          <Link href={`${whatsappLink}?text=${encodeURIComponent(`أرغب في طلب منتج: ${offer.name}`)}`} target="_blank">
                              <ShoppingCart className="ml-2 h-4 w-4" />
                              اطلب الآن
                          </Link>
                        </Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-4 text-primary bg-background border-primary" />
          <CarouselNext className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-4 text-primary bg-background border-primary" />
        </Carousel>
      </div>
    </section>
  );
}
