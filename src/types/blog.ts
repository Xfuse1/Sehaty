import { Timestamp } from 'firebase/firestore';

export interface BlogArticle {
    id: string;
    titleAr: string;
    titleEn: string;
    excerptAr: string;
    excerptEn: string;
    contentAr: string;
    contentEn: string;
    authorAr: string;
    authorEn: string;
    categoryAr: string;
    categoryEn: string;
    image: string;
    publishDate: Timestamp | any;
    createdAt: Timestamp | any;
    updatedAt?: Timestamp;
}
