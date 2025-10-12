
'use client';

import { ChangeEvent, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { saveToAirtable } from '@/lib/airtable';
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
import { useFirestore, useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type Doctor = {
  id?: string;
  name: string;
  specialty: string;
  price: number;
  experience?: number;
  overview?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  location?: string;
};

export default function DoctorsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading } = useFirebase();

  const doctorsQuery = useMemoFirebase(() => {
    return collection(firestore, 'doctors');
  }, [firestore]);

  const { data: doctors = [], isLoading } = useCollection<Doctor>(doctorsQuery);
  const doctorsList = doctors ?? [];

  const createEmptyForm = () => ({
    name: '',
    specialty: '',
    price: '',
    experience: '',
    overview: '',
    image: '',
  });

  const [formValues, setFormValues] = useState(createEmptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

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
    const trimmedSpecialty = formValues.specialty.trim();
    const priceValue = formValues.price.trim();
    const experienceValue = formValues.experience.trim();
    const overviewValue = formValues.overview.trim();
    const imageValue = formValues.image.trim();

    if (!trimmedName || !trimmedSpecialty || !priceValue) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Name, specialty, and consultation fee are required.',
      });
      return;
    }

    const parsedPrice = Number(priceValue);
    const parsedExperience = experienceValue ? Number(experienceValue) : 0;

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid consultation fee',
        description: 'Please enter a valid positive number for the consultation fee.',
      });
      return;
    }

    if (experienceValue && (Number.isNaN(parsedExperience) || parsedExperience < 0)) {
      toast({
        variant: 'destructive',
        title: 'Invalid experience value',
        description: 'Experience must be a positive number.',
      });
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = '/images/default-avatar.png';
      
      // Upload image to Cloudinary if selected
      if (selectedFile) {
        finalImageUrl = await uploadToCloudinary(selectedFile);
      }

      // Add doctor to Firestore
      const docRef = await addDoc(collection(firestore, 'doctors'), {
        name: trimmedName,
        specialty: trimmedSpecialty,
        price: parsedPrice,
        experience: parsedExperience,
        overview: overviewValue,
        image: finalImageUrl,
        rating: 0,
        reviews: 0,
        location: '',
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
      });

      // Save to Airtable if image was uploaded
      if (finalImageUrl !== '/images/default-avatar.png') {
        await saveToAirtable(docRef.id, trimmedName, finalImageUrl);
      }

      toast({
        title: 'Doctor saved',
        description: 'The doctor has been added successfully.',
      });

      setFormValues(createEmptyForm());
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save doctor document', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save data',
        description: 'Please try again in a moment.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect if not logged in
  if (!isUserLoading && !user) {
    // You can also use Next.js redirect here if preferred
    window.location.href = '/login';
    return null;
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
                ) : doctorsList.length > 0 ? (
                doctorsList.map((doctor) => {
                    const displayImage = doctor.image && doctor.image.trim() !== '' ? doctor.image : '/images/default-avatar.png';
                    const altText = doctor.name && doctor.name.trim() !== '' ? `صورة ${doctor.name}` : 'صورة الطبيب';
                    return (
                    <TableRow key={doctor.id}>
                    <TableCell>
                        <Image
                            src={displayImage}
                            alt={altText}
                            width={50}
                            height={50}
                            className="rounded-full object-cover"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell>{doctor.price}ج.م</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                    );
                })
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
                      <Input
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                      />
                  </div>
                  <div>
                      <Label>التخصص</Label>
                      <Input
                        name="specialty"
                        value={formValues.specialty}
                        onChange={handleInputChange}
                      />
                  </div>
                   <div>
                      <Label>رسوم الكشف</Label>
                      <Input
                        type="number"
                        name="price"
                        min="0"
                        value={formValues.price}
                        onChange={handleInputChange}
                      />
                  </div>
                  <div>
                      <Label>سنوات الخبرة</Label>
                      <Input
                        type="number"
                        name="experience"
                        min="0"
                        value={formValues.experience}
                        onChange={handleInputChange}
                      />
                  </div>
              </div>
              <div>
                  <Label>النبذة التعريفية</Label>
                  <Textarea
                    name="overview"
                    value={formValues.overview}
                    onChange={handleInputChange}
                  />
              </div>
              <div>
                  <Label>صورة الطبيب</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          // Preview the image
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormValues(prev => ({
                              ...prev,
                              image: reader.result as string
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      اختر صورة
                    </Button>
                    {formValues.image && (
                      <div className="relative w-12 h-12">
                        <Image
                          src={formValues.image}
                          alt="Doctor preview"
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
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
