"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';

export default function FAQPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-background pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">{t.faq.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Service Questions */}
        <div className="mb-12">
          <Badge variant="outline" className="mb-6 text-base px-4 py-1">{t.faq.serviceTitle}</Badge>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-start hover:no-underline">
                <span className="font-semibold">{t.faq.questions.q1}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t.faq.questions.a1}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-start hover:no-underline">
                <span className="font-semibold">{t.faq.questions.q3}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t.faq.questions.a3}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Booking Questions */}
        <div className="mb-12">
          <Badge variant="outline" className="mb-6 text-base px-4 py-1">{t.faq.bookingTitle}</Badge>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-start hover:no-underline">
                <span className="font-semibold">{t.faq.questions.q4}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t.faq.questions.a4}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-start hover:no-underline">
                <span className="font-semibold">{t.faq.questions.q5}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t.faq.questions.a5}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Privacy Questions */}
        <div className="mb-12">
          <Badge variant="outline" className="mb-6 text-base px-4 py-1">{t.faq.privacyTitle}</Badge>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-5" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-start hover:no-underline">
                <span className="font-semibold">{t.faq.questions.q2}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t.faq.questions.a2}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-start hover:no-underline">
                <span className="font-semibold">{t.faq.questions.q6}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {t.faq.questions.a6}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 bg-muted/30 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t.faq.ctaTitle}</h2>
          <Button asChild size="lg" className="px-8">
            <Link href="/contact">{t.faq.ctaButton}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
