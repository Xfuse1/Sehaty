
'use client';

import { useState, useEffect } from 'react';
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
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useLanguage } from '@/contexts/language-context';
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface NursingPackage {
  id: string;
  PackageName: string;
  Price: number;
  Duration: string;
  Description?: string;
  Features?: string;
  isPopular?: boolean;
  discountPrice?: number;
  createdAt?: any;
}

interface FormData {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string;
  isPopular: boolean;
  discount: string;
}

const COLLECTION_NAME = 'nursing_care';

export default function NursingPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    duration: '',
    description: '',
    features: '',
    isPopular: false,
    discount: ''
  });
  const [editingPackage, setEditingPackage] = useState<NursingPackage | null>(null);

  const handleEdit = (pkg: NursingPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.PackageName ?? '',
      price: String(pkg.Price ?? ''),
      duration: pkg.Duration ?? '',
      description: pkg.Description ?? '',
      features: pkg.Features ?? '',
      isPopular: !!pkg.isPopular,
      discount: String(pkg.discountPrice ?? ''),
    });
    setIsDialogOpen(true);
  };

  const firestore = useFirestore();
  const nursingQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, COLLECTION_NAME);
  }, [firestore, isAdmin]);

  const { data: packages = [], isLoading } = useCollection<NursingPackage>(nursingQuery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? (e.target as any).checked : value
    }));
  };


  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      description: '',
      features: '',
      isPopular: false,
      discount: ''
    });
    setEditingPackage(null);
  };

  const handleSave = async () => {
    if (!firestore) return;

    try {
      setIsSaving(true);

      // Validate required fields
      if (!formData.name || !formData.price || !formData.duration) {
        toast({
          variant: 'destructive',
          title: t.admin.dashboard.actions.error,
          description: t.admin.dashboard.actions.errorFields
        });
        return;
      }

      // Create the package document
      const packageData = {
        PackageName: formData.name,
        Price: parseFloat(formData.price),
        Duration: formData.duration,
        Description: formData.description,
        Features: formData.features,
        isPopular: !!formData.isPopular,
        discountPrice: formData.discount ? parseFloat(formData.discount) : null,
        ...(editingPackage ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() })
      };

      if (editingPackage?.id) {
        // Update existing package
        await updateDoc(doc(firestore, COLLECTION_NAME, editingPackage.id), packageData);
        toast({
          title: t.admin.dashboard.actions.successUpdate,
          description: t.admin.dashboard.actions.successUpdate
        });
      } else {
        // Create new package
        await addDoc(collection(firestore, COLLECTION_NAME), packageData);
        toast({
          title: t.admin.dashboard.actions.successAdd,
          description: t.admin.dashboard.actions.successAdd
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving package:', error);
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
          <h1 className="text-3xl font-bold font-headline text-primary">{t.admin.dashboard.nursingAdmin.title}</h1>
          <p className="text-muted-foreground mt-1">{t.admin.dashboard.nursingAdmin.subtitle}</p>
        </div>
        <Button onClick={openDialog}>
          <PlusCircle className="ml-2 h-5 w-5" />
          {t.admin.dashboard.nursingAdmin.addBtn}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.dashboard.nursingAdmin.listTitle}</CardTitle>
          <CardDescription>{t.admin.dashboard.nursingAdmin.listDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.dashboard.nursingAdmin.fields.name}</TableHead>
                <TableHead>{t.admin.dashboard.nursingAdmin.fields.price}</TableHead>
                <TableHead>{t.admin.dashboard.nursingAdmin.fields.duration}</TableHead>
                <TableHead>{t.admin.dashboard.actions.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : packages && packages.length > 0 ? (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.PackageName}</TableCell>
                    <TableCell>{pkg.Price} {t.admin.dashboard.actions.currency}</TableCell>
                    <TableCell>{pkg.Duration}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(pkg)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {t.admin.dashboard.actions.noData}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPackage ? t.admin.dashboard.actions.edit : t.admin.dashboard.nursingAdmin.addBtn}</DialogTitle>
            <div className="flex items-center gap-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData(p => ({ ...p, isPopular: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <Label htmlFor="isPopular" className="text-xs font-bold text-amber-600">{t.admin.dashboard.nursingAdmin.isPopular}</Label>
              </div>
            </div>
            <DialogDescription>
              {editingPackage ? t.admin.dashboard.nursingAdmin.editDesc : t.admin.dashboard.nursingAdmin.addDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t.admin.dashboard.nursingAdmin.fields.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t.admin.dashboard.nursingAdmin.placeholders.name}
                />
              </div>
              <div>
                <Label htmlFor="price">{t.admin.dashboard.nursingAdmin.fields.price}</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder={t.admin.dashboard.nursingAdmin.placeholders.price}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">{t.admin.dashboard.nursingAdmin.discount}</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="duration">{t.admin.dashboard.nursingAdmin.fields.duration}</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder={t.admin.dashboard.nursingAdmin.placeholders.duration}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">{t.admin.dashboard.nursingAdmin.fields.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t.admin.dashboard.nursingAdmin.placeholders.description}
              />
            </div>
            <div>
              <Label htmlFor="features">{t.admin.dashboard.nursingAdmin.fields.features}</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder={t.admin.dashboard.nursingAdmin.placeholders.features}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.admin.dashboard.actions.cancel}</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? (editingPackage ? t.admin.dashboard.actions.updating : t.admin.dashboard.actions.saving) : (editingPackage ? t.admin.dashboard.actions.update : t.admin.dashboard.actions.save)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
