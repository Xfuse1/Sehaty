
"use client";

import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, Zap } from "lucide-react";
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const physiotherapyPackages = [
  {
    id: "physio_starter",
    name: "باقة البداية الصحية",
    price: "450",
    duration: "4 جلسات",
    description: "باقة مثالية لمن يبدأ رحلة العلاج الطبيعي أو يحتاج لمتابعة بسيطة.",
    features: [
      "4 جلسات علاج طبيعي منزلية",
      "تقييم شامل للحالة",
      "خطة علاجية شخصية",
      "متابعة عبر الهاتف"
    ],
    isPopular: false,
  },
  {
    id: "physio_intensive",
    name: "الباقة المكثفة",
    price: "1200",
    duration: "12 جلسة",
    description: "برنامج متكامل مصمم لحالات ما بعد الجراحة والإصابات الرياضية.",
    features: [
      "12 جلسة علاج طبيعي منزلية",
      "تقييم دوري كل 4 جلسات",
      "خطة علاجية متقدمة",
      "تمارين إعادة تأهيل مخصصة",
      "دعم واتساب مباشر مع الأخصائي"
    ],
    isPopular: true,
  },
  {
    id: "physio_premium",
    name: "باقة الرعاية الكاملة",
    price: "850",
    duration: "8 جلسات",
    description: "متابعة شاملة للحالات المزمنة وكبار السن لتحسين جودة الحياة.",
    features: [
      "8 جلسات علاج طبيعي منزلية",
      "تقييم شامل مع وضع أهداف",
      "خطة وقائية لتجنب الإصابات",
      "إرشادات للعائلة ومقدمي الرعاية"
    ],
    isPopular: false,
  },
];

type Package = typeof physiotherapyPackages[0];

export default function PhysiotherapyPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const handleBooking = (pkg: Package) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'مطلوب تسجيل الدخول',
                description: 'الرجاء تسجيل الدخول أولاً لتتمكن من حجز باقة.',
            });
            router.push('/login');
        } else {
            const packageData = encodeURIComponent(JSON.stringify(pkg));
            router.push(`/physiotherapy-booking?package=${packageData}`);
        }
    };

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        العلاج الطبيعي المنزلي
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        استعد حركتك وصحتك في راحة منزلك
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        نقدم باقات علاج طبيعي منزلية مخصصة على أيدي أفضل الأخصائيين لمساعدتك على التعافي والعودة لحياتك الطبيعية.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {physiotherapyPackages.map((pkg) => (
                        <Card 
                            key={pkg.id} 
                            className={`flex flex-col h-full rounded-2xl shadow-sm transition-all duration-300 ${pkg.isPopular ? 'border-2 border-primary shadow-2xl -translate-y-4' : 'border'}`}
                        >
                             {pkg.isPopular && (
                                <Badge className="absolute -top-3 right-6 flex items-center gap-1 bg-primary border-primary">
                                    <Zap className="h-4 w-4" />
                                    الأكثر طلباً
                                </Badge>
                            )}
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold text-primary">{pkg.name}</CardTitle>
                                <CardDescription>{pkg.duration}</CardDescription>
                                <div className="text-4xl font-extrabold text-foreground mt-4">
                                    {pkg.price} <span className="text-lg font-medium text-muted-foreground">ر.س</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-center text-muted-foreground mb-6">{pkg.description}</p>
                                <ul className="space-y-3 text-sm">
                                    {pkg.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <span className="flex-1">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    size="lg" 
                                    className="w-full" 
                                    variant={pkg.isPopular ? 'default' : 'secondary'}
                                    onClick={() => handleBooking(pkg)}
                                >
                                    حجز الباقة الآن
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
