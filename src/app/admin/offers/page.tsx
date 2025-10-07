
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getOffers } from '@/ai/flows/offers-flow';


interface Offer {
  id?: string;
  name: string;
  oldPrice: string;
  newPrice: string;
  imgSrc: string;
  imgHint: string;
  discount: string;
}

export default function OffersPage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Partial<Offer> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      try {
        setIsLoading(true);
        const offersData = await getOffers();
        setOffers(offersData);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
        toast({
          variant: "destructive",
          title: "خطأ في جلب العروض",
          description: "لم نتمكن من تحميل قائمة العروض. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchOffers();
  }, [toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentOffer(prev => ({...prev, imgSrc: event.target?.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentOffer || !currentOffer.name || !currentOffer.newPrice) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة.' });
      return;
    }
    
    setIsSaving(true);
    setUploadProgress(null);

    try {
      let imageUrl = currentOffer.imgSrc || 'https://placehold.co/400x400/E2E8F0/A0AEC0?text=Offer';

      if (selectedFile) {
        setUploadProgress(0); // Start progress
        const storageRef = ref(storage, `offers/${Date.now()}_${selectedFile.name}`);
        const uploadTask = await uploadBytes(storageRef, selectedFile);
        
        setUploadProgress(50);
        
        imageUrl = await getDownloadURL(uploadTask.ref);
        setUploadProgress(100);
      }
      
      const offerData = {
        name: currentOffer.name,
        oldPrice: currentOffer.oldPrice || '',
        newPrice: currentOffer.newPrice,
        imgSrc: imageUrl,
        imgHint: currentOffer.imgHint || 'product image',
        discount: currentOffer.discount || '',
      };

      let newOfferId = '';
      if (currentOffer.id) {
        const offerRef = doc(firestore, 'offers', currentOffer.id);
        await updateDoc(offerRef, offerData);
        toast({ title: 'تم التحديث', description: 'تم تحديث العرض بنجاح.' });
        setOffers(offers.map(o => o.id === currentOffer.id ? { ...o, ...offerData } : o));
      } else {
        const docRef = await addDoc(collection(firestore, 'offers'), offerData);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة العرض بنجاح.' });
        newOfferId = docRef.id;
        setOffers([...offers, { id: newOfferId, ...offerData }]);
      }
      setIsDialogOpen(false);
      setCurrentOffer(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error saving offer:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حفظ العرض.' });
    } finally {
        setIsSaving(false);
        setUploadProgress(null);
    }
  };

  const handleDelete = async (offerId: string) => {
    if(!confirm('هل أنت متأكد من رغبتك في حذف هذا العرض؟')) return;

    try {
      await deleteDoc(doc(firestore, 'offers', offerId));
      toast({ title: 'تم الحذف', description: 'تم حذف العرض بنجاح.' });
      setOffers(offers.filter(o => o.id !== offerId));
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حذف العرض.' });
    }
  };
  
  const openDialog = (offer: Partial<Offer> | null = null) => {
    setCurrentOffer(offer || { name: '', oldPrice: '', newPrice: '', imgSrc: '', imgHint: '', discount: '' });
    setSelectedFile(null);
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">إدارة العروض</h1>
            <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف عروض الصيدليات.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="ml-2 h-5 w-5" />
          إضافة عرض جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>قائمة العروض الحالية</CardTitle>
            <CardDescription>هذه هي العروض التي تظهر في قسم "أقوى عروض الصيدليات" بالصفحة الرئيسية.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>صورة</TableHead>
                <TableHead>اسم المنتج</TableHead>
                <TableHead>السعر الجديد</TableHead>
                <TableHead>السعر القديم</TableHead>
                <TableHead>الخصم</TableHead>
                <TableHead>إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                </TableRow>
                ) : offers && offers.length > 0 ? (
                offers.map((offer) => (
                    <TableRow key={offer.id}>
                    <TableCell>
                        <Image
                            src={offer.imgSrc}
                            alt={offer.name}
                            width={50}
                            height={50}
                            className="rounded-md object-contain"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell>{offer.newPrice} ر.س</TableCell>
                    <TableCell className="line-through text-muted-foreground">{offer.oldPrice} ر.س</TableCell>
                    <TableCell>{offer.discount}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openDialog(offer)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(offer.id!)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">
                    لا توجد عروض حالياً.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
      </Card>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentOffer?.id ? 'تعديل عرض' : 'إضافة عرض جديد'}</DialogTitle>
            <DialogDescription>
              املأ البيانات بالأسفل لحفظ العرض.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>صورة المنتج</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted/50">
                    {currentOffer?.imgSrc ? (
                        <Image src={currentOffer.imgSrc} alt="Preview" width={96} height={96} className="rounded-md object-contain" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                اسم المنتج
              </Label>
              <Input id="name" value={currentOffer?.name} onChange={(e) => setCurrentOffer({...currentOffer, name: e.target.value})} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPrice" className="text-right">
                السعر الجديد
              </Label>
              <Input id="newPrice" value={currentOffer?.newPrice} onChange={(e) => setCurrentOffer({...currentOffer, newPrice: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="oldPrice" className="text-right">
                السعر القديم
              </Label>
              <Input id="oldPrice" value={currentOffer?.oldPrice} onChange={(e) => setCurrentOffer({...currentOffer, oldPrice: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discount" className="text-right">
                الخصم (مثال: 20%)
              </Label>
              <Input id="discount" value={currentOffer?.discount} onChange={(e) => setCurrentOffer({...currentOffer, discount: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imgHint" className="text-right">
                وصف الصورة (AI)
              </Label>
              <Input id="imgHint" value={currentOffer?.imgHint} onChange={(e) => setCurrentOffer({...currentOffer, imgHint: e.target.value})} className="col-span-3" />
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

    