

export interface SpecializedClinic {
    id: string;
    name: string;
    description: string;
    image: string;
}

export interface SpecializedClinicWithIcon extends Omit<SpecializedClinic, 'image'> {
    icon: string;
}


export const initialSpecializedClinics: SpecializedClinicWithIcon[] = [
    {
        id: "general-medicine",
        name: "الطب العام",
        description: "استشارات طبية عامة وفحوصات أولية.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
    },
    {
        id: "pediatrics",
        name: "طب الأطفال",
        description: "رعاية صحية متكاملة للأطفال وحديثي الولادة.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 0-5 5v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z"/><path d="M9 12a3 3 0 0 0 6 0"/></svg>'
    },
    {
        id: "ophthalmology",
        name: "طب العيون",
        description: "فحص وعلاج أمراض العيون وتصحيح النظر.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M22 12c-3.33-5-16.67-5-20 0"/></svg>'
    },
    {
        id: "orthopedics",
        name: "طب العظام",
        description: "علاج كسور وإصابات العظام والمفاصل.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l-1.58-1.58a2 2 0 0 1 0-2.82l.3-.3a2 2 0 0 1 2.82 0l7.38 7.38c.63.63.63 1.64 0 2.26l-7.38 7.38a2 2 0 0 1-2.82 0l-.3-.3a2 2 0 0 1 0-2.82L4.5 12.5zM12 5l7.38 7.38a2 2 0 0 1 0 2.82L12 22.5"/></svg>'
    },
    {
        id: "cardiology",
        name: "طب القلب",
        description: "تشخيص وعلاج أمراض القلب والأوعية الدموية.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    },
    {
        id: "neurology",
        name: "طب الأعصاب",
        description: "علاج اضطرابات الجهاز العصبي والدماغ.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 2v4M12 20v2M4 12H2M22 12h-2M6.34 6.34l-1.42-1.42M19.07 19.07l-1.42-1.42M6.34 17.66l-1.42 1.42M19.07 4.93l-1.42 1.42"/></svg>'
    },
     {
        id: "dermatology",
        name: "الجلدية",
        description: "علاج الأمراض الجلدية والتجميل.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    },
    {
        id: "internal-medicine-2",
        name: "الباطنية",
        description: "تشخيص وعلاج أمراض الأعضاء الداخلية.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-7.14-4.6"/><path d="M15.53 7.86a2 2 0 1 1 2.82 2.82"/></svg>'
    },
    {
        id: "ent",
        name: "أنف وأذن",
        description: "علاج أمراض الأذن والأنف والحنجرة.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8.5A4.5 4.5 0 0 1 10.5 4v0a4.5 4.5 0 0 1 4.5 4.5v3.27a2.5 2.5 0 0 0 1.25 2.16L18 19.5V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-.5l1.75-1.57A2.5 2.5 0 0 0 9 14.77V8.5z"/></svg>'
    },
    {
        id: "dentistry",
        name: "طب الأسنان",
        description: "العناية بصحة الفم والأسنان.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.16 13.16s-2.5-4-8-4-8 4-8 4"/><path d="M4 14.84V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.16"/><path d="M12 2v2.32"/><path d="M12 12v-2"/><path d="M12 22v-2"/><path d="M7 12a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1Zm12 0a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1Z"/></svg>'
    },
    {
        id: "ob-gyn",
        name: "النساء والولادة",
        description: "رعاية صحية للمرأة خلال الحمل والولادة.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9z"/><path d="M18.5 13a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7z"/><path d="M5.5 13a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7z"/></svg>'
    },
    {
        id: "surgery",
        name: "الجراحة",
        description: "عمليات جراحية مختلفة وعناية ما بعد الجراحة.",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 18.5a1.5 1.5 0 0 0-3 0V22a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.5a1.5 1.5 0 0 0-3 0V22a1 1 0 0 1-1 1H1"/><path d="M18 18.5a1.5 1.5 0 0 1-3 0V1a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v17.5a1.5 1.5 0 0 1-3 0V1a1 1 0 0 0-1-1H1"/><path d="M9 12l-2-2 2-2"/><path d="M15 12l2-2-2-2"/></svg>'
    }
];

export const siteContentPaths = {
    specializedClinics: "specializedClinics"
};
