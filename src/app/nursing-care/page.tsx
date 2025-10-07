
"use client";

import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, Zap } from "lucide-react";
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const nursingPackages = [
  {
    id: "nursing_daily",
    name: "باقة الرعاية اليومية",
    price: "350",
    duration: "زيارة يومية",
    description: "مثالية للمتابعة اليومية وإعطاء الأدوية والعناية بالجروح البسيطة.",
    features: [
      "زيارة تمريضية يومية (حتى ساعتين)",
      "إعطاء الأدوية في مواعيدها",
      "قياس العلامات الحيوية",
      "مساعدة في النظافة الشخصية"
    ],
    isPopular: false,
  },
  {
    id: "nursing_post_op",
    name: "رعاية ما بعد الجراحة",
    price: "2500",
    duration: "أسبوع",
    description: "برنامج متكامل للعناية بالمرضى بعد العمليات الجراحية لضمان التعافي السريع.",
    features: [
      "7 زيارات تمريضية منزلية",
      "العناية بالجروح وتغيير الضمادات",
      "متابعة العلامات الحيوية بدقة",
      "إدارة الألم حسب توجيهات الطبيب",
      "تنسيق مع الطبيب المعالج"
    ],
    isPopular: true,
  },
  {
    id: "nursing_elderly",
    name: "رعاية كبار السن",
    price: "1800",
    duration: "شهرياً (3 زيارات أسبوعياً)",
    description: "متابعة شاملة للحالات المزمنة وكبار السن لتحسين جودة الحياة.",
    features: [
      "12 زيارة تمريضية شهرية",
      "متابعة الأمراض المزمنة (سكر، ضغط)",
      "المساعدة في الحركة والتنقل",
      "توفير الدعم النفسي والاجتماعي"
    ],
    isPopular: false,
  },
];

type Package = typeof nursingPackages[0];

export default function NursingCarePage() {
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
            router.push(`/nursing-care-booking?package=${packageData}`);
        }
    };

    return (
        <div className="bg-background text-foreground">
            <header className="bg-primary/5 py-20">
                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
                        الرعاية التمريضية المنزلية
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
                        رعاية تمريضية محترفة تصل إلى بابك
                    </h1>
                    <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
                        نوفر لكم فريق تمريض مؤهل لتقديم أفضل مستويات الرعاية الصحية في راحة منزلكم، سواء لكبار السن، المرضى، أو حالات ما بعد الجراحة.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {nursingPackages.map((pkg) => (
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
