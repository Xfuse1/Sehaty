"use client";

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="py-20 bg-muted/30 border-t border-border/50 relative overflow-hidden mt-20">
            {/* Background Glow */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-start" dir="auto">
                <div className="flex flex-col items-center md:items-start gap-6">
                    <Link href="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"
                                    fill="white"
                                />
                            </svg>
                        </div>
                        <span className="font-bold font-headline text-2xl text-foreground tracking-tight">{t.common.appName}</span>
                    </Link>
                    <p className="text-sm md:text-base text-muted-foreground max-w-xs text-center md:text-start leading-relaxed">
                        {t.footer.slogan}
                    </p>
                </div>

                <div className="text-center md:text-start">
                    <h4 className="font-bold text-lg mb-4">{t.footer.quickLinks}</h4>
                    <ul className="space-y-4">
                        <li><Link href="/about" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.footer.about}</Link></li>
                        <li><Link href="/services" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.footer.services}</Link></li>
                        <li><Link href="/blog" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.footer.blog}</Link></li>
                        <li><Link href="/faq" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.header.faq}</Link></li>
                        <li><Link href="/contact" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.header.contact}</Link></li>
                    </ul>
                </div>

                <div className="text-center md:text-start">
                    <h4 className="font-bold text-lg mb-4">{t.footer.help}</h4>
                    <ul className="space-y-4">
                        <li><Link href="/faq" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.footer.helpCenter}</Link></li>
                        <li><Link href="/privacy-policy" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.footer.privacy}</Link></li>
                        <li><Link href="/terms-of-use" className="py-1 block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">{t.footer.terms}</Link></li>
                    </ul>
                </div>

                <div className="text-center md:text-start">
                    <h4 className="font-bold text-lg mb-4">{t.footer.social}</h4>
                    <div className="flex gap-4 justify-center md:justify-start">
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></Link>
                    </div>
                </div>
            </div>
            <div className="container mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                {t.footer.rights}
            </div>
        </footer>
    );
}
