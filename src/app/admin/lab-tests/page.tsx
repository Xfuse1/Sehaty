
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface LabTest {
  id?: string;
  name: string;
  price: number;
  description: string;
}

export default function LabTestsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<Partial<LabTest> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchLabTests() {
    if (!firestore) return;
    try {
      setIsLoading(true);
      const testsCol = collection(firestore, 'labTests');
      const testsSnapshot = await getDocs(testsCol);
      const testsList = testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabTest));
      setLabTests(testsList);
    } catch (error) {
      console.error("Failed to fetch lab tests:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب التحاليل",
        description: "لم نتمكن من تحميل قائمة التحاليل. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLabTests();
  }, [firestore]);

  const handleSave = async () => {
    if (!currentTest || !currentTest.name || !currentTest.price || !firestore) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة.' });
      return;
    }
    
    setIsSaving(true);
    
    const testData = {
      name: currentTest.name,
      price: Number(currentTest.price),
      description: currentTest.description || '',
    };
    
    try {
        if (currentTest.id) {
            const docRef = doc(firestore, 'labTests', currentTest.id);
            await updateDoc(docRef, testData);
        } else {
            const collectionRef = collection(firestore, 'labTests');
            await addDoc(collectionRef, testData);
        }
        toast({ title: currentTest.id ? 'تم التحديث' : 'تمت الإضافة', description: 'تم حفظ التحليل بنجاح.' });
        fetchLabTests();
        setIsDialogOpen(false);
    } catch(serverError) {
        const docRef = currentTest.id ? doc(firestore, 'labTests', currentTest.id) : doc(collection(firestore, 'labTests'));
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: currentTest.id ? 'update' : 'create',
            requestResourceData: testData,
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (testId: string) => {
    if(!firestore || !confirm('هل أنت متأكد من رغبتك في حذف هذا التحليل؟')) return;

    const docRef = doc(firestore, 'labTests', testId);
    try {
        await deleteDoc(docRef);
        toast({ title: 'تم الحذف', description: 'تم حذف التحليل بنجاح.' });
        fetchLabTests();
    } catch(serverError) {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };
  
  const openDialog = (test: Partial<LabTest> | null = null) => {
    setCurrentTest(test || { name: '', price: 0, description: '' });
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة التحاليل المخبرية</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف التحاليل المتاحة في التطبيق.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="ml-2 h-5 w-5" />
          إضافة تحليل جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>قائمة التحاليل</CardTitle>
            <CardDescription>هذه هي التحاليل المتاحة في صفحة الخدمات المخبرية.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>اسم التحليل</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : labTests.length > 0 ? (
                labTests.map((test) => (
                    <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{test.price} ر.س</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openDialog(test)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => test.id && handleDelete(test.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                    لا توجد تحاليل حالياً.
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
            <DialogTitle>{currentTest?.id ? 'تعديل تحليل' : 'إضافة تحليل جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم التحليل</Label>
                <Input id="name" value={currentTest?.name || ''} onChange={(e) => setCurrentTest({...currentTest, name: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input id="price" type="number" value={currentTest?.price || ''} onChange={(e) => setCurrentTest({...currentTest, price: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <Label htmlFor="description">وصف التحليل</Label>
              <Textarea id="description" value={currentTest?.description || ''} onChange={(e) => setCurrentTest({...currentTest, description: e.target.value})} />
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
