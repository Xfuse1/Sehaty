'use client';

import { ChangeEvent, useMemo, useState } from 'react';
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
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, DocumentData } from "firebase/firestore";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhysiotherapyPackage extends DocumentData {
  id?: string;
  PackageName?: string;
  Price?: number;
  Duration?: string;
  Features?: string;
  Decreption?: string;
  isPopular?: boolean;
  discountPrice?: number;
}

interface FormValues {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string;
  isPopular: boolean;
  discount: string;
}

const COLLECTION_PATH = 'physical_therapy';

export default function PhysiotherapyPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<PhysiotherapyPackage | null>(null);
  const firestore = useFirestore();

  const handleDelete = async (pkg: PhysiotherapyPackage) => {
    setPackageToDelete(pkg);
  };

  const confirmDelete = async () => {
    if (!packageToDelete?.id) return;

    setIsDeleting(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(firestore, COLLECTION_PATH, packageToDelete.id));

      toast({
        title: t.admin.dashboard.actions.successDelete,
        description: t.admin.dashboard.actions.successDelete,
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorSaving,
      });
    } finally {
      setIsDeleting(false);
      setPackageToDelete(null);
    }
  };

  const physiotherapyQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, COLLECTION_PATH);
  }, [firestore, isAdmin]);

  const { data, isLoading } = useCollection<PhysiotherapyPackage>(physiotherapyQuery);
  const packages = data ?? [];

  const displayPackages = useMemo(() => {
    return (packages ?? []).map((pkg) => ({
      id: pkg.id,
      name: pkg.PackageName ?? '',
      price: pkg.Price ?? 0,
      duration: pkg.Duration ?? '',
    }));
  }, [packages]);

  const createEmptyForm = (): FormValues => ({
    name: '',
    price: '',
    duration: '',
    description: '',
    features: '',
    isPopular: false,
    discount: '',
  });

  const [formValues, setFormValues] = useState<FormValues>(createEmptyForm);
  const [editingPackage, setEditingPackage] = useState<PhysiotherapyPackage | null>(null);

  const handleEdit = (pkg: PhysiotherapyPackage) => {
    setEditingPackage(pkg);
    setFormValues({
      name: pkg.PackageName ?? '',
      price: String(pkg.Price ?? ''),
      duration: pkg.Duration ?? '',
      description: pkg.Decreption ?? '',
      features: pkg.Features ?? '',
      isPopular: !!pkg.isPopular,
      discount: String(pkg.discountPrice ?? ''),
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target as any;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as any).checked : value,
    }));
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const trimmedName = formValues.name.trim();
    const priceValue = formValues.price.trim();
    const durationValue = formValues.duration.trim();
    const descriptionValue = formValues.description.trim();
    const featuresValue = formValues.features.trim();

    if (!trimmedName || !priceValue || !durationValue) {
      toast({
        variant: 'destructive',
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorFields,
      });
      return;
    }

    const parsedPrice = Number(priceValue);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        variant: 'destructive',
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorFields,
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingPackage?.id) {
        // Update existing package
        await updateDoc(doc(firestore, COLLECTION_PATH, editingPackage.id), {
          PackageName: trimmedName,
          Price: parsedPrice,
          Duration: durationValue,
          Decreption: descriptionValue,
          Features: featuresValue,
          isPopular: !!formValues.isPopular,
          discountPrice: formValues.discount ? parseFloat(formValues.discount) : null,
          updatedAt: serverTimestamp(),
        });

        toast({
          title: t.admin.dashboard.actions.successUpdate,
          description: t.admin.dashboard.actions.successUpdate,
        });
      } else {
        // Create new package
        await addDoc(collection(firestore, COLLECTION_PATH), {
          PackageName: trimmedName,
          Price: parsedPrice,
          Duration: durationValue,
          Decreption: descriptionValue,
          Features: featuresValue,
          isPopular: !!formValues.isPopular,
          discountPrice: formValues.discount ? parseFloat(formValues.discount) : null,
          createdAt: serverTimestamp(),
        });

        toast({
          title: t.admin.dashboard.actions.successAdd,
          description: t.admin.dashboard.actions.successAdd,
        });
      }

      setFormValues(createEmptyForm());
      setEditingPackage(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save physiotherapy package', error);
      toast({
        variant: 'destructive',
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorSaving,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openDialog = () => {
    setEditingPackage(null);
    setFormValues(createEmptyForm());
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
          <h1 className="text-3xl font-bold font-headline text-primary">{t.admin.dashboard.physioAdmin.title}</h1>
          <p className="text-muted-foreground mt-1">{t.admin.dashboard.physioAdmin.subtitle}</p>
        </div>
        <Button onClick={openDialog}>
          <PlusCircle className="ml-2 h-5 w-5" />
          {t.admin.dashboard.physioAdmin.addBtn}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.dashboard.physioAdmin.listTitle}</CardTitle>
          <CardDescription>{t.admin.dashboard.physioAdmin.listDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.dashboard.physioAdmin.fields.name}</TableHead>
                <TableHead>{t.admin.dashboard.physioAdmin.fields.price}</TableHead>
                <TableHead>{t.admin.dashboard.physioAdmin.fields.duration}</TableHead>
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
              ) : displayPackages.length > 0 ? (
                (packages ?? []).map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.PackageName}</TableCell>
                    <TableCell>{pkg.Price} {t.admin.dashboard.actions.currency}</TableCell>
                    <TableCell>{pkg.Duration}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(pkg)}><Edit className="h-4 w-4" /></Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(pkg)}
                        disabled={isDeleting}
                      >
                        {isDeleting && packageToDelete?.id === pkg.id ? (
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
                  <TableCell colSpan={4} className="text-center py-8">
                    {t.admin.dashboard.actions.noData}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!packageToDelete} onOpenChange={() => setPackageToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.admin.dashboard.actions.confirm}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.admin.dashboard.actions.delete} "{packageToDelete?.PackageName}"?
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
            <DialogTitle>{editingPackage ? t.admin.dashboard.actions.edit : t.admin.dashboard.physioAdmin.addBtn}</DialogTitle>
            <div className="flex items-center gap-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  name="isPopular"
                  checked={formValues.isPopular}
                  onChange={(e) => setFormValues(p => ({ ...p, isPopular: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <Label htmlFor="isPopular" className="text-xs font-bold text-amber-600">{t.admin.dashboard.physioAdmin.isPopular}</Label>
              </div>
            </div>
            <DialogDescription>
              {editingPackage ? t.admin.dashboard.physioAdmin.editDesc : t.admin.dashboard.physioAdmin.addDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t.admin.dashboard.physioAdmin.fields.name}</Label>
                <Input id="name" name="name" value={formValues.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="price">{t.admin.dashboard.physioAdmin.fields.price}</Label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  value={formValues.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">{t.admin.dashboard.physioAdmin.discount}</Label>
                <Input
                  id="discount"
                  type="number"
                  name="discount"
                  value={formValues.discount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="duration">{t.admin.dashboard.physioAdmin.fields.duration}</Label>
                <Input id="duration" name="duration" value={formValues.duration} onChange={handleInputChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="description">{t.admin.dashboard.physioAdmin.fields.description}</Label>
              <Textarea
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="features">{t.admin.dashboard.physioAdmin.fields.features}</Label>
              <Textarea
                id="features"
                name="features"
                value={formValues.features}
                onChange={handleInputChange}
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
