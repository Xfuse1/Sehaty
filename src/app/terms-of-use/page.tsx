"use client";

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

export default function TermsOfUsePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-background pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">{t.terms.title}</h1>
          <Badge variant="outline" className="text-sm">{t.terms.lastUpdated}</Badge>
        </div>

        <Card className="p-8 md:p-12 shadow-lg">
          <div className="prose prose-lg max-w-none text-start" dir="auto">
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t.terms.intro}
            </p>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t.terms.section1Title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.section1Content}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t.terms.section2Title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.section2Content}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t.terms.section3Title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.section3Content}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">{t.terms.section4Title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.terms.section4Content}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
