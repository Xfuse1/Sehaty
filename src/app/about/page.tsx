import { Badge } from "@/components/ui/badge";
import { Users, Goal, Eye } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <header className="bg-primary/5 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            من نحن
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            بناء مستقبل الرعاية الصحية الرقمية
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            في "صحتي"، نسعى لتمكين الأفراد من إدارة صحتهم بسهولة وثقة، عبر منصة تقنية تجمع بين الحلول المبتكرة والرعاية الإنسانية.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-24">
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">قصتنا</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              انطلقت "صحتي" من فكرة بسيطة: جعل الرعاية الصحية عالية الجودة في متناول الجميع. لاحظنا التحديات التي يواجهها الناس في الوصول إلى الخدمات الطبية، من حجز المواعيد إلى متابعة السجلات الصحية. قررنا استخدام التكنولوجيا لسد هذه الفجوة.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              اليوم، نفخر بتقديم منصة متكاملة تربط المرضى بمقدمي الرعاية، وتوفر أدوات ذكية لإدارة الصحة، مع الالتزام بأعلى معايير الأمان والخصوصية.
            </p>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden">
            <Image 
              src="https://picsum.photos/seed/team/800/600" 
              alt="فريق صحتي" 
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 hover:scale-105"
              data-ai-hint="diverse team meeting"
            />
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">قيمنا الأساسية</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border rounded-2xl bg-card shadow-sm">
              <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">الرؤية</h3>
              <p className="text-muted-foreground">
                أن نكون المنصة الصحية الرقمية الرائدة والموثوقة في المنطقة.
              </p>
            </div>
            <div className="p-8 border rounded-2xl bg-card shadow-sm">
              <Goal className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">الرسالة</h3>
              <p className="text-muted-foreground">
                توفير وصول سهل وآمن للخدمات الصحية من خلال حلول تقنية مبتكرة.
              </p>
            </div>
            <div className="p-8 border rounded-2xl bg-card shadow-sm">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">المجتمع</h3>
              <p className="text-muted-foreground">
                بناء مجتمع صحي واعٍ من خلال التثقيف وتسهيل الوصول للمعلومة.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
