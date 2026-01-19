# تقرير: الميزات بدون Backend في مشروع Sehaty

## 📋 نظرة عامة
هذا التقرير يحدد جميع الميزات والصفحات الموجودة في Frontend ولكنها تفتقد إلى Backend API أو Admin Panel لإدارتها بشكل كامل.

---

## 🔴 ميزات حرجة تحتاج Backend فوراً

### 1. **نموذج التواصل (Contact Form)**
📁 **الموقع:** `src/app/contact/page.tsx`

**المشكلة:**
- النموذج موجود بالكامل في الـ UI
- زر "إرسال" لا يفعل شيء (لا يوجد onClick handler)
- لا يوجد API لحفظ الرسائل
- لا يوجد admin panel لعرض الرسائل الواردة

**ما ينقص:**
- ✅ API: `/api/contact/submit` - لحفظ الرسائل في Firestore
- ✅ Collection: `contact_messages` في Firebase
- ✅ Admin Page: `/admin/contact-messages` - لعرض والرد على الرسائل
- ✅ Email Notification: إرسال إيميل للأدمن عند وصول رسالة جديدة

---

### 2. **طلبات التحاليل المنزلية (Lab Requests)**
📁 **الموقع:** `src/app/lab-services/page.tsx`

**الموجود حالياً:**
- ✅ المستخدم يرفع صورة روشتة ويكتب ملاحظات
- ✅ يتم الحفظ في `lab-requests` collection
- ✅ يتم إرسال رسالة واتساب

**ما ينقص:**
- ❌ Admin Panel: `/admin/lab-requests` - لعرض جميع الطلبات
- ❌ تحديث حالة الطلب (pending/processing/completed)
- ❌ إضافة السعر المقدر
- ❌ رفع نتائج التحاليل (PDF) للمريض

---

### 3. **طلبات الأشعة المنزلية (Radiology Requests)**
📁 **الموقع:** `src/app/radiology/page.tsx`

**المشكلة:**
- يتم حفظ الروشتة في ملف المريض فقط
- لا يوجد collection منفصل لـ "radiology_requests"
- لا admin panel لمتابعة الطلبات

**ما ينقص:**
- ✅ API: `/api/radiology/request` - لحفظ طلبات الأشعة
- ✅ Collection: `radiology_requests`
- ✅ Admin Page: `/admin/radiology-requests`
- ✅ رفع نتائج الأشعة للمريض

---

### 4. **طلبات الروشتات من الصيدلية (Pharmacy Prescriptions)**
📁 **الموقع:** `src/app/pharmacy/page.tsx`

**الموجود حالياً:**
- ✅ رفع الروشتة وحفظها في `prescriptions` collection
- ✅ حفظ في Airtable أيضاً

**ما ينقص:**
- ❌ Admin Page: `/admin/pharmacy-prescriptions`
- ❌ إضافة الأدوية المطلوبة وأسعارها
- ❌ تحديث حالة الطلب (قيد المراجعة/جاهز/تم التوصيل)
- ❌ ربط مع نظام التوصيل

---

### 5. **نتائج الفحوصات السابقة (Medical Reports)**
📁 **الموقع:** `src/app/radiology/page.tsx` (سطر 263-287)

**المشكلة:**
- النتائج المعروضة هي Mock Data ثابتة
```typescript
const mockResults = [
  { id: 1, name: "أشعة سينية على الصدر", date: "2024-06-10", url: "#" },
  { id: 2, name: "سونار على البطن", date: "2024-04-18", url: "#" }
];
```

**ما ينقص:**
- ✅ Collection: `medical_reports` أو ربط بـ subcollection في ملف المستخدم
- ✅ API لرفع النتائج من الأدمن
- ✅ عرض النتائج الحقيقية للمستخدم

---

### 6. **نتائج التشخيص الذكي (Quiz Results)**
📁 **الموقع:** `src/app/quiz/page.tsx`

**المشكلة:**
- المستخدم يكمل الاختبار ويحصل على توصية
- التوصية تختفي بمجرد إغلاق الصفحة
- لا يتم حفظ النتائج في أي مكان

**ما ينقص:**
- ✅ API: `/api/quiz/save-results` - لحفظ نتائج الاختبار
- ✅ Collection: `quiz_results` مع userId
- ✅ عرض التوصيات السابقة في Profile
- ✅ إظهار التوصية للطبيب عند الحجز

---

### 7. **التقييمات والمراجعات (Reviews & Ratings)**
📁 **موجودة في:** `doctors-directory/page.tsx`, `pharmacy/page.tsx`

