import { NextRequest, NextResponse } from "next/server";
import { auth as adminAuth } from "@/firebase/admin";

/**
 * API Route لإزالة صلاحيات الأدمن من مستخدم
 * يُستخدم فقط من قبل أدمنز آخرين
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

    // إزالة Custom Claims من المستخدم
    await adminAuth.setCustomUserClaims(uid, {
      admin: false,
      role: null,
    });

    console.log(`✅ Admin privileges removed from user: ${uid}`);

    return NextResponse.json(
      {
        success: true,
        message: "Admin privileges removed successfully",
        uid: uid,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error removing admin privileges:", error);

    return NextResponse.json(
      {
        error: "Failed to remove admin privileges",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
