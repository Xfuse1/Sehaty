
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
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

interface PhysiotherapyPackage {
  id?: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

export default function PhysiotherapyPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Partial<PhysiotherapyPackage> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [packages, setPackages] = useState<PhysiotherapyPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        setIsLoading(true);
        const packagesCol = collection(firestore, 'physiotherapyPackages');
        const packagesSnapshot = await getDocs(packagesCol);
        const packagesList = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PhysiotherapyPackage));
        setPackages(packagesList);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب الباقات",
          description: "لم نتمكن من تحميل قائمة الباقات. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPackages();
  }, [firestore, toast]);

  const handleSave = async () => {
    if (!currentPackage || !currentPackage.name || !currentPackage.price) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة.' });
      return;
    }
    
    setIsSaving(true);

    try {
      const packageData = {
        name: currentPackage.name,
        price: Number(currentPackage.price),
        duration: currentPackage.duration || '',
        description: currentPackage.description || '',
        features: Array.isArray(currentPackage.features) ? currentPackage.features : (currentPackage.features as string || '').split('\n').map(f => f.trim()).filter(Boolean),
        isPopular: currentPackage.isPopular || false,
      };

      if (currentPackage.id) {
        const docRef = doc(firestore, 'physiotherapyPackages', currentPackage.id);
        await updateDoc(docRef, packageData);
        toast({ title: 'تم التحديث', description: 'تم تحديث الباقة بنجاح.' });
        setPackages(packages.map(p => p.id === currentPackage.id ? { ...p, ...packageData } : p));
      } else {
        const docRef = await addDoc(collection(firestore, 'physiotherapyPackages'), packageData);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة الباقة بنجاح.' });
        setPackages([...packages, { id: docRef.id, ...packageData }]);
      }
      setIsDialogOpen(false);
      setCurrentPackage(null);
    } catch (error) {
      console.error("Error saving package:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حفظ الباقة.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (packageId: string) => {
    if(!confirm('هل أنت متأكد من رغبتك في حذف هذه الباقة؟')) return;

    try {
      await deleteDoc(doc(firestore, 'physiotherapyPackages', packageId));
      toast({ title: 'تم الحذف', description: 'تم حذف الباقة بنجاح.' });
      setPackages(packages.filter(p => p.id !== packageId));
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حذف الباقة.' });
    }
  };
  
  const openDialog = (pkg: Partial<PhysiotherapyPackage> | null = null) => {
    setCurrentPackage(pkg || { name: '', price: 0, duration: '', description: '', features: [], isPopular: false });
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة باقات العلاج الطبيعي</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف باقات العلاج الطبيعي.</p>
        </div>
        <Button onClick={() => openDialog()}>
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
                <TableHead>المدة</TableHead>
                <TableHead>إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : packages.length > 0 ? (
                packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.price} ر.س</TableCell>
                    <TableCell>{pkg.duration}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openDialog(pkg)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(pkg.id!)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
                    لا توجد باقات حالياً.
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
            <DialogTitle>{currentPackage?.id ? 'تعديل باقة' : 'إضافة باقة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم الباقة</Label>
                <Input id="name" value={currentPackage?.name} onChange={(e) => setCurrentPackage({...currentPackage, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input id="price" type="number" value={currentPackage?.price} onChange={(e) => setCurrentPackage({...currentPackage, price: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">المدة (مثال: 4 جلسات)</Label>
              <Input id="duration" value={currentPackage?.duration} onChange={(e) => setCurrentPackage({...currentPackage, duration: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="description">وصف الباقة</Label>
              <Textarea id="description" value={currentPackage?.description} onChange={(e) => setCurrentPackage({...currentPackage, description: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="features">المميزات (كل ميزة في سطر)</Label>
              <Textarea id="features" value={Array.isArray(currentPackage?.features) ? currentPackage.features.join('\n') : ''} onChange={(e) => setCurrentPackage({...currentPackage, features: e.target.value.split('\n')})} />
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="isPopular" checked={currentPackage?.isPopular} onChange={(e) => setCurrentPackage({...currentPackage, isPopular: e.target.checked})} />
                <Label htmlFor="isPopular">هل هذه الباقة هي الأكثر طلباً؟</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'جارِ الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
