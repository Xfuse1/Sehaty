
export interface SpecializedClinic {
    id: string;
    name: string;
    description: string;
    image: string;
}

export const initialSpecializedClinics: SpecializedClinic[] = [
    {
        id: "internal-medicine",
        name: "الباطنية",
        description: "تشخيص وعلاج أمراض الأعضاء الداخلية مثل القلب والكلى والجهاز الهضمي.",
        image: "https://picsum.photos/seed/internal/400/300"
    },
    {
        id: "ent",
        name: "الأنف والأذن والحنجرة",
        description: "علاج أمراض الأذن والأنف والحنجرة ومشاكل السمع والتوازن.",
        image: "https://picsum.photos/seed/ent/400/300"
    },
    {
        id: "cardiology",
        name: "القلب والأوعية الدموية",
        description: "الوقاية وتشخيص وعلاج أمراض القلب والأوعية الدموية.",
        image: "https://picsum.photos/seed/cardiology/400/300"
    },
    {
        id: "dentistry",
        name: "الأسنان",
        description: "العناية بصحة الفم والأسنان، من التنظيف إلى جراحات الفك.",
        image: "https://picsum.photos/seed/dentistry/400/300"
    },
    {
        id: "neurology",
        name: "المخ والأعصاب",
        description: "تشخيص وعلاج اضطرابات الجهاز العصبي، بما في ذلك الدماغ والحبل الشوكي.",
        image: "https://picsum.photos/seed/neurology/400/300"
    },
    {
        id: "orthopedics",
        name: "العظام",
        description: "علاج كسور وإصابات العظام والمفاصل والأربطة.",
        image: "https://picsum.photos/seed/orthopedics/400/300"
    }
];

export const siteContentPaths = {
    specializedClinics: "specializedClinics"
};

