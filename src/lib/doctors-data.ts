
export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    specialtyKey: string;
    rating: number;
    reviews: number;
    experience: number;
    location: string;
    price: number;
    image: string;
}

export const doctorsData: Doctor[] = [
    {
        id: "doctor1",
        name: "د. فاطمة على الأحمد",
        specialty: "طب الأطفال وحديثي الولادة",
        specialtyKey: "pediatrics",
        rating: 4.9,
        reviews: 153,
        experience: 15,
        location: "عيادة الأمل - جدة",
        price: 250,
        image: "https://picsum.photos/seed/doctor1/200/200",
    },
    {
        id: "doctor2",
        name: "د. خالد بن الوليد",
        specialty: "أمراض القلب والشرايين",
        specialtyKey: "cardiology",
        rating: 4.8,
        reviews: 210,
        experience: 20,
        location: "مستشفى القلب التخصصي - الرياض",
        price: 350,
        image: "https://picsum.photos/seed/doctor2/200/200",
    },
    {
        id: "doctor3",
        name: "د. سارة خالد المطيري",
        specialty: "الأمراض الجلدية والتجميل",
        specialtyKey: "dermatology",
        rating: 4.9,
        reviews: 289,
        experience: 12,
        location: "عيادة الجمال الطبي - الرياض",
        price: 280,
        image: "https://picsum.photos/seed/doctor3/200/200",
    },
    {
        id: "doctor4",
        name: "د. أحمد عبد العزيز",
        specialty: "الجهاز الهضمي والمناظير",
        specialtyKey: "gastroenterology",
        rating: 4.7,
        reviews: 180,
        experience: 18,
        location: "مركز المدينة الطبي - الدمام",
        price: 300,
        image: "https://picsum.photos/seed/doctor4/200/200",
    },
    {
        id: "doctor5",
        name: "د. نورة بنت عبدالله",
        specialty: "النساء والولادة",
        specialtyKey: "obgyn",
        rating: 4.9,
        reviews: 350,
        experience: 16,
        location: "مستشفى النساء والولادة - جدة",
        price: 320,
        image: "https://picsum.photos/seed/doctor5/200/200",
    },
    {
        id: "doctor6",
        name: "د. علي محمد الغامدي",
        specialty: "طب العيون",
        specialtyKey: "ophthalmology",
        rating: 4.8,
        reviews: 195,
        experience: 22,
        location: "مركز النور للعيون - الرياض",
        price: 270,
        image: "https://picsum.photos/seed/doctor6/200/200",
    },
    {
        id: "doctor7",
        name: "د. منى إبراهيم",
        specialty: "الطب النفسي",
        specialtyKey: "psychiatry",
        rating: 4.9,
        reviews: 120,
        experience: 10,
        location: "مركز الراحة النفسية - الخبر",
        price: 400,
        image: "https://picsum.photos/seed/doctor7/200/200",
    },
    {
        id: "doctor8",
        name: "د. يوسف حمدان",
        specialty: "جراحة العظام",
        specialtyKey: "orthopedics",
        rating: 4.7,
        reviews: 250,
        experience: 25,
        location: "المستشفى السعودي الألماني - الرياض",
        price: 450,
        image: "https://picsum.photos/seed/doctor8/200/200",
    }
];
