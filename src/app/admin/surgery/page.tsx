
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { collection, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useLanguage } from '@/contexts/language-context';
import { useAdminAuth } from "@/hooks/use-admin-auth";
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

interface Surgery {
    id: string;
    Category: string;
    SurgeryName: string;
    Description?: string;
    Price?: number;
    isPopular?: boolean;
    discountPrice?: number;
    createdAt?: any;
}

interface FormData {
    category: string;
    name: string;
    description: string;
    price: string;
    isPopular: boolean;
    discount: string;
}

const COLLECTION_NAME = 'surgeries';

export default function SurgeryAdminPage() {
    const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [surgeryToDelete, setSurgeryToDelete] = useState<Surgery | null>(null);
    const [formData, setFormData] = useState<FormData>({
        category: '',
        name: '',
        description: '',
        price: '',
        isPopular: false,
        discount: ''
    });

    const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);

    const firestore = useFirestore();

    const surgeryQuery = useMemoFirebase(() => {
        if (!firestore || !isAdmin) return null;
        return collection(firestore, COLLECTION_NAME);
    }, [firestore, isAdmin]);

    const { data: surgeries = [], isLoading } = useCollection<Surgery>(surgeryQuery);

    const handleEdit = (surgery: Surgery) => {
        setEditingSurgery(surgery);
        setFormData({
            category: surgery.Category ?? '',
            name: surgery.SurgeryName ?? '',
            description: surgery.Description ?? '',
            price: String(surgery.Price ?? ''),
            isPopular: !!surgery.isPopular,
            discount: String(surgery.discountPrice ?? ''),
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (surgery: Surgery) => {
        setSurgeryToDelete(surgery);
    };

    const confirmDelete = async () => {
        if (!surgeryToDelete?.id || !firestore) return;

        setIsDeleting(true);
        try {
            await deleteDoc(doc(firestore, COLLECTION_NAME, surgeryToDelete.id));

            toast({
                title: t.admin.dashboard.actions.successDelete,
                description: t.admin.dashboard.actions.successDelete,
            });
        } catch (error) {
            console.error('Error deleting surgery:', error);
            toast({
                variant: "destructive",
                title: t.admin.dashboard.actions.error,
                description: t.admin.dashboard.actions.errorSaving,
            });
        } finally {
            setIsDeleting(false);
            setSurgeryToDelete(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? (e.target as any).checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            category: '',
            name: '',
            description: '',
            price: '',
            isPopular: false,
            discount: ''
        });
        setEditingSurgery(null);
    };

    const handleSave = async () => {
        if (!firestore) return;

        try {
            setIsSaving(true);

            if (!formData.name || !formData.category) {
                toast({
                    variant: 'destructive',
                    title: t.admin.dashboard.actions.error,
                    description: t.admin.dashboard.actions.errorFields
                });
                return;
            }

            const surgeryData = {
                Category: formData.category,
                SurgeryName: formData.name,
                Description: formData.description || '',
                Price: formData.price ? parseFloat(formData.price) : 0,
                isPopular: !!formData.isPopular,
                discountPrice: formData.discount ? parseFloat(formData.discount) : null,
                ...(editingSurgery ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() })
            };

            if (editingSurgery?.id) {
                await updateDoc(doc(firestore, COLLECTION_NAME, editingSurgery.id), surgeryData);
                toast({
                    title: t.admin.dashboard.actions.successUpdate,
                    description: t.admin.dashboard.actions.successUpdate
                });
            } else {
                await addDoc(collection(firestore, COLLECTION_NAME), surgeryData);
                toast({
                    title: t.admin.dashboard.actions.successAdd,
                    description: t.admin.dashboard.actions.successAdd
                });
            }

            resetForm();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving surgery:', error);
            toast({
                variant: 'destructive',
                title: t.admin.dashboard.actions.error,
                description: t.admin.dashboard.actions.errorSaving
            });
        } finally {
            setIsSaving(false);
        }
    };

    const openDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    if (isAuthLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-primary">{t.admin.dashboard.surgeryAdmin.title}</h1>
                    <p className="text-muted-foreground mt-1">{t.admin.dashboard.surgeryAdmin.subtitle}</p>
                </div>
                <Button onClick={openDialog}>
                    <PlusCircle className="ml-2 h-5 w-5" />
                    {t.admin.dashboard.surgeryAdmin.addBtn}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t.admin.dashboard.surgeryAdmin.listTitle}</CardTitle>
                    <CardDescription>{t.admin.dashboard.surgeryAdmin.listDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t.admin.dashboard.surgeryAdmin.fields.category}</TableHead>
                                <TableHead>{t.admin.dashboard.surgeryAdmin.fields.name}</TableHead>
                                <TableHead>{t.admin.dashboard.actions.actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : surgeries && surgeries.length > 0 ? (
                                surgeries.map((surgery) => (
                                    <TableRow key={surgery.id}>
                                        <TableCell>{surgery.Category}</TableCell>
                                        <TableCell className="font-medium">{surgery.SurgeryName}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(surgery)}><Edit className="h-4 w-4" /></Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDelete(surgery)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting && surgeryToDelete?.id === surgery.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        {t.admin.dashboard.actions.noData}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <AlertDialog open={!!surgeryToDelete} onOpenChange={() => setSurgeryToDelete(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t.admin.dashboard.actions.confirm}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t.admin.dashboard.actions.delete} "{surgeryToDelete?.SurgeryName}"?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t.admin.dashboard.actions.cancel}</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                            {t.admin.dashboard.actions.deleting}
                                        </>
                                    ) : (
                                        t.admin.dashboard.actions.delete
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingSurgery ? t.admin.dashboard.actions.edit : t.admin.dashboard.surgeryAdmin.addBtn}</DialogTitle>
                        <div className="flex items-center gap-4 py-2 border-b">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPopular"
                                    checked={formData.isPopular}
                                    onChange={(e) => setFormData(p => ({ ...p, isPopular: e.target.checked }))}
                                    className="w-4 h-4 text-primary rounded"
                                />
                                <Label htmlFor="isPopular" className="text-xs font-bold text-amber-600">{t.admin.dashboard.surgeryAdmin.isPopular}</Label>
                            </div>
                        </div>
                        <DialogDescription>
                            {editingSurgery ? t.admin.dashboard.surgeryAdmin.editDesc : t.admin.dashboard.surgeryAdmin.addDesc}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">{t.admin.dashboard.surgeryAdmin.fields.category}</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    placeholder={t.admin.dashboard.surgeryAdmin.placeholders.category}
                                />
                            </div>
                            <div>
                                <Label htmlFor="name">{t.admin.dashboard.surgeryAdmin.fields.name}</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder={t.admin.dashboard.surgeryAdmin.placeholders.name}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">{t.admin.dashboard.surgeryAdmin.price}</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="discount">{t.admin.dashboard.surgeryAdmin.discount}</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    value={formData.discount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">{t.admin.dashboard.surgeryAdmin.fields.description}</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder={t.admin.dashboard.surgeryAdmin.placeholders.description}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.admin.dashboard.actions.cancel}</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                            {isSaving ? (editingSurgery ? t.admin.dashboard.actions.updating : t.admin.dashboard.actions.saving) : (editingSurgery ? t.admin.dashboard.actions.update : t.admin.dashboard.actions.save)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
