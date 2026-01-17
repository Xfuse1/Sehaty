"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

type Language = 'ar' | 'en';
export type Translations = typeof translations.ar;

interface LanguageContextType {
    language: Language;
    direction: 'rtl' | 'ltr';
    t: Translations;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'ar' || saved === 'en')) {
            setLanguageState(saved);
            document.documentElement.lang = saved;
            document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
        }
    }, []);

    const direction = language === 'ar' ? 'rtl' : 'ltr';
    const t = translations[language];

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <LanguageContext.Provider value={{ language, direction, t, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
