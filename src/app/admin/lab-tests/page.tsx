
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

interface LabTest {
  id: string;
  TestName: string;
  Price: number;
  Description?: string;
  isPopular?: boolean;
  discountPrice?: number;
  createdAt?: any;
}

interface FormData {
  name: string;
  price: string;
  description: string;
  isPopular: boolean;
  discount: string;
}

const COLLECTION_NAME = 'lab_tests';

export default function LabTestsPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testToDelete, setTestToDelete] = useState<LabTest | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    description: '',
    isPopular: false,
    discount: ''
  });
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);

  const handleEdit = (test: LabTest) => {
    setEditingTest(test);
    setFormData({
      name: test.TestName ?? '',
      price: String(test.Price ?? ''),
      description: test.Description ?? '',
      isPopular: !!test.isPopular,
      discount: String(test.discountPrice ?? ''),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (test: LabTest) => {
    setTestToDelete(test);
  };

  const confirmDelete = async () => {
    if (!testToDelete?.id || !firestore) return;

    setIsDeleting(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(firestore, COLLECTION_NAME, testToDelete.id));

      toast({
        title: t.admin.dashboard.actions.successDelete,
        description: t.admin.dashboard.actions.successDelete,
      });
    } catch (error) {
      console.error('Error deleting lab test:', error);
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorSaving,
      });
    } finally {
      setIsDeleting(false);
      setTestToDelete(null);
    }
  };

  const firestore = useFirestore();
  const labTestsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, COLLECTION_NAME);
  }, [firestore, isAdmin]);

  const { data: labTests = [], isLoading } = useCollection<LabTest>(labTestsQuery);

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
      description: '',
      isPopular: false,
      discount: ''
    });
    setEditingTest(null);
  };

  const handleSave = async () => {
    if (!firestore) return;

    try {
      setIsSaving(true);

      // Validate required fields
      if (!formData.name || !formData.price) {
        toast({
          variant: 'destructive',
          title: t.admin.dashboard.actions.error,
          description: t.admin.dashboard.actions.errorFields
        });
        return;
      }

      // Create the test document
      const testData = {
        TestName: formData.name,
        Price: parseFloat(formData.price),
        Description: formData.description || '',
        isPopular: !!formData.isPopular,
        discountPrice: formData.discount ? parseFloat(formData.discount) : null,
        ...(editingTest ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() })
      };

      if (editingTest?.id) {
        // Update existing test
        await updateDoc(doc(firestore, COLLECTION_NAME, editingTest.id), testData);
        toast({
          title: t.admin.dashboard.actions.successUpdate,
          description: t.admin.dashboard.actions.successUpdate
        });
      } else {
        // Create new test
        await addDoc(collection(firestore, COLLECTION_NAME), testData);
        toast({
          title: t.admin.dashboard.actions.successAdd,
          description: t.admin.dashboard.actions.successAdd
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving lab test:', error);
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
          <h1 className="text-3xl font-bold font-headline text-primary">{t.admin.dashboard.labAdmin.title}</h1>
          <p className="text-muted-foreground mt-1">{t.admin.dashboard.labAdmin.subtitle}</p>
        </div>
        <Button onClick={openDialog}>
          <PlusCircle className="ml-2 h-5 w-5" />
          {t.admin.dashboard.labAdmin.addBtn}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.admin.dashboard.labAdmin.listTitle}</CardTitle>
          <CardDescription>{t.admin.dashboard.labAdmin.listDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.dashboard.labAdmin.fields.name}</TableHead>
                <TableHead>{t.admin.dashboard.labAdmin.fields.price}</TableHead>
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
              ) : labTests && labTests.length > 0 ? (
                labTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.TestName}</TableCell>
                    <TableCell>{test.Price} {t.admin.dashboard.actions.currency}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(test)}><Edit className="h-4 w-4" /></Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(test)}
                        disabled={isDeleting}
                      >
                        {isDeleting && testToDelete?.id === test.id ? (
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

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!testToDelete} onOpenChange={() => setTestToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.admin.dashboard.actions.confirm}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.admin.dashboard.actions.delete} "{testToDelete?.TestName}"?
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
            <DialogTitle>{editingTest ? t.admin.dashboard.actions.edit : t.admin.dashboard.labAdmin.addBtn}</DialogTitle>
            <div className="flex items-center gap-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData(p => ({ ...p, isPopular: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <Label htmlFor="isPopular" className="text-xs font-bold text-amber-600">{t.admin.dashboard.labAdmin.isPopular}</Label>
              </div>
            </div>
            <DialogDescription>
              {editingTest ? t.admin.dashboard.labAdmin.editDesc : t.admin.dashboard.labAdmin.addDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t.admin.dashboard.labAdmin.fields.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t.admin.dashboard.labAdmin.placeholders.name}
                />
              </div>
              <div>
                <Label htmlFor="price">{t.admin.dashboard.labAdmin.fields.price}</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder={t.admin.dashboard.labAdmin.placeholders.price}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">{t.admin.dashboard.labAdmin.discount}</Label>
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
              <Label htmlFor="description">{t.admin.dashboard.labAdmin.fields.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t.admin.dashboard.labAdmin.placeholders.description}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.admin.dashboard.actions.cancel}</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? (editingTest ? t.admin.dashboard.actions.updating : t.admin.dashboard.actions.saving) : (editingTest ? t.admin.dashboard.actions.update : t.admin.dashboard.actions.save)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
