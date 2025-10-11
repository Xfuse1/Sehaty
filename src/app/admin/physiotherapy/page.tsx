'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, DocumentData } from 'firebase/firestore';

interface PhysiotherapyPackage extends DocumentData {
  id?: string;
  PackageName?: string;
  Price?: number;
  Duration?: string;
  Features?: string;
  Decreption?: string;
}

interface FormValues {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string;
}

const COLLECTION_PATH = 'physical_therapy';

export default function PhysiotherapyPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();

  const physiotherapyQuery = useMemoFirebase(() => {
    return collection(firestore, COLLECTION_PATH);
  }, [firestore]);

const { data: packages = [], isLoading } = useCollection<PhysiotherapyPackage>(physiotherapyQuery);

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
  });

  const [formValues, setFormValues] = useState<FormValues>(createEmptyForm);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
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
        title: 'الحقول الرئيسية مطلوبة',
        description: 'اسم الباقة، السعر، والمدّة يجب تعبئتها.',
      });
      return;
    }

    const parsedPrice = Number(priceValue);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        variant: 'destructive',
        title: 'قيمة سعر غير صحيحة',
        description: 'الرجاء إدخال سعر صحيح وإيجابي.',
      });
      return;
    }

    setIsSaving(true);

    try {
      await addDoc(collection(firestore, COLLECTION_PATH), {
        PackageName: trimmedName,
        Price: parsedPrice,
        Duration: durationValue,
        Decreption: descriptionValue,
        Features: featuresValue,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'تم حفظ الباقة',
        description: 'تمت إضافة الباقة بنجاح.',
      });

      setFormValues(createEmptyForm());
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save physiotherapy package', error);
      toast({
        variant: 'destructive',
        title: 'فشل حفظ البيانات',
        description: 'الرجاء المحاولة مجددًا بعد قليل.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة باقات العلاج الطبيعي</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف باقات العلاج الطبيعي.</p>
        </div>
        <Button onClick={openDialog}>
          <PlusCircle className="ml-2 h-5 w-5" />
          إضافة باقة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>قائمة الباقات</CardTitle>
            <CardDescription>هذه هي الباقات المتاحة في صفحة العلاج الطبيعي.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>اسم الباقة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المدّة</TableHead>
                <TableHead>إجراءات</TableHead>
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
                displayPackages.map((pkg) => (
                    <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.price } ج.م</TableCell>
                    <TableCell>{pkg.duration}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={openDialog}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                    لا توجد باقات حاليًا.
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
            <DialogTitle>إضافة باقة جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم الباقة</Label>
                <Input id="name" name="name" value={formValues.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  value={formValues.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">المدّة (مثال: 4 جلسات)</Label>
              <Input id="duration" name="duration" value={formValues.duration} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="description">وصف الباقة</Label>
              <Textarea
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="features">المميزات (كل ميزة في سطر)</Label>
              <Textarea
                id="features"
                name="features"
                value={formValues.features}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