**المشكلة:**
- التقييمات معروضة فقط (Read-only)
- لا يمكن للمستخدم إضافة تقييم جديد
- لا يوجد نظام للتحقق من صحة التقييمات

**ما ينقص:**
- ✅ API: `/api/reviews/submit`
- ✅ Collection: `reviews` مع doctor_id/product_id
- ✅ Admin Panel: لمراجعة وحذف التقييمات غير اللائقة
- ✅ Validation: التأكد أن المستخدم حجز فعلياً قبل التقييم

---

## 🟡 ميزات مهمة لكن ليست حرجة

### 8. **الإشعارات (Notifications)**
**المشكلة:**
- لا يوجد نظام إشعارات في الموقع
- المستخدم لا يعرف تحديثات حجزه إلا بالتحقق يدوياً

**ما ينقص:**
- ✅ Real-time Notifications عند تغيير حالة الحجز
- ✅ Email/SMS عند تأكيد الحجز
- ✅ تذكير بالموعد قبل 24 ساعة

---

### 9. **إدارة المخزون (Inventory Management) - الصيدلية**
📁 **الموقع:** `src/lib/products-data.ts`

**المشكلة:**
- بيانات الأدوية stored في ملف JavaScript ثابت
- لا يمكن تحديث الأسعار أو المخزون من Admin Panel

**ما ينقص:**
- ✅ نقل البيانات إلى `pharmacy_products` collection
- ✅ Admin Page: `/admin/pharmacy-products`
- ✅ تتبع المخزون (In Stock/Out of Stock)

---

### 10. **سجل التدقيق (Audit Logs)**
**المهكلة:**
- لا يوجد سجل لمن قام بتعديل ماذا ومتى
- في الأنظمة الطبية، هذا ضروري للقوانين

**ما ينقص:**
- ✅ Collection: `audit_logs`
- ✅ تسجيل كل عملية حساسة (تعديل حجز، استرجاع مبلغ، إلخ)
- ✅ Admin Page لعرض السجل

---

### 11. **نظام الإحالة / Referrals**
**المشكلة:**
- لا يوجد نظام لإحالة المريض من طبيب إلى طبيب آخر
- الطبيب لا يمكنه طلب تحاليل أو أشعة للمريض

**ما ينقص:**
- ✅ API للإحالة
- ✅ Collection: `referrals`
- ✅ UI للطبيب لإنشاء إحالة

---

## 🟢 تحسينات مقترحة

### 12. **نظام المفضلة (Favorites)**
- إضافة أطباء أو منتجات للمفضلة
- Collection: `user_favorites`

### 13. **نظام الرسائل المباشرة**
- دردشة بين المريض والطبيب/الصيدلية
- Collection: `messages`

### 14. **خطط العلاج (Treatment Plans)**
- الطبيب يضع خطة علاجية طويلة المدى للمريض
- Collection: `treatment_plans`

---

## 📊 ملخص الأولويات

| الأولوية | الميزة | التأثير على التجربة | سهولة التنفيذ |
|---------|--------|----------------------|---------------|
| 🔴 عالية جداً | Contact Form Backend | كبير | سهل |
| 🔴 عالية جداً | Lab Requests Admin | كبير | متوسط |
| 🔴 عالية جداً | Radiology Requests Admin | كبير | متوسط |
| 🔴 عالية | Pharmacy Prescriptions Admin | كبير | متوسط |
| 🔴 عالية | Medical Reports (real data) | كبير | متوسط |
| 🟡 متوسطة | Quiz Results Saving | متوسط | سهل |
| 🟡 متوسطة | Reviews System | متوسط | معقد |
| 🟡 متوسطة | Notifications | كبير | معقد |
| 🟢 منخفضة | Inventory Management | صغير | متوسط |
| 🟢 منخفضة | Audit Logs | صغير (قانوني) | سهل |

---

## 🎯 الخطوات التالية الموصى بها

### المرحلة 1 (أسبوع واحد):
1. ✅ Contact Form Backend + Admin Panel
2. ✅ Lab Requests Admin Panel
3. ✅ Radiology Requests System (كامل)

### المرحلة 2 (أسبوعين):
4. ✅ Pharmacy Prescriptions Admin
5. ✅ Medical Reports System
6. ✅ Quiz Results Storage

### المرحلة 3 (شهر):
7. ✅ Reviews & Ratings System
8. ✅ Notifications System
9. ✅ Inventory Management

---

**تم إعداد هذا التقرير في:** 19 يناير 2026  
**المشروع:** Sehaty - نظام إدارة العيادات متعدد المستأجرين
