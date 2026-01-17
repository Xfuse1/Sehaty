"use client";

import { useLanguage } from "@/contexts/language-context";

export function QuizBanner() {
    const { t } = useLanguage();

    return (
        <div className="w-full bg-gradient-to-r from-primary via-blue-600 to-primary text-white py-3 px-4 text-center text-sm md:text-base font-bold shadow-md z-30 relative">
            {t.highlights.quizBanner.text}
            <a href="/quiz" className="underline mx-2 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors inline-block mt-2 md:mt-0">
                {t.highlights.quizBanner.link}
            </a>
        </div>
    );
}
