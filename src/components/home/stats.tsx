import { Clock, Heart, Users, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    icon: <Clock className="h-8 w-8 text-orange-500" />,
    value: '24/7',
    label: 'دعم متواصل',
  },
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    value: '+10k',
    label: 'مريض راضٍ',
  },
  {
    icon: <Users className="h-8 w-8 text-green-500" />,
    value: '+500',
    label: 'طبيب معتمد',
  },
  {
    icon: <Award className="h-8 w-8 text-blue-500" />,
    value: '+8',
    label: 'خدمات طبية',
  },
];

export default function Stats() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">إحصائيات</Badge>
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-foreground">أرقام تتحدث عن نفسها</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              نفخر بخدمة آلاف المرضى وتقديم أفضل رعاية صحية بفضل فريقنا الطبي المتميز
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center p-8 rounded-xl bg-card border"
            >
              <div className="flex justify-center items-center mb-4">
                  {stat.icon}
              </div>
              <p className="text-4xl md:text-5xl font-bold font-mono text-foreground">{stat.value}</p>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
