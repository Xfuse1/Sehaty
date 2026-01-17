"use client";

import Link from 'next/link';
import { useUser } from '@/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Hero() {
    const { t, language } = useLanguage();

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax-ready styling */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80"
                    alt="Hero Background"
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-1000"
                    priority
                />
                {/* Deep Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-background" />

            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-[120px] animate-pulse" />

            <div className="container relative z-10 mx-auto px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="max-w-4xl mx-auto text-center md:text-start md:mx-0">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse relative">
                            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                        </span>
                        <span className="text-sm font-bold tracking-wide uppercase text-white flex items-center gap-2 drop-shadow-md">
                            <Sparkles className="h-4 w-4 text-accent" />
                            {t.hero.badge}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black font-headline leading-[1.2] mb-6 md:mb-8 tracking-tighter text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 drop-shadow-lg">
                        {t.hero.titleStart} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                            {t.hero.titleHighlight}
                        </span> {t.hero.titleEnd}
                    </h1>

                    <p className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-8 md:mb-12 leading-relaxed max-w-2xl font-bold animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 drop-shadow-md">
                        {t.hero.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center md:justify-start animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
                        <Button size="lg" className="h-auto min-h-[3.5rem] md:h-16 w-full sm:w-auto px-6 md:px-10 py-3 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 hover:scale-105 transition-all duration-300 group">
                            <Link href="/specialized-clinics" className="flex items-center justify-center gap-3 font-bold text-base md:text-lg text-center">
                                {t.hero.primaryCta}
                                <ArrowRight className={`h-4 w-4 md:h-5 md:w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-auto min-h-[3.5rem] md:h-16 w-full sm:w-auto px-6 md:px-10 py-3 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border-white/20 text-white backdrop-blur-md shadow-xl hover:scale-105 transition-all duration-300" asChild>
                            <Link href="#how-it-works" className="font-bold text-base md:text-lg text-center w-full">
                                {t.hero.secondaryCta}
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-16 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-1000 justify-center md:justify-start">
                        <div className="flex -space-x-3 rtl:space-x-reverse">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="group relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary/50 bg-background overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:z-10 cursor-pointer">
                                    <Image src={`https://i.pravatar.cc/150?u=${i + 10}`} width={48} height={48} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col text-start">
                            <div className="flex text-accent h-4 gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="h-3 w-3 fill-current" />)}
                            </div>
                            <p className="text-sm md:text-base font-medium text-gray-300">{t.hero.trustedBy}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden sm:block">
                <div className="w-[30px] h-12 rounded-full border-2 border-white flex justify-center p-2">
                    <div className="w-1 h-3 bg-white rounded-full" />
                </div>
            </div>
        </section>
    );
}
