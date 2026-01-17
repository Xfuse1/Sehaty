"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, query, getDocs, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Upload, Lock, Trash2, User, Mail, Phone, Calendar } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useLanguage } from '@/contexts/language-context';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const { language } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [formData, setFormData] = useState({
        displayName: '',
        phoneNumber: '',
        photoURL: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [deletePassword, setDeletePassword] = useState('');
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const isRTL = language === 'ar';

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            if (!isUserLoading && !user) {
                router.push('/login');
                return;
            }

            if (user) {
                try {
                    // ابدأ بقيم Firebase Auth
                    let displayName = user.displayName || '';
                    let phoneNumber = user.phoneNumber || '';
                    let photoURL = user.photoURL || '';

                    // ثم حاول جلب البيانات الأحدث من Firestore
                    if (firestore) {
                        const userDocRef = doc(firestore, 'users', user.uid);
                        const userSnap = await getDoc(userDocRef);

                        if (userSnap.exists()) {
                            const data = userSnap.data() as any;
                            displayName = data.displayName || displayName;
                            phoneNumber = data.phoneNumber || phoneNumber;
                            photoURL = data.photoURL || photoURL;
                        }
                    }

                    if (isMounted) {
                        setFormData({
                            displayName,
                            phoneNumber,
                            photoURL,
                        });
                    }
                } catch (err) {
                    console.error('Error loading user profile:', err);
                }

                if (isMounted) {
                    const hasGoogleProvider = user.providerData.some(
                        provider => provider.providerId === 'google.com'
                    );
                    setIsGoogleUser(hasGoogleProvider);
                }
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [user, isUserLoading, router, firestore]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                phoneNumber: user.phoneNumber || '',
                photoURL: user.photoURL || ''
            });
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            // Update Firebase Auth profile (including phone number)
            await updateProfile(user, {
                displayName: formData.displayName,
                photoURL: formData.photoURL
            });

            // Update phone number separately in Firebase Auth
            // Note: phoneNumber in Auth is read-only from profile, we store it in Firestore

            // Update Firestore user document with all data including phone
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: formData.displayName,
                phoneNumber: formData.phoneNumber,
                photoURL: formData.photoURL,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Re-fetch user data from Firestore to confirm save
            const updatedDoc = await getDoc(userDocRef);
            console.log('✅ User data saved to Firestore:', updatedDoc.data());

            toast({
                title: isRTL ? 'تم التحديث بنجاح' : 'Profile Updated',
                description: isRTL ? 'تم تحديث معلومات الحساب بنجاح' : 'Your profile has been updated successfully'
            });

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                variant: 'destructive',
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingPhoto(true);
        try {
            toast({
                title: isRTL ? 'جاريالرفع...' : 'Uploading...',
                description: isRTL ? 'يرجى الانتظار' : 'Please wait'
            });

            const photoURL = await uploadToCloudinary(file);
            setFormData(prev => ({ ...prev, photoURL }));

            // Auto-save photo
            await updateProfile(user, { photoURL });
            const userDocRef = doc(firestore, 'users', user.uid);
            await setDoc(userDocRef, { photoURL, updatedAt: new Date().toISOString() }, { merge: true });

            toast({
                title: isRTL ? 'تم رفع الصورة' : 'Photo Uploaded',
                description: isRTL ? 'تم تحديث صورة الملف الشخصي' : 'Profile photo updated successfully'
            });
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast({
                variant: 'destructive',
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'فشل في رفع الصورة' : 'Failed to upload photo'
            });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user || !user.email) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                variant: 'destructive',
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'
            });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast({
                variant: 'destructive',
                title: isRTL ? 'خطأ' : 'Error',
                description: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            // Re-authenticate user before changing password
            const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, passwordData.newPassword);

            toast({
                title: isRTL ? 'تم تغيير كلمة المرور' : 'Password Changed',
                description: isRTL ? 'تم تحديث كلمة المرور بنجاح' : 'Your password has been updated'
            });

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordDialog(false);
        } catch (error: any) {
            console.error('Error changing password:', error);
            let errorMessage = isRTL ? 'فشل في تغيير كلمة المرور' : 'Failed to change password';

            if (error.code === 'auth/wrong-password') {
                errorMessage = isRTL ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect';
            }

            toast({
                variant: 'destructive',
                title: isRTL ? 'خطأ' : 'Error',
                description: errorMessage
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setIsDeleting(true);
        try {
            // Re-authenticate based on login method
            if (isGoogleUser) {
                // للمستخدمين المسجلين عبر Google
                const provider = new GoogleAuthProvider();
                await reauthenticateWithPopup(user, provider);
            } else {
                // للمستخدمين المسجلين عبر Email/Password
                if (!user.email || !deletePassword) {
                    toast({
                        variant: 'destructive',
                        title: isRTL ? 'خطأ' : 'Error',
                        description: isRTL ? 'الرجاء إدخال كلمة المرور' : 'Please enter your password'
                    });
                    setIsDeleting(false);
                    return;
                }
                const credential = EmailAuthProvider.credential(user.email, deletePassword);
                await reauthenticateWithCredential(user, credential);
            }

            // استخدام batch للعملية الذرية
            const batch = writeBatch(firestore);
            const userId = user.uid;

            // 1. حذف مستند المستخدم
            const userDocRef = doc(firestore, 'users', userId);
            batch.delete(userDocRef);

            // 2. حذف الحجوزات (bookings)
            const bookingsQuery = query(collection(firestore, 'users', userId, 'bookings'));
            const bookingsSnapshot = await getDocs(bookingsQuery);
            bookingsSnapshot.docs.forEach(docSnapshot => {
                batch.delete(docSnapshot.ref);
            });

            // 3. حذف حجوزات الاختبارات المعملية (labTestBookings)
            const labTestBookingsQuery = query(collection(firestore, 'users', userId, 'labTestBookings'));
            const labTestBookingsSnapshot = await getDocs(labTestBookingsQuery);
            labTestBookingsSnapshot.docs.forEach(docSnapshot => {
                batch.delete(docSnapshot.ref);
            });

            // 4. حذف المواعيد (appointments)
            const appointmentsQuery = query(collection(firestore, 'users', userId, 'appointments'));
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            appointmentsSnapshot.docs.forEach(docSnapshot => {
                batch.delete(docSnapshot.ref);
            });

            // تطبيق جميع عمليات الحذف بطريقة ذرية
            await batch.commit();

            // حذف حساب المستخدم من Firebase Auth
            await deleteUser(user);

            toast({
                title: isRTL ? 'تم حذف الحساب' : 'Account Deleted',
                description: isRTL ? 'تم حذف حسابك وجميع بياناتك بنجاح' : 'Your account and all your data have been deleted'
            });

            router.push('/');
        } catch (error: any) {
            console.error('Error deleting account:', error);
            let errorMessage = isRTL ? 'فشل في حذف الحساب' : 'Failed to delete account';

            if (error.code === 'auth/wrong-password') {
                errorMessage = isRTL ? 'كلمة المرور غير صحيحة' : 'Password is incorrect';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = isRTL ? 'تم إلغاء التأكيد' : 'Confirmation cancelled';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = isRTL ? 'الرجاء تسجيل الدخول مرة أخرى ثم المحاولة' : 'Please sign in again and try';
            } else if (error.code === 'permission-denied') {
                errorMessage = isRTL ? 'ليس لديك صلاحية لحذف الحساب. يرجى التحقق من الإعدادات.' : 'You do not have permission to delete your account. Please check your settings.';
            }

            toast({
                variant: 'destructive',
                title: isRTL ? 'خطأ' : 'Error',
                description: errorMessage
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setDeletePassword('');
        }
    };

    if (isUserLoading || !user) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const userInitial = user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
    const memberSince = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : 'N/A';

    return (
        <div className="container py-12 max-w-4xl" dir={dir}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary">
                    {isRTL ? 'الملف الشخصي' : 'Profile'}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {isRTL ? 'إدارة معلومات حسابك وإعداداتك' : 'Manage your account information and settings'}
                </p>
            </div>

            {/* Profile Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{isRTL ? 'معلومات الحساب' : 'Account Information'}</CardTitle>
                    <CardDescription>
                        {isRTL ? 'عرض وتعديل معلوماتك الشخصية' : 'View and edit your personal information'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-background shadow-xl">
                            <AvatarImage src={formData.photoURL} alt={user.displayName || 'User'} />
                            <AvatarFallback className="text-3xl sm:text-4xl bg-primary text-primary-foreground">{userInitial}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-start space-y-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="h-10 px-4 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all font-bold"
                            >
                                {uploadingPhoto ? (
                                    <>
                                        <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                                    </>
                                ) : (
                                    <>
                                        <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {isRTL ? 'تغيير الصورة' : 'Change Photo'}
                                    </>
                                )}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                            <p className="text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1 rounded-full border">
                                {isRTL ? 'JPG, PNG أو GIF (الحد الأقصى 5MB)' : 'JPG, PNG or GIF (max 5MB)'}
                            </p>
                        </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="displayName">
                                <User className={`inline h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {isRTL ? 'الاسم' : 'Display Name'}
                            </Label>
                            <Input
                                id="displayName"
                                value={formData.displayName}
                                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                disabled={!isEditing}
                                placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                <Mail className={`inline h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {isRTL ? 'البريد الإلكتروني' : 'Email'}
                            </Label>
                            <Input
                                id="email"
                                value={user.email || ''}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                {isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phoneNumber">
                                <Phone className={`inline h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                            </Label>
                            <Input
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                disabled={!isEditing}
                                placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>
                                <Calendar className={`inline h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {isRTL ? 'عضو منذ' : 'Member Since'}
                            </Label>
                            <Input value={memberSince} disabled className="bg-muted" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        {!isEditing ? (
                            <Button onClick={handleEdit}>
                                <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                            </Button>
                        ) : (
                            <>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving && <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                                    {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{isRTL ? 'الأمان' : 'Security'}</CardTitle>
                    <CardDescription>
                        {isRTL ? 'إدارة كلمة المرور والأمان' : 'Manage your password and security'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                        <Lock className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">
                        {isRTL ? 'منطقة الخطر' : 'Danger Zone'}
                    </CardTitle>
                    <CardDescription>
                        {isRTL ? 'حذف الحساب بشكل دائم' : 'Permanently delete your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'حذف الحساب' : 'Delete Account'}
                    </Button>
                </CardContent>
            </Card>

            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent dir={dir}>
                    <DialogHeader>
                        <DialogTitle>{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</DialogTitle>
                        <DialogDescription>
                            {isRTL ? 'أدخل كلمة المرور الحالية والجديدة' : 'Enter your current and new password'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="currentPassword">{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                            {isChangingPassword && <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                            {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir={dir}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">
                            {isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isRTL
                                ? 'هذه العملية لا يمكن التراجع عنها. سيتم حذف جميع بياناتك وحجوزاتك بشكل دائم.'
                                : 'This action cannot be undone. All your data and bookings will be permanently deleted.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {!isGoogleUser && (
                        <div className="grid gap-2 py-4">
                            <Label htmlFor="deletePassword">
                                {isRTL ? 'أدخل كلمة المرور للتأكيد' : 'Enter your password to confirm'}
                            </Label>
                            <Input
                                id="deletePassword"
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder={isRTL ? 'كلمة المرور' : 'Password'}
                            />
                        </div>
                    )}
                    {isGoogleUser && (
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground">
                                {isRTL
                                    ? 'سيُطلب منك تسجيل الدخول بحساب Google الخاص بك للتأكيد.'
                                    : 'You will be asked to sign in with your Google account to confirm.'}
                            </p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting || (!isGoogleUser && !deletePassword)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                            {isRTL ? 'حذف الحساب' : 'Delete Account'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
