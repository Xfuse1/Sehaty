import { UserCheck, Stethoscope, Clock, Star } from 'lucide-react';

const stats = [
  {
    icon: <UserCheck className="h-10 w-10 text-primary" />,
    value: '50k+',
    label: 'مريض تم خدمتهم',
  },
  {
    icon: <Stethoscope className="h-10 w-10 text-primary" />,
    value: '20+',
    label: 'تخصص طبي',
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    value: '15 دقيقة',
    label: 'متوسط زمن الانتظار',
  },
  {
    icon: <Star className="h-10 w-10 text-primary" />,
    value: '4.9',
    label: 'تقييم المستخدمين',
  },
];

export default function Stats() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className="relative text-center p-8 rounded-2xl bg-muted/40"
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
