
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
import { Loader2, PlusCircle, Trash2, Edit, Upload } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const doctorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "اسم الطبيب مطلوب." }),
  specialty: z.string().min(2, { message: "التخصص مطلوب." }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "السعر يجب أن يكون رقمًا موجبًا." })
  ),
  image: z.string().optional(),
  location: z.string().min(1, { message: "الموقع مطلوب." }),
  experience: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive({ message: "الخبرة يجب أن تكون رقمًا موجبًا." })
  ),
  rating: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(1).max(5, { message: "التقييم يجب أن يكون بين 1 و 5." })
  ),
  reviews: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(0, { message: "عدد المراجعات لا يمكن أن يكون سالبًا." })
  ),
  tags: z.string().optional(),
  bio: z.string().min(10, { message: "النبذة التعريفية يجب أن تكون 10 أحرف على الأقل." }),
});

type Doctor = z.infer<typeof doctorSchema>;

export default function DoctorsPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<Doctor>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialty: '',
      price: 0,
      image: '',
      location: '',
      experience: 0,
      rating: 0,
      reviews: 0,
      tags: '',
      bio: '',
    },
  });

  async function fetchDoctors() {
    if (!firestore) return;
    try {
      setIsLoading(true);
      const doctorsCol = collection(firestore, 'doctors');
      const doctorsSnapshot = await getDocs(doctorsCol);
      const doctorsList = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
      setDoctors(doctorsList);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast({
        variant: "destructive",
        title: "خطأ في جلب الأطباء",
        description: "لم نتمكن من تحميل قائمة الأطباء. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, [firestore]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: Doctor) => {
    if (!firestore) return;
    
    setIsDialogOpen(false);

    try {
      let imageUrl = data.image || previewImage || `https://picsum.photos/seed/${data.name}/200/200`;

      if (selectedFile && storage) {
        toast({ title: 'جارِ رفع الصورة...' });
        setUploadProgress(0);
        const storageRef = ref(storage, `doctors/${Date.now()}_${selectedFile.name}`);
        const uploadTask = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(uploadTask.ref);
        toast({ title: 'اكتمل رفع الصورة' });
      }
      
      const doctorData = {
        ...data,
        image: imageUrl,
        tags: (data.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      };
      
      const { id, ...dataToSave } = doctorData;

      if (id) {
        const docRef = doc(firestore, 'doctors', id);
        updateDocumentNonBlocking(docRef, dataToSave);
        toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الطبيب بنجاح.' });
      } else {
        const newDocRef = doc(collection(firestore, 'doctors'));
        setDocumentNonBlocking(newDocRef, dataToSave);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة الطبيب بنجاح.' });
      }
      
      fetchDoctors();
      
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حفظ بيانات الطبيب.' });
    } finally {
        setUploadProgress(null);
        form.reset();
    }
  };


  const handleDelete = async (doctorId: string) => {
    if(!firestore || !confirm('هل أنت متأكد من رغبتك في حذف هذا الطبيب؟')) return;

    try {
      await deleteDoc(doc(firestore, 'doctors', doctorId));
      toast({ title: 'تم الحذف', description: 'تم حذف الطبيب بنجاح.' });
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حذف الطبيب.' });
    }
  };
  
  const openDialog = (doctor: Partial<Doctor> | null = null) => {
    if (doctor) {
        form.reset({
            ...doctor,
            tags: Array.isArray(doctor.tags) ? doctor.tags.join(', ') : '',
        });
        setPreviewImage(doctor.image || null);
    } else {
        form.reset({
            name: '', specialty: '', price: 0, image: '', location: '',
            experience: 0, rating: 0, reviews: 0, tags: '', bio: ''
        });
        setPreviewImage(null);
    }
    setSelectedFile(null);
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة الأطباء</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف بيانات الأطباء.</p>
        </div>
        <Button onClick={() => openDialog()}>
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
                        <Button variant="outline" size="icon" onClick={() => openDialog(doctor)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => doctor.id && handleDelete(doctor.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                    لا يوجد أطباء حالياً.
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
            <DialogTitle>{form.getValues('id') ? 'تعديل بيانات طبيب' : 'إضافة طبيب جديد'}</DialogTitle>
            <DialogDescription>
              املأ البيانات بالأسفل لحفظ معلومات الطبيب.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>صورة الطبيب</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full border flex items-center justify-center bg-muted/50 overflow-hidden">
                      {previewImage ? (
                          <Image src={previewImage} alt="Preview" width={96} height={96} className="rounded-full object-cover" />
                      ) : (
                          <span className="text-xs text-muted-foreground">معاينة</span>
                      )}
                  </div>
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="ml-2 h-4 w-4" />
                      اختر صورة
                  </Button>
                  <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                          <FormLabel>اسم الطبيب</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="specialty" render={({ field }) => (
                      <FormItem>
                          <FormLabel>التخصص</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                          <FormLabel>رسوم الكشف</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="experience" render={({ field }) => (
                      <FormItem>
                          <FormLabel>سنوات الخبرة</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="rating" render={({ field }) => (
                      <FormItem>
                          <FormLabel>التقييم (من 5)</FormLabel>
                          <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="reviews" render={({ field }) => (
                      <FormItem>
                          <FormLabel>عدد المراجعات</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                      <FormLabel>الموقع/العيادة</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem>
                      <FormLabel>الوسوم (مفصولة بفاصلة)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                      <FormLabel>النبذة التعريفية</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />

              {uploadProgress !== null && (
                  <div className="space-y-1">
                      <Label>جارِ رفع الصورة...</Label>
                      <Progress value={uploadProgress} />
                  </div>
              )}
               <DialogFooter className="mt-4 pt-4 border-t">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">إلغاء</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                        {form.formState.isSubmitting ? 'جارِ الحفظ...' : 'حفظ'}
                    </Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
