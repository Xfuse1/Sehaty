'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { PlusCircle, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { uploadToCloudinary } from '@/lib/cloudinary';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BlogArticle } from '@/types/blog';
import { getBlogArticles } from '@/lib/blog-service';

export default function AdminBlogPage() {
    const { t, language } = useLanguage();
    const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<BlogArticle | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formValues, setFormValues] = useState({
        titleAr: '',
        titleEn: '',
        excerptAr: '',
        excerptEn: '',
        contentAr: '',
        contentEn: '',
        authorAr: '',
        authorEn: '',
        categoryAr: '',
        categoryEn: '',
        image: '',
        publishDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const articlesData = await getBlogArticles(firestore);
                setArticles(articlesData);
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAuthLoading && isAdmin) {
            fetchArticles();
        }
    }, [firestore, isAdmin, isAuthLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const openDialog = () => {
        setEditingArticle(null);
        setFormValues({
            titleAr: '',
            titleEn: '',
            excerptAr: '',
            excerptEn: '',
            contentAr: '',
            contentEn: '',
            authorAr: '',
            authorEn: '',
            categoryAr: '',
            categoryEn: '',
            image: '',
            publishDate: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (article: BlogArticle) => {
        setEditingArticle(article);
        setFormValues({
            titleAr: article.titleAr || '',
            titleEn: article.titleEn || '',
            excerptAr: article.excerptAr || '',
            excerptEn: article.excerptEn || '',
            contentAr: article.contentAr || '',
            contentEn: article.contentEn || '',
            authorAr: article.authorAr || '',
            authorEn: article.authorEn || '',
            categoryAr: article.categoryAr || '',
            categoryEn: article.categoryEn || '',
            image: article.image || '',
            publishDate: article.publishDate instanceof Timestamp
                ? article.publishDate.toDate().toISOString().split('T')[0]
                : (article.publishDate || new Date().toISOString().split('T')[0])
        });
        setSelectedFile(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (article: BlogArticle) => {
        setArticleToDelete(article);
    };

    const confirmDelete = async () => {
        if (!articleToDelete) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(firestore, 'blog_articles', articleToDelete.id));
            setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
            toast({ title: t.admin.dashboard.actions.successUpdate });
        } catch (error) {
            toast({ variant: "destructive", title: t.admin.dashboard.actions.error });
        } finally {
            setIsDeleting(false);
            setArticleToDelete(null);
        }
    };

    const handleSave = async () => {
        if (!formValues.titleAr || !formValues.titleEn) {
            toast({ variant: "destructive", title: "Titles are required" });
            return;
        }

        setIsSaving(true);
        try {
            let finalImageUrl = formValues.image;

            if (selectedFile) {
                console.log('Starting compression for file:', selectedFile.name);
                const compressedFile = await compressImage(selectedFile);
                console.log(`Compression success. Size reduced from ${(selectedFile.size / 1024).toFixed(2)}KB to ${(compressedFile.size / 1024).toFixed(2)}KB`);

                console.log('Starting Cloudinary upload...');
                finalImageUrl = await uploadToCloudinary(compressedFile, 'blog');
                console.log('Cloudinary upload success. URL:', finalImageUrl);
            } else {
                console.log('No new file selected, using existing image URL or empty:', finalImageUrl);
            }

            const data = {
                ...formValues,
                image: finalImageUrl,
                publishDate: Timestamp.fromDate(new Date(formValues.publishDate)),
                updatedAt: Timestamp.now(),
            };

            if (editingArticle) {
                await updateDoc(doc(firestore, 'blog_articles', editingArticle.id), data);
                setArticles(prev => prev.map(a => a.id === editingArticle.id ? { ...a, ...data } : a));
                toast({ title: t.admin.dashboard.blogAdmin.title, description: t.admin.dashboard.actions.successUpdate });
            } else {
                const docRef = await addDoc(collection(firestore, 'blog_articles'), {
                    ...data,
                    createdAt: Timestamp.now()
                });
                setArticles(prev => [{ id: docRef.id, ...data, createdAt: Timestamp.now() } as BlogArticle, ...prev]);
                toast({ title: t.admin.dashboard.blogAdmin.title, description: t.admin.dashboard.actions.successUpdate });
            }
            setSelectedFile(null);
            setIsDialogOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: t.admin.dashboard.actions.error });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', {
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                type: file.type
            });
            setSelectedFile(file);

            // Fast preview using object URL
            const previewUrl = URL.createObjectURL(file);
            setFormValues(prev => ({
                ...prev,
                image: previewUrl
            }));
            console.log('Object URL created for fast preview');
        }
    };

    if (isAuthLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black font-headline text-primary tracking-tight">{t.admin.dashboard.blogAdmin.title}</h1>
                    <p className="text-muted-foreground font-medium">{t.admin.dashboard.blogAdmin.subtitle}</p>
                </div>
                <Button onClick={openDialog} className="w-full md:w-auto h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    {t.admin.dashboard.blogAdmin.addBtn}
                </Button>
            </div>

            <Card className="shadow-xl border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6">
                    <CardTitle className="text-xl font-bold">{t.admin.dashboard.blogAdmin.listTitle}</CardTitle>
                    <CardDescription className="font-medium">{t.admin.dashboard.blogAdmin.listDesc}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="inline-block min-w-full align-middle">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                                        <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.blogAdmin.fields.image}</TableHead>
                                        <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.blogAdmin.table.title}</TableHead>
                                        <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.blogAdmin.table.author}</TableHead>
                                        <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.blogAdmin.table.category}</TableHead>
                                        <TableHead className="text-center font-bold py-4 whitespace-nowrap">{t.admin.dashboard.actions.actions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12">
                                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/60" />
                                            </TableCell>
                                        </TableRow>
                                    ) : articles.length > 0 ? (
                                        articles.map((article) => (
                                            <TableRow key={article.id} className="hover:bg-muted/10 transition-colors">
                                                <TableCell className="align-middle">
                                                    <div className="relative w-16 h-10 rounded-lg overflow-hidden border">
                                                        {article.image ? (
                                                            <Image
                                                                src={article.image}
                                                                alt="article"
                                                                fill
                                                                className="object-cover"
                                                                onError={(e) => {
                                                                    console.error(`Failed to load image for article: ${article.id}`, {
                                                                        url: article.image,
                                                                        error: e
                                                                    });
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                                                <ImageIcon className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold align-middle">
                                                    {language === 'ar' ? article.titleAr : article.titleEn}
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    {language === 'ar' ? article.authorAr : article.authorEn}
                                                </TableCell>
                                                <TableCell className="align-middle">
                                                    {language === 'ar' ? article.categoryAr : article.categoryEn}
                                                </TableCell>
                                                <TableCell className="align-middle text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button variant="outline" size="icon" onClick={() => handleEdit(article)} className="h-9 w-9">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(article)} className="h-9 w-9">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                {language === 'ar' ? 'لا توجد مقالات' : 'No articles found'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.admin.dashboard.actions.delete}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {language === 'ar' ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Are you sure you want to delete this article?'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.admin.dashboard.actions.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.admin.dashboard.actions.confirm}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle>{editingArticle ? t.admin.dashboard.blogAdmin.editTitle : t.admin.dashboard.blogAdmin.addTitle}</DialogTitle>
                        <DialogDescription>{t.admin.dashboard.blogAdmin.formDesc}</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="arabic" className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="arabic">العربية</TabsTrigger>
                            <TabsTrigger value="english">English</TabsTrigger>
                        </TabsList>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="md:col-span-1 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.image}</label>
                                    <div
                                        className="relative aspect-video rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-primary transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {isUploading ? (
                                            <div className="text-center p-4">
                                                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-2" />
                                                <span className="text-xs text-muted-foreground font-medium">Uploading...</span>
                                            </div>
                                        ) : formValues.image ? (
                                            <Image
                                                src={formValues.image}
                                                alt="Upload"
                                                fill
                                                className="object-cover"
                                                onError={() => console.error('Failed to load preview image:', formValues.image)}
                                            />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="h-8 w-8 mx-auto text-primary/40 mb-2" />
                                                <span className="text-xs text-muted-foreground font-medium">{t.admin.dashboard.doctorForm.selectImage}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ImageIcon className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.publishDate}</label>
                                    <Input type="date" name="publishDate" value={formValues.publishDate} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <TabsContent value="arabic" className="space-y-4 mt-0">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.titleAr}</label>
                                        <Input name="titleAr" value={formValues.titleAr} onChange={handleInputChange} dir="rtl" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.authorAr}</label>
                                            <Input name="authorAr" value={formValues.authorAr} onChange={handleInputChange} dir="rtl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.categoryAr}</label>
                                            <Input name="categoryAr" value={formValues.categoryAr} onChange={handleInputChange} dir="rtl" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.excerptAr}</label>
                                        <Textarea name="excerptAr" value={formValues.excerptAr} onChange={handleInputChange} dir="rtl" className="h-20" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.contentAr}</label>
                                        <Textarea name="contentAr" value={formValues.contentAr} onChange={handleInputChange} dir="rtl" className="h-40" />
                                    </div>
                                </TabsContent>

                                <TabsContent value="english" className="space-y-4 mt-0">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.titleEn}</label>
                                        <Input name="titleEn" value={formValues.titleEn} onChange={handleInputChange} dir="ltr" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.authorEn}</label>
                                            <Input name="authorEn" value={formValues.authorEn} onChange={handleInputChange} dir="ltr" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.categoryEn}</label>
                                            <Input name="categoryEn" value={formValues.categoryEn} onChange={handleInputChange} dir="ltr" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.excerptEn}</label>
                                        <Textarea name="excerptEn" value={formValues.excerptEn} onChange={handleInputChange} dir="ltr" className="h-20" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">{t.admin.dashboard.blogAdmin.fields.contentEn}</label>
                                        <Textarea name="contentEn" value={formValues.contentEn} onChange={handleInputChange} dir="ltr" className="h-40" />
                                    </div>
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>

                    <DialogFooter className="border-t pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">{t.admin.dashboard.actions.cancel}</Button>
                        </DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            {editingArticle ? t.admin.dashboard.actions.update : t.admin.dashboard.actions.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
