/**
 * أكواد الدعوة للأدمن
 * يمكنك إضافة أو حذف أكواد هنا للتحكم في من يمكنه التسجيل كأدمن
 */

export const ADMIN_INVITATION_CODES = [
  "ADMIN2025",
  "SEHATY_ADMIN",
  "ADMIN_SECURE_123",
] as const;

/**
 * التحقق من صحة كود الدعوة
 * @param code - كود الدعوة المدخل
 * @returns true إذا كان الكود صحيح
 */
export function isValidInvitationCode(code: string): boolean {
  return ADMIN_INVITATION_CODES.includes(code as any);
}
