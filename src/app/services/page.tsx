import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Stethoscope, FlaskConical, TestTube, Ambulance, Laptop, FileText, Bot, Tag, HeartPulse, Building } from "lucide-react";
import Link from "next/link";

const allServices = [
  {
    icon: <Stethoscope className="h-8 w-8 text-primary" />,
    title: 'العيادات المتخصصة',
    description: 'تصفح التخصصات الطبية واختر من بين نخبة الأطباء المعتمدين.',
    href: '/specialized-clinics',
  },
  {
    icon: <FlaskConical className="h-8 w-8 text-primary" />,
    title: 'الصيدلية',
    description: 'اطلب أدويتك ومستلزماتك الطبية بسهولة لتصلك أينما كنت.',
    href: '/pharmacy',
  },
  {
    icon: <TestTube className="h-8 w-8 text-primary" />,
    title: 'التحاليل المخبرية',
    description: 'احجز زيارة لسحب العينات واحصل على نتائج تحاليلك بشكل رقمي.',
    href: '/lab-services',
  },
  {
    icon: <Ambulance className="h-8 w-8 text-primary" />,
    title: 'الكشف المنزلي',
    description: 'زيارات طبية منزلية للحالات غير الطارئة وتوصيات للمتابعة.',
    href: '/home-visit',
  },
    {
    icon: <HeartPulse className="h-8 w-8 text-primary" />,
    title: 'الرعاية التمريضية',
    description: 'خدمات تمريض منزلية احترافية لرعاية كبار السن وما بعد العمليات.',
    href: '/nursing-care',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'العلاج الطبيعي',
    description: 'جلسات علاج طبيعي منزلية لمساعدتك على التعافي واستعادة الحركة.',
    href: '/physiotherapy',
  },
   {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'العمليات الجراحية',
    description: 'استشارات متخصصة وترتيبات لأشهر العمليات الجراحية والتجميلية.',
    href: '/surgery',
  },
  {
    icon: <Building className="h-8 w-8 text-primary" />,
    title: 'دليل الأطباء',
    description: 'ابحث عن معلومات التواصل مع الأطباء والصيدليات في منطقتك.',
    href: '/doctors-directory',
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-background text-foreground">
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            خدماتنا
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            رعاية صحية شاملة ومبتكرة
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            نقدم لك باقة متكاملة من الخدمات الصحية المصممة لتلبية كافة احتياجاتك، بجودة عالية وفي متناول يدك.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {allServices.map((service) => (
            <Link href={service.href} key={service.title} className="group block">
              <Card className="h-full bg-card rounded-2xl border overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 transform">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-6 transition-transform duration-300 group-hover:scale-110">
                    {service.icon}
                  </div>
                  <h3 className="font-bold font-headline text-xl text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 text-sm flex-grow">{service.description}</p>
                  <div className="flex items-center text-primary font-semibold group-hover:text-primary-dark transition-colors text-sm">
                    اعرف المزيد
                    <ArrowLeft className="mr-2 h-4 w-4 transform transition-transform duration-300 group-hover:-translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
