
'use client';

import { ChangeEvent, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlusCircle, Trash2, Edit, Globe, MessageCircle, MapPin, Award, Languages } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useMemoFirebase, useFirebase } from '@/firebase';
import { useCollection } from "@/firebase/firestore/use-collection";
import { useLanguage } from '@/contexts/language-context';
import { translations } from '@/lib/translations';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { addDoc, collection, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Doctor = {
  id?: string;
  name: string;
  name_en?: string;
  specialty: string;
  specialty_en?: string;
  price: number;
  experience?: number;
  overview?: string;
  overview_en?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  location?: string;
  location_en?: string;
  whatsapp?: string;
  certifications?: string[];
  gender?: 'male' | 'female';
  education?: string;
  workingHours?: string;
  languages?: string;
  tags?: string[];
  isVerified?: boolean;
};

export default function DoctorsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAuthLoading, user } = useAdminAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const handleDelete = async (doctor: Doctor) => {
    setDoctorToDelete(doctor);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormValues({
      name: doctor.name || '',
      name_en: doctor.name_en || '',
      specialty: doctor.specialty || '',
      specialty_en: doctor.specialty_en || '',
      price: doctor.price?.toString() || '',
      experience: doctor.experience?.toString() || '',
      overview: doctor.overview || '',
      overview_en: doctor.overview_en || '',
      location: doctor.location || '',
      location_en: doctor.location_en || '',
      whatsapp: doctor.whatsapp || '',
      certifications: doctor.certifications?.join(', ') || '',
      image: doctor.image || '',
      gender: doctor.gender || 'male',
      education: doctor.education || '',
      workingHours: doctor.workingHours || '',
      languages: doctor.languages || '',
      tags: doctor.tags?.join(', ') || '',
      isVerified: doctor.isVerified || false,
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete?.id) return;

    setIsDeleting(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(firestore, 'doctors', doctorToDelete.id));

      toast({
        title: t.admin.dashboard.actions.successDelete,
        description: t.admin.dashboard.actions.successDelete,
      });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        variant: "destructive",
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorDeleting,
      });
    } finally {
      setIsDeleting(false);
      setDoctorToDelete(null);
    }
  };

  const doctorsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'doctors');
  }, [firestore, isAdmin]);

  const { data: doctors = [], isLoading } = useCollection<Doctor>(doctorsQuery);
  const doctorsList = doctors ?? [];

  const createEmptyForm = () => ({
    name: '',
    name_en: '',
    specialty: '',
    specialty_en: '',
    price: '',
    experience: '',
    overview: '',
    overview_en: '',
    location: '',
    location_en: '',
    whatsapp: '',
    certifications: '',
    image: '',
    gender: 'male',
    education: '',
    workingHours: '',
    languages: '',
    tags: '',
    isVerified: false,
  });

  const [formValues, setFormValues] = useState(createEmptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openDialog = () => {
    setEditingDoctor(null);
    setFormValues(createEmptyForm());
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target as any;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (event.target as any).checked : value,
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

    if (!trimmedName || !trimmedSpecialty || !formValues.name_en.trim() || !formValues.specialty_en.trim() || !priceValue) {
      toast({
        variant: 'destructive',
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorFields,
      });
      return;
    }

    const parsedPrice = Number(priceValue);
    const parsedExperience = experienceValue ? Number(experienceValue) : 0;

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        variant: 'destructive',
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorSaving, // Or more specific if added
      });
      return;
    }

    if (experienceValue && (Number.isNaN(parsedExperience) || parsedExperience < 0)) {
      toast({
        variant: 'destructive',
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorSaving,
      });
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = selectedFile ? await uploadToCloudinary(selectedFile) : (editingDoctor?.image || '/default-avatar.png');

      if (editingDoctor?.id) {
        // Update existing doctor
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(firestore, 'doctors', editingDoctor.id), {
          name: trimmedName,
          name_en: formValues.name_en.trim(),
          specialty: trimmedSpecialty,
          specialty_en: formValues.specialty_en.trim(),
          price: parsedPrice,
          experience: parsedExperience,
          overview: overviewValue,
          overview_en: formValues.overview_en.trim(),
          location: formValues.location.trim(),
          location_en: formValues.location_en.trim(),
          whatsapp: formValues.whatsapp.trim(),
          certifications: formValues.certifications.split(',').map(s => s.trim()).filter(s => s !== ''),
          image: finalImageUrl,
          gender: formValues.gender,
          education: formValues.education.trim(),
          workingHours: formValues.workingHours.trim(),
          languages: formValues.languages.trim(),
          tags: formValues.tags.split(',').map(s => s.trim()).filter(s => s !== ''),
          isVerified: !!formValues.isVerified,
          updatedAt: serverTimestamp(),
          updatedBy: user?.uid,
        });

        toast({
          title: t.admin.dashboard.doctorForm.update,
          description: t.admin.dashboard.doctorForm.successUpdate,
        });
      } else {
        // Add new doctor
        const docRef = await addDoc(collection(firestore, 'doctors'), {
          name: trimmedName,
          name_en: formValues.name_en.trim(),
          specialty: trimmedSpecialty,
          specialty_en: formValues.specialty_en.trim(),
          price: parsedPrice,
          experience: parsedExperience,
          overview: overviewValue,
          overview_en: formValues.overview_en.trim(),
          location: formValues.location.trim(),
          location_en: formValues.location_en.trim(),
          whatsapp: formValues.whatsapp.trim(),
          certifications: formValues.certifications.split(',').map(s => s.trim()).filter(s => s !== ''),
          image: finalImageUrl,
          gender: formValues.gender,
          education: formValues.education.trim(),
          workingHours: formValues.workingHours.trim(),
          languages: formValues.languages.trim(),
          tags: formValues.tags.split(',').map(s => s.trim()).filter(s => s !== ''),
          isVerified: !!formValues.isVerified,
          rating: 4.5, // Default rating for new doctors
          reviews: Math.floor(Math.random() * 50) + 10, // Mock reviews
          createdAt: serverTimestamp(),
          createdBy: user?.uid,
        });

        // Save to Airtable if image was uploaded
        if (finalImageUrl !== '/default-avatar.png') {
          await saveToAirtable(docRef.id, trimmedName, finalImageUrl);
        }

        toast({
          title: t.admin.dashboard.doctorForm.save,
          description: t.admin.dashboard.doctorForm.successAdd,
        });
      }

      setFormValues(createEmptyForm());
      setEditingDoctor(null);
      setSelectedFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save doctor document', error);
      toast({
        variant: 'destructive',
        title: t.admin.dashboard.actions.error,
        description: t.admin.dashboard.actions.errorSaving,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary tracking-tight">{t.admin.dashboard.doctorsList.title}</h1>
          <p className="text-muted-foreground mt-1 font-medium">{t.admin.dashboard.doctorsList.subtitle}</p>
        </div>
        <Button onClick={openDialog} className="whitespace-nowrap h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <PlusCircle className="ml-2 h-5 w-5" />
          {t.admin.dashboard.doctorsList.addBtn}
        </Button>
      </div>

      <Card className="shadow-xl border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <CardTitle className="text-xl font-bold">{t.admin.dashboard.doctorsList.listTitle}</CardTitle>
          <CardDescription className="font-medium">{t.admin.dashboard.doctorsList.listDesc}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.doctorsList.table.image}</TableHead>
                    <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.doctorsList.table.name}</TableHead>
                    <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.doctorsList.table.specialty}</TableHead>
                    <TableHead className="text-right font-bold py-4 whitespace-nowrap">{t.admin.dashboard.doctorsList.table.price}</TableHead>
                    <TableHead className="text-center font-bold py-4 whitespace-nowrap">{t.admin.dashboard.doctorsList.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary/60" />
                      </TableCell>
                    </TableRow>
                  ) : doctorsList.length > 0 ? (
                    doctorsList.map((doctor) => {
                      const displayImage = doctor.image && doctor.image.trim() !== '' ? doctor.image : '/images/default-avatar.png';
                      const altText = language === 'ar' ? `صورة ${doctor.name}` : `${doctor.name}'s image`;
                      return (
                        <TableRow key={doctor.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="align-middle">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm">
                              <Image
                                src={displayImage}
                                alt={altText}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-700 dark:text-slate-300 align-middle">{doctor.name}</TableCell>
                          <TableCell className="font-medium align-middle">{doctor.specialty}</TableCell>
                          <TableCell className="font-black text-primary align-middle whitespace-nowrap">
                            {doctor.price} {t.admin.dashboard.doctorsList.table.currency}
                          </TableCell>
                          <TableCell className="align-middle">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 border-slate-200 dark:border-slate-800 hover:bg-primary/10 hover:text-primary transition-all"
                                onClick={() => handleEdit(doctor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-9 w-9 shadow-sm hover:shadow-destructive/20 transition-all"
                                onClick={() => handleDelete(doctor)}
                                disabled={isDeleting}
                              >
                                {isDeleting && doctorToDelete?.id === doctor.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                        {t.admin.dashboard.doctorsList.table.noData}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!doctorToDelete} onOpenChange={() => setDoctorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.dashboard.doctorsList.delete.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.dashboard.doctorsList.delete.desc} ({doctorToDelete?.name})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.dashboard.doctorsList.delete.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {t.admin.dashboard.doctorsList.delete.deleting}
                </>
              ) : (
                t.admin.dashboard.doctorsList.delete.confirm
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? t.admin.dashboard.doctorForm.editTitle : t.admin.dashboard.doctorForm.addTitle}</DialogTitle>
            <div className="flex items-center gap-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  name="isVerified"
                  checked={!!formValues.isVerified}
                  onChange={(e) => setFormValues(prev => ({ ...prev, isVerified: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <Label htmlFor="isVerified" className="text-xs font-bold text-primary">{t.admin.dashboard.doctorForm.isVerified}</Label>
              </div>
            </div>
            <DialogDescription>
              {t.admin.dashboard.doctorForm.formDesc}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="ar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-2xl">
              <TabsTrigger value="ar" className="gap-2 text-base font-bold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Globe className="w-4 h-4" /> العربية
              </TabsTrigger>
              <TabsTrigger value="en" className="gap-2 text-base font-bold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Languages className="w-4 h-4" /> English
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <TabsContent value="ar" className="space-y-4 mt-0 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{translations.ar.admin.dashboard.doctorForm.nameAr}</Label>
                    <Input
                      name="name"
                      placeholder="د. أحمد علي"
                      value={formValues.name}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{translations.ar.admin.dashboard.doctorForm.specialtyAr}</Label>
                    <Input
                      name="specialty"
                      placeholder="استشاري جراحة"
                      value={formValues.specialty}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{translations.ar.admin.dashboard.doctorForm.overviewAr}</Label>
                  <Textarea
                    name="overview"
                    placeholder="اكتب نبذة عن الطبيب وخبراته..."
                    value={formValues.overview}
                    onChange={handleInputChange}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold flex items-center gap-2"> <MapPin className="w-4 h-4 text-primary" /> {translations.ar.admin.dashboard.doctorForm.locationAr}</Label>
                  <Input
                    name="location"
                    placeholder="الرياض، حي العليا"
                    value={formValues.location}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4 mt-0 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{translations.en.admin.dashboard.doctorForm.nameEn}</Label>
                    <Input
                      name="name_en"
                      placeholder="Dr. Ahmed Ali"
                      value={formValues.name_en}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{translations.en.admin.dashboard.doctorForm.specialtyEn}</Label>
                    <Input
                      name="specialty_en"
                      placeholder="Surgical Consultant"
                      value={formValues.specialty_en}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{translations.en.admin.dashboard.doctorForm.overviewEn}</Label>
                  <Textarea
                    name="overview_en"
                    placeholder="Write a brief about the doctor's expertise..."
                    value={formValues.overview_en}
                    onChange={handleInputChange}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold flex items-center gap-2"> <Globe className="w-4 h-4 text-blue-500" /> {translations.en.admin.dashboard.doctorForm.locationEn}</Label>
                  <Input
                    name="location_en"
                    placeholder="Riyadh, Olaya District"
                    value={formValues.location_en}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>
              </TabsContent>

              <div className="border-t pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.price}</Label>
                    <Input
                      type="number"
                      name="price"
                      min="0"
                      value={formValues.price}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.experience}</Label>
                    <Input
                      type="number"
                      name="experience"
                      min="0"
                      value={formValues.experience}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2"><MessageCircle className="w-4 h-4 text-green-500" /> {t.admin.dashboard.doctorForm.whatsapp}</Label>
                    <Input
                      name="whatsapp"
                      placeholder="966500000000"
                      value={formValues.whatsapp}
                      onChange={handleInputChange}
                      className="rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> {t.admin.dashboard.doctorForm.certifications}</Label>
                    <Input
                      name="certifications"
                      placeholder="Master, PhD, Fellowship"
                      value={formValues.certifications}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.gender}</Label>
                    <select
                      name="gender"
                      value={formValues.gender}
                      onChange={(e) => setFormValues(prev => ({ ...prev, gender: e.target.value as any }))}
                      className="w-full h-10 px-3 rounded-xl border bg-background"
                    >
                      <option value="male">{t.admin.dashboard.doctorForm.male}</option>
                      <option value="female">{t.admin.dashboard.doctorForm.female}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.languages}</Label>
                    <Input
                      name="languages"
                      placeholder="Arabic, English"
                      value={formValues.languages}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.workingHours}</Label>
                    <Input
                      name="workingHours"
                      placeholder="9 AM - 5 PM"
                      value={formValues.workingHours}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.tags}</Label>
                    <Input
                      name="tags"
                      placeholder="Home visit, Online"
                      value={formValues.tags}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.education}</Label>
                  <Textarea
                    name="education"
                    placeholder="Bachelor of Medicine, Harvard University..."
                    value={formValues.education}
                    onChange={handleInputChange}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">{t.admin.dashboard.doctorForm.image}</Label>
                  <div className="flex gap-4 items-center p-4 bg-muted/40 rounded-2xl border border-dashed border-muted-foreground/20">
                    <div className="relative w-20 h-20 rounded-2xl overflow-evenly bg-background border-2 border-primary/20 shadow-inner group overflow-hidden">
                      <Image
                        src={formValues.image || '/default-avatar.png'}
                        alt={language === 'ar' ? 'معاينة الصورة' : 'Image preview'}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
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
                        size="sm"
                        className="w-full h-10 rounded-xl bg-white dark:bg-slate-800 border-primary/20 hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formValues.image ? t.admin.dashboard.doctorForm.changeImage : t.admin.dashboard.doctorForm.selectImage}
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">{t.admin.dashboard.doctorForm.imageHint}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
          <DialogFooter className="mt-4 pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline">{t.admin.dashboard.doctorForm.cancel}</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? t.admin.dashboard.doctorForm.saving : (editingDoctor ? t.admin.dashboard.doctorForm.update : t.admin.dashboard.doctorForm.save)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
