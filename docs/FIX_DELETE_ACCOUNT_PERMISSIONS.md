# حل مشكلة: Missing or insufficient permissions عند حذف الحساب

## المشكلة
عند محاولة حذف الحساب، يظهر الخطأ:
```
FirebaseError: Missing or insufficient permissions.
```

## السبب الجذري

### 1. Firestore Rules - القاعدة الأساسية
في ملف `firestore.rules`، قاعدة `/users/{userId}` لم تكن تسمح بعملية `delete`:

```javascript
match /users/{userId} {
    allow create: if isOwner(userId);
    allow update: if isOwner(userId) || isAdmin();
    // ❌ لم يكن هناك allow delete - وهي المشكلة!
    allow get, list: if isOwner(userId) || isAdmin();
}
```

### 2. عدم حذف جميع البيانات المرتبطة
الكود الأصلي كان يحذف فقط `bookings`، لكنه لم يحذف:
- `labTestBookings` (حجوزات الاختبارات المعملية)
- `appointments` (المواعيد)

## الحل المُطبق

### 1️⃣ تحديث Firestore Rules

```javascript
match /users/{userId} {
    function isOwner(userId) {
        return request.auth != null && request.auth.uid == userId;
    }

    // Allow user to create their own profile
    allow create: if isOwner(userId);
    // Allow user to update their own profile, or admin to update any user
    allow update: if isOwner(userId) || isAdmin();
    // ✅ السماح بحذف ملف المستخدم الخاص به
    allow delete: if isOwner(userId) || isAdmin();
    // Allow user to read their own profile, or admin to read any profile
    allow get, list: if isOwner(userId) || isAdmin();
}
```

### 2️⃣ تحسين كود حذف الحساب

#### إضافة import لـ writeBatch:
```typescript
import { writeBatch } from 'firebase/firestore';
```

#### استخدام Batch Operations لضمان تنفيذ ذري:

```typescript
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
```

### 3️⃣ معالجة محسّنة للأخطاء

```typescript
} catch (error: any) {
    if (error.code === 'permission-denied') {
        errorMessage = 'ليس لديك صلاحية لحذف الحساب. يرجى التحقق من الإعدادات.';
    }
    // معالجة أخطاء أخرى...
}
```

## الفوائد

### ✅ الأمان
- عملية ذرية: إما يتم حذف جميع البيانات أو لا يتم حذف أي بيانات
- منع البيانات اليتيمة والمتبقية

### ✅ الكمالية
- حذف جميع بيانات المستخدم (ملف المستخدم، الحجوزات، الاختبارات، المواعيد)
- عدم ترك أي بيانات في قاعدة البيانات

### ✅ الأداء
- استخدام batch يقلل من عدد عمليات الكتابة
- عملية واحدة بدلاً من عمليات منفصلة

### ✅ معالجة الأخطاء
- رسائل خطأ واضحة للمستخدم
- تتبع شامل للأخطاء

## الملفات المُعدلة

1. **`firestore.rules`**
   - أضيف: `allow delete: if isOwner(userId) || isAdmin();`

2. **`src/app/profile/page.tsx`**
   - أضيف: import لـ `writeBatch`
   - تحديث: `handleDeleteAccount` function
   - أضيف: حذف `labTestBookings` و `appointments`
   - تحسين: معالجة الأخطاء

## اختبار الحل

### اختبار 1: حذف الحساب (Email/Password)
1. سجل دخول بحساب Email/Password
2. اذهب إلى الملف الشخصي
3. اضغط "حذف الحساب"
4. أدخل كلمة المرور
5. **النتيجة المتوقعة:** ✅ الحساب وجميع البيانات محذوفة

### اختبار 2: حذف الحساب (Google)
1. سجل دخول بحساب Google
2. اذهب إلى الملف الشخصي
3. اضغط "حذف الحساب"
4. أكد عبر Google popup
5. **النتيجة المتوقعة:** ✅ الحساب وجميع البيانات محذوفة

### اختبار 3: التحقق من حذف البيانات الكاملة
1. اذهب إلى Firebase Console
2. تحقق من مجموعات البيانات:
   - `users/{userId}` ❌ محذوف
   - `users/{userId}/bookings/*` ❌ محذوف
   - `users/{userId}/labTestBookings/*` ❌ محذوف
   - `users/{userId}/appointments/*` ❌ محذوف

## المراجع

- [Firebase Batch Writes](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Firestore Security Rules - Delete](https://firebase.google.com/docs/firestore/security/rules-query)
- [Firebase Delete User](https://firebase.google.com/docs/auth/web/manage-users#delete_a_user)
