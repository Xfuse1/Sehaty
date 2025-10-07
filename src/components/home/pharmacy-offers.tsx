
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
import { Loader2, ShoppingCart } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

interface Offer {
  id: string;
  name: string;
  oldPrice: string;
  newPrice: string;
  imgSrc: string;
  imgHint: string;
  discount: string;
}


const whatsappLink = "https://wa.me/201211886649";

export default function PharmacyOffers() {
  const firestore = useFirestore();
  const offersQuery = useMemoFirebase(() => collection(firestore, 'offers'), [firestore]);
  const { data: offers, isLoading } = useCollection<Omit<Offer, 'id'>>(offersQuery);

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

        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : !offers || offers.length === 0 ? (
             <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <p>لا توجد عروض متاحة حالياً. يرجى العودة لاحقاً.</p>
             </div>
        ) : (
            <Carousel
            opts={{
                align: "start",
                loop: true,
                direction: 'rtl',
            }}
            className="w-full"
            >
            <CarouselContent className="-ml-4">
                {offers.map((offer) => (
                <CarouselItem key={offer.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
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
                            {offer.discount && (
                                <Badge variant="destructive" className="absolute top-2 left-2">
                                خصم {offer.discount}
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-bold text-md flex-grow">{offer.name}</h3>
                        <div className="my-3">
                            <span className="text-destructive text-lg font-bold ml-2">
                            {offer.newPrice} ر.س
                            </span>
                            {offer.oldPrice && (
                                <span className="text-muted-foreground line-through text-sm">
                                {offer.oldPrice} ر.س
                                </span>
                            )}
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
        )}
      </div>
    </section>
  );
}
