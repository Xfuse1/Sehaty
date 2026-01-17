import { NextRequest, NextResponse } from "next/server";
import { auth as adminAuth } from "@/firebase/admin";

/**
 * API Route آمن لإضافة Custom Claims للأدمن
 * يُستخدم فقط عند إنشاء حساب جديد
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "UID is required" },
        { status: 400 }
      );
    }

    // إضافة Custom Claim للأدمن
    await adminAuth.setCustomUserClaims(uid, {
      admin: true,
      role: "admin",
    });

    console.log(`✅ Admin claim set for user: ${uid}`);

    return NextResponse.json(
      {
        success: true,
        message: "Admin claim set successfully",
        uid: uid,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error setting admin claim:", error);

    return NextResponse.json(
      {
        error: "Failed to set admin claim",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
