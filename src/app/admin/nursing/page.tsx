
'use client';

import { useState, useEffect } from 'react';
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface NursingPackage {
  id: string;
  PackageName: string;
  Price: number;
  Duration: string;
  Description?: string;
  Features?: string;
  createdAt?: any;
}

interface FormData {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string;
}

const COLLECTION_NAME = 'nursing_care';

export default function NursingPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    duration: '',
    description: '',
    features: ''
  });
  
  const firestore = useFirestore();
  const packagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, COLLECTION_NAME);
  }, [firestore]);

  const { data: packages = [], isLoading } = useCollection<NursingPackage>(packagesQuery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      description: '',
      features: ''
    });
  };

  const handleSave = async () => {
    if (!firestore) return;
    
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.name || !formData.price || !formData.duration) {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة'
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
        createdAt: serverTimestamp()
      };

      await addDoc(collection(firestore, COLLECTION_NAME), packageData);

      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تمت إضافة الباقة بنجاح'
      });

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الباقة'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const openDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة باقات الرعاية التمريضية</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف باقات الرعاية التمريضية.</p>
        </div>
        <Button onClick={openDialog}>
          <PlusCircle className="ml-2 h-5 w-5" />
          إضافة باقة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>قائمة الباقات</CardTitle>
            <CardDescription>هذه هي الباقات المتاحة في صفحة الرعاية التمريضية.</CardDescription>
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
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : packages && packages.length > 0 ? (
                packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.PackageName}</TableCell>
                    <TableCell>{pkg.Price} ر.س</TableCell>
                    <TableCell>{pkg.Duration}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={openDialog}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
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
            <DialogTitle>إضافة باقة جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم الباقة</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="مثال: باقة الرعاية اليومية"
                />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input 
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="أدخل السعر بالريال"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">المدة (مثال: زيارة يومية)</Label>
              <Input 
                id="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="مثال: زيارة يومية، زيارة أسبوعية"
              />
            </div>
            <div>
              <Label htmlFor="description">وصف الباقة</Label>
              <Textarea 
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="أدخل وصفاً مفصلاً للباقة"
              />
            </div>
            <div>
              <Label htmlFor="features">المميزات (كل ميزة في سطر)</Label>
              <Textarea 
                id="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder="أدخل مميزات الباقة - ميزة واحدة في كل سطر"
              />
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
