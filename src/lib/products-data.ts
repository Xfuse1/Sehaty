
export interface Product {
    id: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    price: number;
    image: string;
    category: 'skin-care' | 'hair-care' | 'baby-care' | 'essentials';
    rating: number;
}

export const productsData: Product[] = [
    {
        id: "prod1",
        name: { ar: "كريم ستارفيل للتفتيح", en: "Starville Whitening Cream" },
        description: { ar: "كريم تفتيح البشرة من ستارفيل، غني بالمكونات الطبيعية والفيتامينات لتفتيح وتوحيد لون البشرة.", en: "Whitening cream by Starville, rich in natural ingredients and vitamins to lighten and even out skin tone." },
        price: 85.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/starville-whitening-cream-60gm-01662985303.png",
        category: "skin-care",
        rating: 4.5,
    },
    {
        id: "prod2",
        name: { ar: "سيروم سيروبايب للشعر", en: "Seropipe Hair Serum" },
        description: { ar: "سيروم مقوي للشعر من سيروبايب، يمنع تساقط الشعر ويعزز نموه وكثافته.", en: "Hair strengthening serum by Seropipe, prevents hair loss and promotes growth and density." },
        price: 150.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/seropipe-hair-serum-100ml-lotion-01654093952.png",
        category: "hair-care",
        rating: 4.8,
    },
    {
        id: "prod3",
        name: { ar: "شامبو كلاري ضد القشرة", en: "Clary Anti-Dandruff Shampoo" },
        description: { ar: "شامبو فعال ضد القشرة من كلاري، مناسب للشعر الدهني، ينظف الفروة بعمق.", en: "Effective anti-dandruff shampoo by Clary, suitable for oily hair, deeply cleanses the scalp." },
        price: 110.75,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/clary-anti-dandruff-shampoo-for-oily-hair-250ml-01698759367.png",
        category: "hair-care",
        rating: 4.6,
    },
    {
        id: "prod4",
        name: { ar: "زيت بندولين للأطفال", en: "Penduline Baby Hair Oil" },
        description: { ar: "زيت شعر مخصص للأطفال من بندولين، تركيبة لطيفة وطبيعية لتغذية شعر الأطفال.", en: "Specially formulated hair oil for kids by Penduline, gentle and natural formula to nourish kids' hair." },
        price: 95.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/penduline-plus-hair-oil-120ml-01689694294.png",
        category: "baby-care",
        rating: 4.9,
    },
    {
        id: "prod5",
        name: { ar: "شامبو جونسون للأطفال", en: "Johnson's Baby Shampoo" },
        description: { ar: "شامبو الأطفال الكلاسيكي من جونسون، لا دموع بعد اليوم، لطيف على عيون وشعر طفلك.", en: "Classic baby shampoo by Johnson's, no more tears, gentle on your baby's eyes and hair." },
        price: 45.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/johnsons-baby-shampoo-500ml-01663236085.png",
        category: "baby-care",
        rating: 4.7,
    },
    {
        id: "prod6",
        name: { ar: "لوشن ستارفيل مرطب", en: "Starville Hydrating Lotion" },
        description: { ar: "لوشن مرطب للبشرة العادية والجافة من ستارفيل، يوفر ترطيباً عميقاً يدوم طويلاً.", en: "Hydrating lotion for normal to dry skin by Starville, provides long-lasting deep hydration." },
        price: 120.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/1634215984-starville-hydrating-lotion-for-normal-to-dry-skin-200ml.png",
        category: "skin-care",
        rating: 4.8,
    },
    {
        id: "prod7",
        name: { ar: "ماسك كلاري للشعر", en: "Clary Hair Mask" },
        description: { ar: "ماسك مغذي للشعر بخلاصة زيت الأرجان من كلاري، لإصلاح الشعر التالف ومنحه لمعاناً.", en: "Nourishing hair mask with Argan oil by Clary, to repair damaged hair and give it shine." },
        price: 99.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/clary-hair-mask-with-argan-oil-300gm-01675253876.png",
        category: "hair-care",
        rating: 4.7,
    },
    {
        id: "prod8",
        name: { ar: "كريم بندولين كيدز", en: "Penduline Kids Cream" },
        description: { ar: "كريم شعر للأطفال من بندولين، يساعد على تصفيف الشعر بسهولة ويحافظ على ترطيبه.", en: "Hair cream for kids by Penduline, helps with easy styling and maintains hydration." },
        price: 75.50,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/penduline-hair-cream-for-kids-150-ml-01653830206.png",
        category: "baby-care",
        rating: 4.9,
    },
];
