
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: 'skin-care' | 'hair-care' | 'baby-care' | 'essentials';
    rating: number;
}

export const productsData: Product[] = [
    {
        id: "prod1",
        name: "كريم ستارفيل للتفتيح",
        description: "كريم تفتيح البشرة من ستارفيل، غني بالمكونات الطبيعية والفيتامينات لتفتيح وتوحيد لون البشرة.",
        price: 85.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/starville-whitening-cream-60gm-01662985303.png",
        category: "skin-care",
        rating: 4.5,
    },
    {
        id: "prod2",
        name: "سيروم سيروبايب للشعر",
        description: "سيروم مقوي للشعر من سيروبايب، يمنع تساقط الشعر ويعزز نموه وكثافته.",
        price: 150.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/seropipe-hair-serum-100ml-lotion-01654093952.png",
        category: "hair-care",
        rating: 4.8,
    },
    {
        id: "prod3",
        name: "شامبو كلاري ضد القشرة",
        description: "شامبو فعال ضد القشرة من كلاري، مناسب للشعر الدهني، ينظف الفروة بعمق.",
        price: 110.75,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/clary-anti-dandruff-shampoo-for-oily-hair-250ml-01698759367.png",
        category: "hair-care",
        rating: 4.6,
    },
    {
        id: "prod4",
        name: "زيت بندولين للأطفال",
        description: "زيت شعر مخصص للأطفال من بندولين، تركيبة لطيفة وطبيعية لتغذية شعر الأطفال.",
        price: 95.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/penduline-plus-hair-oil-120ml-01689694294.png",
        category: "baby-care",
        rating: 4.9,
    },
    {
        id: "prod5",
        name: "شامبو جونسون للأطفال",
        description: "شامبو الأطفال الكلاسيكي من جونسون، لا دموع بعد اليوم، لطيف على عيون وشعر طفلك.",
        price: 45.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/johnsons-baby-shampoo-500ml-01663236085.png",
        category: "baby-care",
        rating: 4.7,
    },
    {
        id: "prod6",
        name: "لوشن ستارفيل مرطب",
        description: "لوشن مرطب للبشرة العادية والجافة من ستارفيل، يوفر ترطيباً عميقاً يدوم طويلاً.",
        price: 120.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/1634215984-starville-hydrating-lotion-for-normal-to-dry-skin-200ml.png",
        category: "skin-care",
        rating: 4.8,
    },
    {
        id: "prod7",
        name: "ماسك كلاري للشعر",
        description: "ماسك مغذي للشعر بخلاصة زيت الأرجان من كلاري، لإصلاح الشعر التالف ومنحه لمعاناً.",
        price: 99.00,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/clary-hair-mask-with-argan-oil-300gm-01675253876.png",
        category: "hair-care",
        rating: 4.7,
    },
    {
        id: "prod8",
        name: "كريم بندولين كيدز",
        description: "كريم شعر للأطفال من بندولين، يساعد على تصفيف الشعر بسهولة ويحافظ على ترطيبه.",
        price: 75.50,
        image: "https://cdn.chefaa.com/filters:format(webp)/fit-in/1000x1000/public/uploads/products/penduline-hair-cream-for-kids-150-ml-01653830206.png",
        category: "baby-care",
        rating: 4.9,
    },
];
