# Bug #29: حذف الحساب للمسجلين عبر Google

## المشكلة

كان النظام يطلب كلمة مرور من جميع المستخدمين عند محاولة حذف الحساب، مما يسبب مشكلة للمستخدمين المسجلين عبر Google (Social Login) لأنهم لا يملكون كلمة مرور.

## الحل المُطبق

### 1. التحقق من نوع تسجيل الدخول

تم إضافة state وlogic للتحقق من طريقة تسجيل دخول المستخدم:

```typescript
const [isGoogleUser, setIsGoogleUser] = useState(false);

useEffect(() => {
    if (user) {
        // التحقق من نوع تسجيل الدخول
        const hasGoogleProvider = user.providerData.some(
            provider => provider.providerId === 'google.com'
        );
        setIsGoogleUser(hasGoogleProvider);
    }
}, [user]);
```

### 2. Re-authentication حسب نوع المستخدم

تم تعديل دالة `handleDeleteAccount` لتدعم كلا النوعين:

```typescript
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
                // عرض رسالة خطأ
                return;
            }
            const credential = EmailAuthProvider.credential(user.email, deletePassword);
            await reauthenticateWithCredential(user, credential);
        }

        // باقي عملية الحذف...
    } catch (error) {
        // معالجة الأخطاء
    }
};
```

### 3. واجهة مستخدم ديناميكية

تم تعديل Dialog لعرض محتوى مختلف حسب نوع المستخدم:

**للمستخدمين بكلمة مرور (Email/Password):**
- يُطلب منهم إدخال كلمة المرور في حقل نصي
- زر "حذف الحساب" معطل حتى يدخلوا كلمة المرور

**للمستخدمين بدون كلمة مرور (Google):**
- رسالة تخبرهم أنهم سيُطلب منهم تسجيل الدخول بحساب Google
- عند الضغط على "حذف الحساب"، يظهر popup من Google للتأكيد
- لا يوجد حقل كلمة مرور

```typescript
{!isGoogleUser && (
    <div className="grid gap-2 py-4">
        <Label htmlFor="deletePassword">
            أدخل كلمة المرور للتأكيد
        </Label>
        <Input
            id="deletePassword"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
        />
    </div>
)}
{isGoogleUser && (
    <div className="py-4">
        <p className="text-sm text-muted-foreground">
            سيُطلب منك تسجيل الدخول بحساب Google الخاص بك للتأكيد.
        </p>
    </div>
)}
```

### 4. معالجة الأخطاء المحسّنة

تم إضافة معالجة لأخطاء جديدة خاصة بـ Google:

```typescript
if (error.code === 'auth/wrong-password') {
    errorMessage = 'كلمة المرور غير صحيحة';
} else if (error.code === 'auth/popup-closed-by-user') {
    errorMessage = 'تم إلغاء التأكيد';
} else if (error.code === 'auth/requires-recent-login') {
    errorMessage = 'الرجاء تسجيل الدخول مرة أخرى ثم المحاولة';
}
```

## التغييرات التقنية

### Imports المُضافة

```typescript
import { 
    EmailAuthProvider, 
    reauthenticateWithCredential, 
    deleteUser, 
    GoogleAuthProvider,        // جديد
    reauthenticateWithPopup    // جديد
} from 'firebase/auth';
```

### State المُضاف

```typescript
const [isGoogleUser, setIsGoogleUser] = useState(false);
```

## الفوائد

1. ✅ **دعم كامل لـ Social Login:** المستخدمون المسجلون عبر Google يمكنهم الآن حذف حساباتهم بسهولة
2. ✅ **أمان محسّن:** استخدام `reauthenticateWithPopup` يضمن تأكيد هوية المستخدم
3. ✅ **تجربة مستخدم أفضل:** واجهة ديناميكية توضح للمستخدم ما سيحدث
4. ✅ **معالجة شاملة للأخطاء:** رسائل خطأ واضحة لكل حالة
5. ✅ **توافق كامل:** يعمل مع كلا النوعين من المستخدمين

## الاختبار

### اختبار 1: مستخدم Email/Password
1. سجل دخول بحساب Email/Password
2. اذهب إلى الملف الشخصي
3. اضغط "حذف الحساب"
4. أدخل كلمة المرور
5. **النتيجة المتوقعة:** يتم حذف الحساب بنجاح

### اختبار 2: مستخدم Google
1. سجل دخول بحساب Google
2. اذهب إلى الملف الشخصي
3. اضغط "حذف الحساب"
4. يظهر Dialog مع رسالة عن Google
5. اضغط "حذف الحساب"
6. يظهر popup من Google
7. أكد تسجيل الدخول
8. **النتيجة المتوقعة:** يتم حذف الحساب بنجاح

### اختبار 3: إلغاء التأكيد (Google)
1. سجل دخول بحساب Google
2. حاول حذف الحساب
3. أغلق popup من Google
4. **النتيجة المتوقعة:** رسالة "تم إلغاء التأكيد" ولا يتم حذف الحساب

## الملفات المُعدلة

- `src/app/profile/page.tsx` - تم تعديل منطق حذف الحساب والواجهة

## المراجع

- [Firebase Re-authentication](https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user)
- [Firebase Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Delete User](https://firebase.google.com/docs/auth/web/manage-users#delete_a_user)
