import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

/**
 * API لحفظ رسائل التواصل من نموذج التواصل
 */
export async function POST(request: NextRequest) {
    try {
        const body: ContactFormData = await request.json();
        const { name, email, message } = body;

        // التحقق من البيانات المطلوبة
        if (!name || !email || !message) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'جميع الحقول مطلوبة',
                    details: 'Name, email, and message are required'
                },
                { status: 400 }
            );
        }

        // التحقق من صحة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'البريد الإلكتروني غير صالح',
                    details: 'Invalid email format'
                },
                { status: 400 }
            );
        }

        // التحقق من طول الرسالة
        if (message.length < 10) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'الرسالة قصيرة جداً (الحد الأدنى 10 أحرف)',
                    details: 'Message too short (minimum 10 characters)'
                },
                { status: 400 }
            );
        }

        if (message.length > 5000) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'الرسالة طويلة جداً (الحد الأقصى 5000 حرف)',
                    details: 'Message too long (maximum 5000 characters)'
                },
                { status: 400 }
            );
        }

        // حفظ الرسالة في Firestore
        const contactMessage = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            status: 'unread', // unread, read, replied
            createdAt: Timestamp.now(),
            repliedAt: null,
            replyMessage: null,
            repliedBy: null,
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        };

        const docRef = await db.collection('contact_messages').add(contactMessage);

        // يمكن إضافة إرسال إيميل للأدمن هنا
        // await sendEmailToAdmin(contactMessage);

        return NextResponse.json({
            success: true,
            message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.',
            messageId: docRef.id
        });

    } catch (error) {
        console.error('Error saving contact message:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'حدث خطأ أثناء إرسال الرسالة',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
