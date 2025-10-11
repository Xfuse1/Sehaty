
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

interface NursingPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
}

export default function NursingPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [packages, setPackages] = useState<NursingPackage[]>([]);
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
                ) : packages.length > 0 ? (
                packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.price} ر.س</TableCell>
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
                <Input id="name" />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input id="price" type="number" />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">المدة (مثال: زيارة يومية)</Label>
              <Input id="duration" />
            </div>
            <div>
              <Label htmlFor="description">وصف الباقة</Label>
              <Textarea id="description" />
            </div>
            <div>
              <Label htmlFor="features">المميزات (كل ميزة في سطر)</Label>
              <Textarea id="features" />
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
