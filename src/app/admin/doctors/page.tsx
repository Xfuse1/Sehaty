
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
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

interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  price: number;
  image: string;
  location: string;
  experience: number;
  rating: number;
  reviews: number;
  tags: string[];
  bio: string;
}

export default function DoctorsPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Partial<Doctor> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    fetchDoctors();
  }, [firestore, toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentDoctor(prev => ({...prev, image: event.target?.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentDoctor || !currentDoctor.name || !currentDoctor.specialty || !firestore) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة.' });
      return;
    }
    
    setIsSaving(true);
    setUploadProgress(null);

    try {
      let imageUrl = currentDoctor.image || `https://picsum.photos/seed/${currentDoctor.name}/200/200`;

      if (selectedFile && storage) {
        setUploadProgress(0);
        const storageRef = ref(storage, `doctors/${Date.now()}_${selectedFile.name}`);
        const uploadTask = await uploadBytes(storageRef, selectedFile);
        setUploadProgress(50);
        imageUrl = await getDownloadURL(uploadTask.ref);
        setUploadProgress(100);
      }
      
      const doctorData: Omit<Doctor, 'id'> = {
        name: currentDoctor.name,
        specialty: currentDoctor.specialty,
        price: Number(currentDoctor.price) || 0,
        image: imageUrl,
        location: currentDoctor.location || '',
        experience: Number(currentDoctor.experience) || 0,
        rating: Number(currentDoctor.rating) || 0,
        reviews: Number(currentDoctor.reviews) || 0,
        tags: Array.isArray(currentDoctor.tags) ? currentDoctor.tags : ((currentDoctor.tags as any) || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        bio: currentDoctor.bio || '',
      };

      if (currentDoctor.id) {
        const docRef = doc(firestore, 'doctors', currentDoctor.id);
        await updateDoc(docRef, doctorData);
        toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الطبيب بنجاح.' });
        setDoctors(doctors.map(d => d.id === currentDoctor.id ? { id: d.id, ...doctorData } : d));
      } else {
        const docRef = await addDoc(collection(firestore, 'doctors'), doctorData);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة الطبيب بنجاح.' });
        setDoctors([...doctors, { id: docRef.id, ...doctorData }]);
      }
      setIsDialogOpen(false);
      setCurrentDoctor(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حفظ بيانات الطبيب.' });
    } finally {
        setIsSaving(false);
        setUploadProgress(null);
    }
  };

  const handleDelete = async (doctorId: string) => {
    if(!firestore || !confirm('هل أنت متأكد من رغبتك في حذف هذا الطبيب؟')) return;

    try {
      await deleteDoc(doc(firestore, 'doctors', doctorId));
      toast({ title: 'تم الحذف', description: 'تم حذف الطبيب بنجاح.' });
      setDoctors(doctors.filter(d => d.id !== doctorId));
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حذف الطبيب.' });
    }
  };
  
  const openDialog = (doctor: Partial<Doctor> | null = null) => {
    setCurrentDoctor(doctor || { name: '', specialty: '', price: 0, image: '', location: '', experience: 0, rating: 0, reviews: 0, tags: [], bio: '' });
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
                            src={doctor.image}
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
            <DialogTitle>{currentDoctor?.id ? 'تعديل بيانات طبيب' : 'إضافة طبيب جديد'}</DialogTitle>
            <DialogDescription>
              املأ البيانات بالأسفل لحفظ معلومات الطبيب.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>صورة الطبيب</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full border flex items-center justify-center bg-muted/50 overflow-hidden">
                    {currentDoctor?.image ? (
                        <Image src={currentDoctor.image} alt="Preview" width={96} height={96} className="rounded-full object-cover" />
                    ) : (
                        <span className="text-xs text-muted-foreground">معاينة</span>
                    )}
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="ml-2 h-4 w-4" />
                    اختر صورة
                </Button>
                <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">اسم الطبيب</Label>
                    <Input id="name" value={currentDoctor?.name} onChange={(e) => setCurrentDoctor({...currentDoctor, name: e.target.value})} />
                </div>
                <div>
                    <Label htmlFor="specialty">التخصص</Label>
                    <Input id="specialty" value={currentDoctor?.specialty} onChange={(e) => setCurrentDoctor({...currentDoctor, specialty: e.target.value})} />
                </div>
                <div>
                    <Label htmlFor="price">رسوم الكشف</Label>
                    <Input id="price" type="number" value={currentDoctor?.price || ''} onChange={(e) => setCurrentDoctor({...currentDoctor, price: Number(e.target.value)})} />
                </div>
                <div>
                    <Label htmlFor="experience">سنوات الخبرة</Label>
                    <Input id="experience" type="number" value={currentDoctor?.experience || ''} onChange={(e) => setCurrentDoctor({...currentDoctor, experience: Number(e.target.value)})} />
                </div>
                 <div>
                    <Label htmlFor="rating">التقييم (من 5)</Label>
                    <Input id="rating" type="number" step="0.1" value={currentDoctor?.rating || ''} onChange={(e) => setCurrentDoctor({...currentDoctor, rating: Number(e.target.value)})} />
                </div>
                 <div>
                    <Label htmlFor="reviews">عدد المراجعات</Label>
                    <Input id="reviews" type="number" value={currentDoctor?.reviews || ''} onChange={(e) => setCurrentDoctor({...currentDoctor, reviews: Number(e.target.value)})} />
                </div>
            </div>
            <div>
                <Label htmlFor="location">الموقع/العيادة</Label>
                <Input id="location" value={currentDoctor?.location} onChange={(e) => setCurrentDoctor({...currentDoctor, location: e.target.value})} />
            </div>
             <div>
                <Label htmlFor="tags">الوسوم (مفصولة بفاصلة)</Label>
                <Input id="tags" value={(Array.isArray(currentDoctor?.tags) ? currentDoctor.tags.join(', ') : currentDoctor?.tags) || ''} onChange={(e) => setCurrentDoctor({...currentDoctor, tags: (e.target.value as any).split(',').map((t: string) => t.trim())})} />
            </div>
            <div>
                <Label htmlFor="bio">النبذة التعريفية</Label>
                <Textarea id="bio" value={currentDoctor?.bio} onChange={(e) => setCurrentDoctor({...currentDoctor, bio: e.target.value})} />
            </div>

            {uploadProgress !== null && (
                <div className="space-y-1">
                    <Label>جارِ رفع الصورة...</Label>
                    <Progress value={uploadProgress} />
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
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

    