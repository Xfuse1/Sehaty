import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { BlogArticle } from '@/types/blog';

export const getBlogArticles = async (firestore: Firestore, maxLimit?: number): Promise<BlogArticle[]> => {
    try {
        const blogRef = collection(firestore, 'blog_articles');
        let q = query(blogRef, orderBy('createdAt', 'desc'));

        if (maxLimit) {
            q = query(q, limit(maxLimit));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as BlogArticle[];
    } catch (error) {
        console.error('Error fetching blog articles:', error);
        throw error;
    }
};
