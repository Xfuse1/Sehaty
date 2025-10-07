import { Clock, ShieldCheck, Smartphone, Users } from 'lucide-react';

const highlights = [
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: 'سرعة الحجز',
    description: 'احجز مواعيدك الطبية في أقل من دقيقة.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'أطباء معتمدون',
    description: 'نخبة من أفضل الأطباء والمختصين في خدمتك.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'خصوصية البيانات',
    description: 'نضمن سرية وأمان معلوماتك الصحية بالكامل.',
  },
  {
    icon: <Smartphone className="h-8 w-8 text-primary" />,
    title: 'دعم 24/7',
    description: 'فريق دعم فني متواجد لمساعدتك على مدار الساعة.',
  },
];

export default function Highlights() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight) => (
            <div key={highlight.title} className="text-center p-6">
              <div className="flex justify-center items-center mb-4">
                {highlight.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground">{highlight.title}</h3>
              <p className="text-muted-foreground mt-2">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
