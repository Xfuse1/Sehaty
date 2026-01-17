"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function Testimonials() {
    const { t } = useLanguage();

    const testimonialData = [
        {
            id: 1,
            name: t.testimonials.items[0].name,
            role: t.testimonials.items[0].role,
            image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100",
            content: t.testimonials.items[0].content,
            rating: 5,
        },
        {
            id: 2,
            name: t.testimonials.items[1].name,
            role: t.testimonials.items[1].role,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
            content: t.testimonials.items[1].content,
            rating: 5,
        },
        {
            id: 3,
            name: t.testimonials.items[2].name,
            role: t.testimonials.items[2].role,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
            content: t.testimonials.items[2].content,
            rating: 4,
        },
    ];

    return (
        <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16 px-4" dir="auto">
                    <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 text-primary">
                        {t.testimonials.title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t.testimonials.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonialData.map((testimonial) => (
                        <Card key={testimonial.id} className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10 ltr:right-0 ltr:left-auto rtl:right-0 rtl:left-auto">
                                <Quote className="w-24 h-24 text-primary" />
                            </div>
                            <CardContent className="p-8 flex flex-col h-full relative z-10 text-start" dir="auto">
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <p className="text-foreground/80 leading-relaxed mb-6 flex-grow font-medium">
                                    "{testimonial.content}"
                                </p>

                                <div className="flex items-center gap-4 mt-auto">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-start">
                                        <h4 className="font-bold text-sm">{testimonial.name}</h4>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
