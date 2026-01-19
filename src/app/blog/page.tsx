"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { BlogArticle } from '@/types/blog';
import { getBlogArticles } from '@/lib/blog-service';

export default function BlogPage() {
    const { t, language } = useLanguage();
    const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const fetchedArticles = await getBlogArticles(firestore);

                if (fetchedArticles.length > 0) {
                    setArticles(fetchedArticles);
                } else {
                    // Fallback to static articles from translations if DB is empty
                    const staticArticles: any[] = [
                        {
                            id: '1',
                            titleAr: t.blog.articles[0].title,
                            titleEn: t.blog.articles[0].title,
                            excerptAr: t.blog.articles[0].excerpt,
                            excerptEn: t.blog.articles[0].excerpt,
                            contentAr: t.blog.articles[0].fullContent,
                            contentEn: t.blog.articles[0].fullContent,
                            categoryAr: t.blog.articles[0].category,
                            categoryEn: t.blog.articles[0].category,
                            authorAr: t.blog.articles[0].author,
                            authorEn: t.blog.articles[0].author,
                            publishDate: t.blog.articles[0].date,
                            image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80',
                        },
                        {
                            id: '2',
                            titleAr: t.blog.articles[1].title,
                            titleEn: t.blog.articles[1].title,
                            excerptAr: t.blog.articles[1].excerpt,
                            excerptEn: t.blog.articles[1].excerpt,
                            contentAr: t.blog.articles[1].fullContent,
                            contentEn: t.blog.articles[1].fullContent,
                            categoryAr: t.blog.articles[1].category,
                            categoryEn: t.blog.articles[1].category,
                            authorAr: t.blog.articles[1].author,
                            authorEn: t.blog.articles[1].author,
                            publishDate: t.blog.articles[1].date,
                            image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80',
                        },
                        {
                            id: '3',
                            titleAr: t.blog.articles[2].title,
                            titleEn: t.blog.articles[2].title,
                            excerptAr: t.blog.articles[2].excerpt,
                            excerptEn: t.blog.articles[2].excerpt,
                            contentAr: t.blog.articles[2].fullContent,
                            contentEn: t.blog.articles[2].fullContent,
                            categoryAr: t.blog.articles[2].category,
                            categoryEn: t.blog.articles[2].category,
                            authorAr: t.blog.articles[2].author,
                            authorEn: t.blog.articles[2].author,
                            publishDate: t.blog.articles[2].date,
                            image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&q=80',
                        },
                    ];
                    setArticles(staticArticles as BlogArticle[]);
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [firestore, language, t.blog.articles]);

    return (
        <main className="min-h-screen bg-background pb-20 pt-10">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">{t.blog.title}</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        {t.blog.subtitle}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary/40 mb-4" />
                        <p className="text-muted-foreground font-medium">
                            {language === 'ar' ? 'جاري تحميل المقالات...' : 'Loading articles...'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {articles.map((article) => {
                            const title = language === 'ar' ? article.titleAr : article.titleEn;
                            const excerpt = language === 'ar' ? article.excerptAr : article.excerptEn;
                            const author = language === 'ar' ? article.authorAr : article.authorEn;
                            const category = language === 'ar' ? article.categoryAr : article.categoryEn;
                            const date = article.publishDate?.toDate
                                ? article.publishDate.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                                : article.publishDate?.toString() || '';

                            return (
                                <Card key={article.id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full border-border/50 group shadow-lg">
                                    <div className="relative h-56 w-full overflow-hidden">
                                        <Image
                                            src={article.image}
                                            alt={title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <Badge className="absolute top-4 start-4 bg-primary px-3 py-1 font-bold shadow-lg">
                                            {category}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-7 text-start flex flex-col flex-grow bg-card transition-colors group-hover:bg-muted/5" dir="auto">
                                        <h2 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors cursor-pointer tracking-tight" onClick={() => setSelectedArticle(article)}>
                                            {title}
                                        </h2>
                                        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-grow font-medium">
                                            {excerpt}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border/40">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-primary/10 rounded-full">
                                                    <User className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <span className="font-bold text-foreground/70">{author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-muted rounded-full">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="font-medium">{date}</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            className="p-0 h-auto font-black text-primary hover:bg-transparent hover:text-primary/80 group w-fit justify-start text-base"
                                            onClick={() => setSelectedArticle(article)}
                                        >
                                            {t.blog.readMore}
                                            <ArrowLeft className={`w-4 h-4 ms-2 transition-transform duration-300 ${language === 'ar' ? 'rotate-0 group-hover:translate-x-1' : 'rotate-180 group-hover:-translate-x-1'}`} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Article Detail Dialog */}
            <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-3xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="relative h-64 md:h-[450px] w-full">
                        {selectedArticle && (
                            <Image
                                src={selectedArticle.image}
                                alt={language === 'ar' ? selectedArticle.titleAr : selectedArticle.titleEn}
                                fill
                                className="object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 inset-x-6 md:bottom-10 md:inset-x-10">
                            <Badge className="mb-4 bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-black text-sm shadow-xl">
                                {language === 'ar' ? selectedArticle?.categoryAr : selectedArticle?.categoryEn}
                            </Badge>
                            <DialogTitle className="text-2xl md:text-4xl font-black font-headline text-white mb-4 line-clamp-2 leading-tight">
                                {language === 'ar' ? selectedArticle?.titleAr : selectedArticle?.titleEn}
                            </DialogTitle>
                            <div className="flex items-center gap-6 text-sm text-white/90">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="font-bold">{language === 'ar' ? selectedArticle?.authorAr : selectedArticle?.authorEn}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">
                                        {selectedArticle?.publishDate?.toDate
                                            ? selectedArticle.publishDate.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                                            : selectedArticle?.publishDate?.toString() || ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        <DialogDescription className="text-lg md:text-xl text-foreground leading-[1.8] whitespace-pre-wrap font-medium">
                            {language === 'ar' ? selectedArticle?.contentAr : selectedArticle?.contentEn}
                        </DialogDescription>

                        <div className="mt-12 flex justify-end">
                            <Button variant="outline" onClick={() => setSelectedArticle(null)} className="rounded-xl h-12 px-8 font-bold border-primary/20 hover:bg-primary/5 transition-all">
                                {t.blog.close}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}
