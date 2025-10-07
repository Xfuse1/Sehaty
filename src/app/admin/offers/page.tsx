
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Partial<Offer> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const offersQuery = useMemoFirebase(() => collection(firestore, 'offers'), [firestore]);
  const { data: offers, isLoading } = useCollection<Omit<Offer, 'id'>>(offersQuery);
  
  const handleSave = async () => {
    if (!currentOffer || !currentOffer.name || !currentOffer.newPrice) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة.' });
      return;
    }
    
    setIsSaving(true);
    try {
      const offerData = {
        name: currentOffer.name,
        oldPrice: currentOffer.oldPrice || '',
        newPrice: currentOffer.newPrice,
        imgSrc: currentOffer.imgSrc || 'https://placehold.co/400x400/E2E8F0/A0AEC0?text=Offer',
        imgHint: currentOffer.imgHint || 'product image',
        discount: currentOffer.discount || '',
      };

      if (currentOffer.id) {
        // Update existing offer
        const offerRef = doc(firestore, 'offers', currentOffer.id);
        await updateDoc(offerRef, offerData);
        toast({ title: 'تم التحديث', description: 'تم تحديث العرض بنجاح.' });
      } else {
        // Add new offer
        await addDoc(collection(firestore, 'offers'), offerData);
        toast({ title: 'تمت الإضافة', description: 'تمت إضافة العرض بنجاح.' });
      }
      setIsDialogOpen(false);
      setCurrentOffer(null);
    } catch (error) {
      console.error("Error saving offer:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حفظ العرض.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if(!confirm('هل أنت متأكد من رغبتك في حذف هذا العرض؟')) return;

    try {
      await deleteDoc(doc(firestore, 'offers', offerId));
      toast({ title: 'تم الحذف', description: 'تم حذف العرض بنجاح.' });
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حذف العرض.' });
    }
  };
  
  const openDialog = (offer: Partial<Offer> | null = null) => {
    setCurrentOffer(offer || { name: '', oldPrice: '', newPrice: '', imgSrc: '', imgHint: '', discount: '' });
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
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(offer.id)}><Trash2 className="h-4 w-4" /></Button>
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
              <Label htmlFor="imgSrc" className="text-right">
                رابط الصورة
              </Label>
              <Input id="imgSrc" value={currentOffer?.imgSrc} onChange={(e) => setCurrentOffer({...currentOffer, imgSrc: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imgHint" className="text-right">
                وصف الصورة (AI)
              </Label>
              <Input id="imgHint" value={currentOffer?.imgHint} onChange={(e) => setCurrentOffer({...currentOffer, imgHint: e.target.value})} className="col-span-3" />
            </div>
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
