"use client";

import { Clock, Heart, Users, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';

function AnimatedCounter({ end, duration = 2000 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      if (progress < duration) {
        setCount(Math.min(Math.floor((progress / duration) * end), end));
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}</span>;
}

export default function Stats() {
  const { t } = useLanguage();

  const stats = [
    {
      icon: <Users className="h-10 w-10" />,
      value: 500,
      suffix: '+',
      label: t.stats.doctors,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    },
    {
      icon: <Heart className="h-10 w-10" />,
      value: 98,
      suffix: '%',
      label: t.stats.satisfaction,
      gradient: 'from-rose-500 to-orange-500',
      bgGradient: 'from-rose-500/10 to-orange-500/10',
      iconBg: 'bg-gradient-to-br from-rose-500 to-orange-500',
    },
    {
      icon: <Award className="h-10 w-10" />,
      value: 10,
      suffix: 'k+',
      label: t.stats.stories,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    },
    {
      icon: <Clock className="h-10 w-10" />,
      value: 24,
      suffix: '/7',
      label: t.stats.service,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
  ];

  return (
    <section className="relative py-24 bg-background overflow-hidden border-y" dir="auto">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card */}
              <div className={`relative p-6 md:p-8 rounded-3xl bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10`}>
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                <div className="relative flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`mb-6 p-4 ${stat.iconBg} rounded-2xl text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {stat.icon}
                  </div>

                  {/* Number */}
                  <div className={`text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-3 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    <AnimatedCounter end={stat.value} />
                    <span className="text-2xl md:text-3xl">{stat.suffix}</span>
                  </div>

                  {/* Label */}
                  <p className="text-sm md:text-base font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                    {stat.label}
                  </p>
                </div>

                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
