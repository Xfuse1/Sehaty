
'use client';

import { useState } from 'react';
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

interface LabTest {
  id: string;
  name: string;
  price: number;
}

export default function LabTestsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    toast({ title: 'جاري الحفظ...', description: 'سيتم تفعيل هذه الميزة قريباً.' });
    setTimeout(() => {
        setIsSaving(false);
        setIsDialogOpen(false);
    }, 1000);
  };
  
  const openDialog = () => {
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة التحاليل المخبرية</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف التحاليل المتاحة في التطبيق.</p>
        </div>
        <Button onClick={openDialog}>
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
                        <Button variant="outline" size="icon" onClick={openDialog}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle>إضافة تحليل جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم التحليل</Label>
                <Input id="name" />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input id="price" type="number" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">وصف التحليل</Label>
              <Textarea id="description" />
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
