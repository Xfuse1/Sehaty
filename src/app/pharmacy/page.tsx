
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import Image from "next/image";

const products = [
  {
    name: "بنادول أدفانس",
    price: "15.50 ر.س",
    imgSrc: "https://picsum.photos/seed/panadol/400/300",
    imgHint: "medicine pills",
  },
  {
    name: "فيتامين سي فوار",
    price: "25.00 ر.س",
    imgSrc: "https://picsum.photos/seed/vitaminc/400/300",
    imgHint: "vitamin tablets",
  },
  {
    name: "مرطب سيتافيل",
    price: "78.25 ر.س",
    imgSrc: "https://picsum.photos/seed/cetaphil/400/300",
    imgHint: "moisturizer cream",
  },
  {
    name: "معجون سنسوداين",
    price: "22.00 ر.س",
    imgSrc: "https://picsum.photos/seed/sensodyne/400/300",
    imgHint: "toothpaste box",
  },
    {
    name: "قطرة عين",
    price: "35.00 ر.س",
    imgSrc: "https://picsum.photos/seed/eyedrops/400/300",
    imgHint: "eye drops bottle",
  },
  {
    name: "واقي شمس لاروش",
    price: "120.00 ر.س",
    imgSrc: "https://picsum.photos/seed/sunscreen/400/300",
    imgHint: "sunscreen tube",
  },
    {
    name: "كمامات طبية (50 حبة)",
    price: "12.75 ر.س",
    imgSrc: "https://picsum.photos/seed/masks/400/300",
    imgHint: "medical face masks",
  },
  {
    name: "مكمل غذائي أوميغا 3",
    price: "95.50 ر.س",
    imgSrc: "https://picsum.photos/seed/omega3/400/300",
    imgHint: "fish oil capsules",
  },
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
            كل احتياجاتك الصحية في مكان واحد
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            تصفح مجموعتنا الواسعة من الأدوية والمستلزمات الطبية واطلبها بسهولة لتصلك أينما كنت.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
                <Input placeholder="ابحث عن دواء أو منتج طبي..." className="pl-10 h-12 text-base"/>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
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
                <CardTitle className="text-lg font-semibold mb-2">{product.name}</CardTitle>
                <p className="text-primary font-bold text-xl">{product.price}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full">
                  <ShoppingCart className="ml-2 h-4 w-4" />
                  أضف إلى السلة
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
