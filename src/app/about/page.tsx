"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShieldCheck, Target, Sparkles, Award, Users, Activity, Building, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function AboutPage() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const coreValues = [
    {
      icon: <Heart className="h-10 w-10 text-rose-500" />,
      title: t.about.value1Title,
      desc: t.about.value1Desc,
      glow: 'bg-rose-500/10'
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-blue-500" />,
      title: t.about.value2Title,
      desc: t.about.value2Desc,
      glow: 'bg-blue-500/10'
    },
    {
      icon: <Target className="h-10 w-10 text-emerald-500" />,
      title: t.about.value3Title,
      desc: t.about.value3Desc,
      glow: 'bg-emerald-500/10'
    }
  ];

  const stats = [
    { icon: <Award className="h-6 w-6" />, label: t.about.stats.experience, value: "10+" },
    { icon: <Users className="h-6 w-6" />, label: t.about.stats.users, value: "100k" },
    { icon: <Heart className="h-6 w-6" />, label: t.about.stats.doctors, value: "500+" },
    { icon: <Building className="h-6 w-6" />, label: t.about.stats.hospitals, value: "50+" },
  ];

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80"
            alt="Medical Professionals"
            fill
            className="object-cover opacity-30 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-60" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-xl border border-primary/20 px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary dark:text-primary">{t.about.badge}</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black font-headline leading-tight mb-8 tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            {t.about.title} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              {t.about.titleHighlight}
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 md:p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000" style={{ animationDelay: `${700 + i * 100}ms` }}>
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 text-primary">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-black font-headline text-foreground mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story & Mission */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />

              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-background group">
                <Image
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80"
                  alt="Medical center"
                  width={800}
                  height={1000}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 p-4 md:p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white max-w-[200px] md:max-w-[250px]">
                  <Activity className="h-6 w-6 md:h-8 md:w-8 mb-3 md:mb-4 text-green-400" />
                  <p className="font-bold text-sm md:text-base">{t.about.para3}</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2" dir="auto">
              <h2 className="text-3xl md:text-5xl font-black font-headline text-foreground mb-8 leading-tight">
                {t.about.whyTitle}
              </h2>
              <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                <p className="animate-in fade-in slide-in-from-start duration-1000">
                  {t.about.para1}
                </p>
                <p className="animate-in fade-in slide-in-from-start duration-1000 delay-300">
                  {t.about.para2}
                </p>
              </div>
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="text-primary font-bold mb-2 flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">{t.about.missionTitle}</Badge>
                  </div>
                  <p className="text-sm text-foreground/80">{t.about.para1}</p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="text-primary font-bold mb-2 flex items-center gap-2">
                    <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-none">{t.about.visionTitle}</Badge>
                  </div>
                  <p className="text-sm text-foreground/80">{t.about.para2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Redesign */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[150px] -z-10" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-headline text-foreground mb-4 font-headline">
              {t.about.visionTitle} & {t.about.missionTitle}
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value, i) => (
              <div key={i} className={`group relative p-10 rounded-[2.5rem] bg-card border border-border/50 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 overflow-hidden ${value.glow}`}>
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-current" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="p-5 rounded-2xl bg-background shadow-inner mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-headline text-foreground mb-4 group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed group-hover:text-foreground transition-colors">
                    {value.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative bg-primary rounded-[3rem] p-8 md:p-20 overflow-hidden shadow-[0_40px_100px_rgba(37,99,235,0.3)]">
            {/* Decorative background for CTA */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100" stroke="white" fill="transparent" strokeWidth="0.5" />
                <path d="M0 80 C 30 10 60 10 100 80" stroke="white" fill="transparent" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="relative z-10 text-center text-white max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black font-headline mb-8 leading-tight animate-in zoom-in duration-1000">
                {t.about.ctaTitle}
              </h2>
              <p className="text-lg md:text-2xl text-blue-100 mb-12 leading-relaxed opacity-90">
                {t.about.ctaSubtitle}
              </p>
              <Button asChild size="lg" className="h-auto min-h-[4rem] px-6 md:px-14 py-4 md:py-0 rounded-2xl bg-white text-primary hover:bg-white/90 shadow-2xl hover:scale-105 transition-all duration-300 group">
                <Link href="/specialized-clinics" className="flex items-center justify-center gap-3 md:gap-4 text-lg md:text-xl font-black uppercase tracking-tight text-center">
                  <span className="flex-1">{t.about.ctaButton}</span>
                  <ArrowRight className={`h-5 w-5 md:h-6 md:w-6 flex-shrink-0 transition-transform group-hover:translate-x-2 ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
