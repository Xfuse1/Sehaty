import { NextRequest, NextResponse } from 'next/server';
import { productsData } from '@/lib/products-data';

/**
 * API للبحث في الأدوية من جانب الخادم
 * يدعم البحث بالاسم والفئة مع pagination
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.toLowerCase().trim() || '';
        const category = searchParams.get('category')?.toLowerCase().trim() || '';
        const language = searchParams.get('lang') || 'ar';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // التحقق من صحة المدخلات
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { error: 'Invalid pagination parameters' },
                { status: 400 }
            );
        }

        let filteredProducts = [...productsData];

        // تطبيق فلتر الفئة
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(
                product => product.category === category
            );
        }

        // تطبيق البحث النصي
        if (query) {
            filteredProducts = filteredProducts.filter(product => {
                const name = product.name[language as 'ar' | 'en'] || product.name.ar;
                const description = product.description[language as 'ar' | 'en'] || product.description.ar;

                return name.toLowerCase().includes(query) ||
                    description.toLowerCase().includes(query);
            });
        }

        // حساب إجمالي النتائج
        const total = filteredProducts.length;

        // تطبيق pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            data: paginatedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: endIndex < total
            }
        });

    } catch (error) {
        console.error('Error searching products:', error);
        return NextResponse.json(
            {
                error: 'Failed to search products',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
