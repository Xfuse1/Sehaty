import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

interface Doctor {
    id: string;
    name?: string;
    name_en?: string;
    specialty?: string;
    specialty_en?: string;
    location?: string;
    location_en?: string;
    rating?: number;
    reviews?: number;
    experience?: number;
    price?: number;
    image?: string;
    [key: string]: any;
}

/**
 * API للبحث في الأطباء من جانب الخادم
 * يدعم البحث بالاسم والتخصص مع pagination
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.toLowerCase().trim() || '';
        const specialty = searchParams.get('specialty')?.toLowerCase().trim() || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // التحقق من صحة المدخلات
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        // جلب البيانات
        const snapshot = await db.collection('doctors').get();

        // تحويل البيانات مع type casting
        let doctors: Doctor[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Doctor));

        // تطبيق فلتر التخصص
        if (specialty) {
            doctors = doctors.filter(doctor =>
                doctor.specialty?.toLowerCase() === specialty ||
                doctor.specialty_en?.toLowerCase() === specialty
            );
        }

        // تطبيق البحث النصي إذا وجد
        if (query) {
            doctors = doctors.filter(doctor => {
                const nameMatch = (doctor.name || '').toLowerCase().includes(query) ||
                    (doctor.name_en || '').toLowerCase().includes(query);
                const specialtyMatch = (doctor.specialty || '').toLowerCase().includes(query) ||
                    (doctor.specialty_en || '').toLowerCase().includes(query);
                const locationMatch = (doctor.location || '').toLowerCase().includes(query) ||
                    (doctor.location_en || '').toLowerCase().includes(query);

                return nameMatch || specialtyMatch || locationMatch;
            });
        }

        // حساب إجمالي النتائج
        const total = doctors.length;

        // تطبيق pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDoctors = doctors.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            data: paginatedDoctors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: endIndex < total
            }
        });

    } catch (error) {
        console.error('Error searching doctors:', error);
        return NextResponse.json(
            {
                error: 'Failed to search doctors',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
