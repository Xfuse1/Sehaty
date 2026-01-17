"use client";

import React from 'react';
import { Search, CalendarCheck, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function HowItWorks() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';

    const steps = [
        {
            icon: <Search className="w-10 h-10" />,
            title: t.howItWorks.step1Title,
            desc: t.howItWorks.step1Desc,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            icon: <CalendarCheck className="w-10 h-10" />,
            title: t.howItWorks.step2Title,
            desc: t.howItWorks.step2Desc,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            icon: <Stethoscope className="w-10 h-10" />,
            title: t.howItWorks.step3Title,
            desc: t.howItWorks.step3Desc,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-card/30 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="10" cy="10" r="20" fill="currentColor" />
                    <circle cx="90" cy="90" r="30" fill="currentColor" />
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-black font-headline text-foreground mb-6">
                        {t.howItWorks.title}
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                        {t.howItWorks.subtitle}
                    </p>
                    <div className="mt-6 flex justify-center">
                        <div className="h-1.5 w-24 bg-primary rounded-full" />
                    </div>
                </div>

                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {steps.map((step, idx) => (
                            <div key={idx} className="group flex flex-col items-center text-center">
                                {/* Step Number & Icon */}
                                <div className="relative mb-8">
                                    <div className={`w-24 h-24 rounded-[2rem] ${step.bg} ${step.color} flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl`}>
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background border-4 border-primary text-primary font-black flex items-center justify-center shadow-lg">
                                        {idx + 1}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-4 max-w-[280px]">
                                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>

                                {/* Mobile/Tablet Arrows */}
                                {idx < steps.length - 1 && (
                                    <div className="md:hidden mt-8 text-muted-foreground/30">
                                        <ArrowRight className="w-8 h-8 rotate-90" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Decorative Arrow for Desktop */}
                <div className="hidden lg:flex justify-center mt-16 text-primary/20">
                    <div className="flex items-center gap-4">
                        <div className="h-px w-20 bg-current" />
                        <ArrowRight className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
                        <div className="h-px w-20 bg-current" />
                    </div>
                </div>
            </div>
        </section>
    );
}
