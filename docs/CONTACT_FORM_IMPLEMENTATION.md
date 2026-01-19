# Contact Form Implementation

## 📋 نظرة عامة
تم تطبيق نظام كامل لنموذج التواصل يتضمن Frontend, Backend API, و Admin Panel.

---

## ✨ الميزات المنفذة

### 1️⃣ **صفحة التواصل (Contact Page)**
📁 `src/app/contact/page.tsx`

**الميزات:**
- ✅ نموذج تفاعلي بـ 3 حقول (الاسم، البريد الإلكتروني، الرسالة)
- ✅ Validation في الـ Frontend
- ✅ Loading states أثناء الإرسال
- ✅ Success animation عند الإرسال الناجح
- ✅ Toast notifications للتنبيهات
- ✅ Auto-clear للحقول بعد الإرسال الناجح

**الاستخدام:**
```tsx
// المستخدم يملأ النموذج ويضغط "إرسال"
// يتم إرسال البيانات إلى /api/contact/submit
// تظهر رسالة نجاح
// يتم مسح الحقول تلقائياً
```

---

### 2️⃣ **Backend API**
📁 `src/app/api/contact/submit/route.ts`

**Validation Rules:**
- ✅ جميع الحقول مطلوبة (name, email, message)
- ✅ التحقق من صحة البريد الإلكتروني
- ✅ الحد الأدنى للرسالة: 10 أحرف
- ✅ الحد الأقصى للرسالة: 5000 حرف

**البيانات المحفوظة:**
```typescript
{
  name: string,
  email: string,
  message: string,
  status: 'unread' | 'read' | 'replied',
  createdAt: Timestamp,
  repliedAt: Timestamp | null,
  replyMessage: string | null,
  repliedBy: string | null,
  ip: string,
  userAgent: string
}
```

**API Endpoint:**
```
POST /api/contact/submit

Request Body:
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "message": "أحتاج إلى استشارة طبية"
}

Response (Success):
{
  "success": true,
  "message": "تم إرسال رسالتك بنجاح!",
  "messageId": "abc123"
}

Response (Error):
{
  "success": false,
  "error": "البريد الإلكتروني غير صالح",
  "details": "Invalid email format"
}
```

---

### 3️⃣ **Admin Panel**
📁 `src/app/admin/contact-messages/page.tsx`

**الميزات:**
- ✅ عرض جميع الرسائل في جدول
- ✅ Badge لعدد الرسائل غير المقروءة
- ✅ تصنيف الرسائل (Unread, Read, Replied)
- ✅ عرض تفاصيل كل رسالة في Dialog
- ✅ وضع علامة "مقروء" على الرسالة
- ✅ حذف الرسالة
- ✅ زر "الرد عبر البريد" (يفتح البريد الإلكتروني)
- ✅ عرض IP و User Agent للأمان

**الأعمدة في الجدول:**
| العمود | الوصف |
|--------|------|
| الحالة | Unread/Read/Replied |
| الاسم | اسم المرسل |
| البريد الإلكتروني | email |
| الرسالة | معاينة مختصرة |
| التاريخ | تاريخ ووقت الإرسال |
| الإجراءات | عرض / مقروء / حذف |

---

## 🔐 Security Rules (Firestore)

```javascript
match /contact_messages/{messageId} {
  allow create: if true; // أي شخص يمكنه إرسال رسالة
  allow read, update, delete: if isAdmin(); // فقط الأدمن يمكنه الإدارة
}
```

**لماذا؟**
- السماح لأي زائر (حتى غير مسجل) بإرسال رسالة تواصل
- حماية خصوصية الرسائل: فقط الأدمن يمكنه قراءتها
- منع المستخدمين العاديين من حذف أو تعديل الرسائل

---

## 📊 حالات الرسالة (Message Status)

| الحالة | الوصف | اللون |
|--------|------|------|
| `unread` | جديدة (لم تُقرأ) | ⚠️ أحمر |
| `read` | تم قراءتها | 📖 رمادي |
| `replied` | تم الرد عليها | ✅ أخضر |

---

## 🎯 سير العمل (Workflow)

### للمستخدم:
1. يزور صفحة `/contact`
2. يملأ النموذج (الاسم، البريد، الرسالة)
3. يضغط "إرسال"
4. تظهر رسالة نجاح
5. يتم مسح النموذج تلقائياً

### للأدمن:
1. يزور `/admin/contact-messages`
2. يرى عدد الرسائل غير المقروءة
3. يضغط على "عرض" لقراءة الرسالة
4. تتحول الحالة تلقائياً إلى "مقروء"
5. يمكنه الرد عبر البريد الإلكتروني
6. يمكنه حذف الرسالة بعد الانتهاء

---

## 🚀 الخطوات التالية المقترحة

### قصيرة المدى:
- [ ] إضافة Email Notification للأدمن عند وصول رسالة جديدة
- [ ] إضافة إمكانية الرد من داخل الـ Admin Panel
- [ ] تصدير الرسائل إلى Excel/CSV

### متوسطة المدى:
- [ ] نظام Tags/Categories للرسائل
- [ ] Assign رسائل لموظفين محددين
- [ ] Templates للردود الشائعة

### طويلة المدى:
- [ ] تكامل مع نظام CRM
- [ ] نظام تذاكر (Ticketing System)
- [ ] Chat مباشر بدلاً من نموذج التواصل

---

## 📁 الملفات المتأثرة

```
src/
├── app/
│   ├── contact/
│   │   └── page.tsx                     ✅ محدث
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx                 ✅ محدث (أضيف رابط)
│   │   └── contact-messages/
│   │       └── page.tsx                 ✅ جديد
│   └── api/
│       └── contact/
│           └── submit/
│               └── route.ts             ✅ جديد
firestore.rules                          ✅ محدث
```

---

## ✅ اختبار الميزة

### 1. اختبر صفحة التواصل:
```bash
# افتح المتصفح على:
http://localhost:3000/contact

# جرب:
1. إرسال نموذج فارغ (يجب أن يظهر خطأ validation)
2. إرسال بريد غير صحيح (يجب أن يظهر خطأ)
3. إرسال رسالة قصيرة (<10 أحرف)
4. إرسال رسالة صحيحة (يجب أن تنجح)
```

### 2. اختبر Admin Panel:
```bash
# افتح:
http://localhost:3000/admin/contact-messages

# يجب أن ترى:
1. الرسالة التي أرسلتها في الاختبار السابق
2. Badge الرسائل غير المقروءة
3. يمكنك الضغط على "عرض" لقراءة التفاصيل
4. جرب "حذف" رسالة
```

---

## 🐛 Troubleshooting

### المشكلة: "Failed to send message"
**الحل:**
- تأكد أن Firebase Admin SDK مهيأ بشكل صحيح
- تحقق من console logs في المتصفح والخادم

### المشكلة: "Permission denied" في Admin Panel
**الحل:**
- تأكد أن المستخدم الحالي لديه admin claim
- راجع `useAdminAuth` hook

### المشكلة: الرسائل لا تظهر في Admin Panel
**الحل:**
- تحقق من Firestore Rules
- تأكد أن collection name هو `contact_messages`

---

**تم إنشاء التوثيق في:** 19 يناير 2026  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للإنتاج
