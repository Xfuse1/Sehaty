import { Award, Users, Heart, Clock } from 'lucide-react';

const stats = [
  {
    icon: <Award className="h-8 w-8 text-primary" />,
    value: '10+',
    label: 'سنوات خبرة',
    gradient: 'from-blue-500/20 to-transparent',
  },
  {
    icon: <Users className="h-8 w-8 text-emerald-500" />,
    value: '50k+',
    label: 'مستخدم سعيد',
    gradient: 'from-emerald-500/20 to-transparent',
  },
  {
    icon: <Heart className="h-8 w-8 text-accent" />,
    value: '98%',
    label: 'رضا العملاء',
    gradient: 'from-purple-500/20 to-transparent',
  },
  {
    icon: <Clock className="h-8 w-8 text-orange-500" />,
    value: '24/7',
    label: 'دعم فني',
    gradient: 'from-orange-500/20 to-transparent',
  },
];

export default function Stats() {
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className={`relative text-center p-8 rounded-2xl overflow-hidden bg-background`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`}></div>
                <div className="relative">
                    <div className="flex justify-center items-center mb-4">
                        {stat.icon}
                    </div>
                    <p className="text-4xl md:text-5xl font-bold font-mono text-foreground">{stat.value}</p>
                    <p className="text-muted-foreground mt-2">{stat.label}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
