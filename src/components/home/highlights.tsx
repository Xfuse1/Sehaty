"use client";

import React from 'react';
import { Zap, ShieldCheck, Stethoscope, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function Highlights() {
  const { t, language } = useLanguage();

  const highlights = [
    {
      icon: <Zap />,
      title: t.highlights.instantBooking.title,
      description: t.highlights.instantBooking.desc,
      color: 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/10',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    },
    {
      icon: <Stethoscope />,
      title: t.highlights.homeClinic.title,
      description: t.highlights.homeClinic.desc,
      color: 'bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      icon: <Activity />,
      title: t.highlights.followUp.title,
      description: t.highlights.followUp.desc,
      color: 'bg-green-500/5 hover:bg-green-500/10 border-green-500/10',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      icon: <ShieldCheck />,
      title: t.highlights.privacy.title,
      description: t.highlights.privacy.desc,
      color: 'bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/10',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
  ];

  return (
    <section className="py-12 md:py-24 bg-background relative z-20 -mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {highlights.map((highlight, idx) => (
            <div
              key={highlight.title}
              className={`group relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-card border shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 overflow-hidden ${highlight.color}`}
            >
              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${highlight.iconBg}`} />

              <div className="relative z-10">
                <div className={`inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl mb-6 md:mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner ${highlight.iconBg} ${highlight.iconColor}`}>
                  {React.cloneElement(highlight.icon as React.ReactElement, { className: "h-8 w-8 md:h-10 md:w-10" })}
                </div>

                <h3 className="text-xl md:text-2xl font-bold font-headline text-foreground mb-3 md:mb-4 group-hover:text-primary transition-colors duration-300">
                  {highlight.title}
                </h3>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  {highlight.description}
                </p>


              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
