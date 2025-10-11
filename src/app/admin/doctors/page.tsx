
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
  DialogClose
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
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  price: number;
  image: string;
};

export default function DoctorsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openDialog = () => {
    setIsDialogOpen(true);
  }

  const handleSave = async () => {
    setIsSaving(true);
    toast({ title: 'جاري الحفظ...', description: 'سيتم تفعيل هذه الميزة قريباً.' });
    setTimeout(() => {
        setIsSaving(false);
        setIsDialogOpen(false);
    }, 1000);
  }
  
  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة الأطباء</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف بيانات الأطباء.</p>
        </div>
        <Button onClick={openDialog}>
          <PlusCircle className="ml-2 h-5 w-5" />
          إضافة طبيب جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>قائمة الأطباء</CardTitle>
            <CardDescription>هذه هي قائمة الأطباء المتاحين في التطبيق.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>صورة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>التخصص</TableHead>
                <TableHead>رسوم الكشف</TableHead>
                <TableHead>إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : doctors.length > 0 ? (
                doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                    <TableCell>
                        <Image
                            src={doctor.image || '/default-avatar.png'}
                            alt={doctor.name}
                            width={50}
                            height={50}
                            className="rounded-full object-cover"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell>{doctor.price} ر.س</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                    لا يوجد أطباء حالياً. يمكنك إضافة طبيب جديد.
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
            <DialogTitle>إضافة طبيب جديد</DialogTitle>
            <DialogDescription>
              املأ البيانات بالأسفل لحفظ معلومات الطبيب.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label>اسم الطبيب</Label>
                      <Input />
                  </div>
                  <div>
                      <Label>التخصص</Label>
                      <Input />
                  </div>
                   <div>
                      <Label>رسوم الكشف</Label>
                      <Input type="number" />
                  </div>
                  <div>
                      <Label>سنوات الخبرة</Label>
                      <Input type="number" />
                  </div>
              </div>
              <div>
                  <Label>النبذة التعريفية</Label>
                  <Textarea />
              </div>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t">
              <DialogClose asChild>
                  <Button type="button" variant="outline">إلغاء</Button>
              </DialogClose>
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
