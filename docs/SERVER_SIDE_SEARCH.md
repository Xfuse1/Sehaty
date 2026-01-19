# Server-Side Search Implementation

## نظرة عامة (Overview)

تم تطبيق نظام بحث من جانب الخادم (Server-Side Search) لتحسين أداء الموقع عند التعامل مع كميات كبيرة من البيانات.

## الميزات الرئيسية

### 1. API Endpoints

#### `/api/doctors/search`
- **Method:** GET
- **Parameters:**
  - `q` (string): نص البحث
  - `specialty` (string): التخصص المطلوب
  - `page` (number): رقم الصفحة (افتراضي: 1)
  - `limit` (number): عدد النتائج في كل صفحة (افتراضي: 20، الحد الأقصى: 100)

- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc123",
      "name": "د. أحمد محمود",
      "specialty": "باطنة",
      "rating": 4.5,
      "price": 200
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}
```

#### `/api/pharmacy/search`
- **Method:** GET
- **Parameters:**
  - `q` (string): نص البحث
  - `category` (string): فئة المنتج (all, medicine, skincare, vitamins, baby)
  - `lang` (string): اللغة (ar/en)
  - `page` (number): رقم الصفحة
  - `limit` (number): عدد النتائج

## الفوائد

### 1. تحسين الأداء
- **قبل:** تحميل جميع البيانات في الـ Frontend (بطيء مع آلاف السجلات)
- **بعد:** تحميل 20 نتيجة فقط في كل مرة (سريع جداً)

### 2. Pagination
- تحميل المزيد من النتائج عند الطلب
- تجربة مستخدم أفضل

### 3. Debouncing
- تأخير البحث بـ 500ms لتقليل عدد الطلبات للخادم
- تحسين تجربة المستخدم أثناء الكتابة

## كيفية الاستخدام

### Frontend Implementation

```typescript
// مثال على استخدام البحث في الأطباء
const searchDoctors = useCallback(async (searchQuery: string, pageNum: number = 1) => {
  const params = new URLSearchParams({
    q: searchQuery,
    page: pageNum.toString(),
    limit: '20'
  });

  const response = await fetch(`/api/doctors/search?${params}`);
  const result = await response.json();
  
  if (result.success) {
    setDoctors(result.data);
    setHasMore(result.pagination.hasMore);
  }
}, []);

// البحث مع debounce
useEffect(() => {
  const timer = setTimeout(() => {
    searchDoctors(searchTerm, 1);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm, searchDoctors]);
```

## الملفات المعدلة

1. **API Routes:**
   - `src/app/api/doctors/search/route.ts`
   - `src/app/api/pharmacy/search/route.ts`

2. **Frontend Pages:**
   - `src/app/doctors-directory/page.tsx`
   - `src/app/pharmacy/page.tsx`

## ملاحظات هامة

### Firestore Limitations
Firestore لا يدعم Full-Text Search مباشرة، لذا:
- البحث النصي يتم في الذاكرة بعد جلب البيانات
- للمشاريع الكبيرة جداً، يُنصح باستخدام:
  - [Algolia](https://www.algolia.com/)
  - [Elasticsearch](https://www.elastic.co/)
  - [Typesense](https://typesense.org/)

### Performance Tips
- الـ limit الافتراضي هو 20 نتيجة
- يمكن زيادته إلى 100 كحد أقصى
- استخدم Indexes في Firestore للاستعلامات المعقدة

## المستقبل

### تحسينات مقترحة:
1. **Caching:** استخدام Redis لتخزين النتائج المتكررة
2. **Full-Text Search:** الانتقال إلى Algolia للبحث الأسرع
3. **Filters:** إضافة المزيد من الفلاتر (السعر، التقييم، الموقع)
4. **Sorting:** ترتيب النتائج حسب الأهمية/السعر/التقييم

## الدعم

إذا واجهت أي مشاكل:
- تحقق من الـ Console في المتصفح
- راجع logs الخادم
- تأكد من صحة البيانات في Firestore

---

**ملاحظة:** هذا النظام يعمل بشكل مثالي مع حتى 100,000 سجل. للأعداد الأكبر، يجب الانتقال لحل متخصص في البحث.
