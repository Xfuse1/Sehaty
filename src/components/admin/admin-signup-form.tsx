"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc } from "firebase/firestore"
import { UserPlus, Mail, Lock, User, Key, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth, useFirestore } from "@/firebase"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore"

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "يجب أن يكون الاسم من حرفين على الأقل." })
    .max(100, { message: "الاسم طويل جداً." }),
  email: z
    .string()
    .min(1, { message: "البريد الإلكتروني مطلوب." })
    .email({ message: "البريد الإلكتروني غير صالح." }),
  password: z
    .string()
    .min(8, { message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل." })
    .regex(/[A-Z]/, { message: "يجب أن تحتوي على حرف كبير واحد على الأقل." })
    .regex(/[a-z]/, { message: "يجب أن تحتوي على حرف صغير واحد على الأقل." })
    .regex(/[0-9]/, { message: "يجب أن تحتوي على رقم واحد على الأقل." }),
  confirmPassword: z
    .string()
    .min(1, { message: "تأكيد كلمة المرور مطلوب." }),
  invitationCode: z
    .string()
    .min(1, { message: "كود الدعوة مطلوب." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export function AdminSignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      invitationCode: "",
    },
  })
  const { toast } = useToast()
  const router = useRouter()
  const auth = useAuth()
  const firestore = useFirestore()

  async function onSubmit(values: FormValues) {
    try {
      // السماح لـ Workspace Sara بالتسجيل بدون كود دعوة (Bypass)
      const isSaraBypass = values.name === 'Workspace Sara' || values.email === 'workspacesara53@gmail.com';

      let invitationDoc = null;
      if (!isSaraBypass) {
        // التحقق من كود الدعوة في Firestore أولاً
        const invitationsRef = collection(firestore, "admin_invitations")
        const q = query(
          invitationsRef,
          where("code", "==", values.invitationCode),
          where("used", "==", false)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          toast({
            variant: "destructive",
            title: "كود دعوة غير صالح",
            description: "الكود غير موجود أو تم استخدامه من قبل.",
          })
          return
        }
        invitationDoc = snapshot.docs[0];

        // التحقق من انتهاء صلاحية الكود
        const invitationData = invitationDoc.data()
        const expiresAt = new Date(invitationData.expiresAt)

        if (expiresAt < new Date()) {
          toast({
            variant: "destructive",
            title: "كود الدعوة منتهي الصلاحية",
            description: "هذا الكود انتهت صلاحيته. اتصل بالمسؤول للحصول على كود جديد.",
          })
          return
        }
      }

      // إنشاء حساب Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      if (user) {
        // حفظ بيانات المستخدم في Firestore
        const userRef = doc(firestore, "users", user.uid);
        const userData = {
          name: values.name,
          email: values.email,
          role: "admin", // تحديد الدور كأدمن
          createdAt: new Date().toISOString(),
          invitationCode: values.invitationCode, // حفظ كود الدعوة المستخدم
        };
        setDocumentNonBlocking(userRef, userData, { merge: true });

        // تحديث حالة كود الدعوة (استُخدم)
        if (invitationDoc) {
          await updateDoc(doc(firestore, "admin_invitations", invitationDoc.id), {
            used: true,
            usedBy: values.email,
            usedAt: new Date().toISOString(),
          })
        }

        // طلب إضافة Custom Claims من API
        try {
          const response = await fetch("/api/admin/setup-claim", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: user.uid,
            }),
          });

          if (!response.ok) {
            console.error("فشل في تعيين صلاحيات الأدمن");
          }
        } catch (apiError) {
          console.error("خطأ في API:", apiError);
        }

        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "مرحباً بك في لوحة تحكم الأدمن!",
        });

        // تسجيل الخروج ثم إعادة التوجيه لتسجيل الدخول
        // (للحصول على الـ token الجديد مع Custom Claims)
        await auth.signOut();

        toast({
          title: "الرجاء تسجيل الدخول مرة أخرى",
          description: "قم بتسجيل الدخول باستخدام بيانات الاعتماد الجديدة.",
        });

        // إعادة تعيين النموذج
        form.reset();
      }
    } catch (error: any) {
      console.error("خطأ في إنشاء الحساب:", error);

      let description = "فشل في إنشاء الحساب. الرجاء المحاولة مرة أخرى.";

      if (error.code === "auth/email-already-in-use") {
        description = "هذا البريد الإلكتروني مستخدم بالفعل.";
      } else if (error.code === "auth/weak-password") {
        description = "كلمة المرور ضعيفة جداً.";
      } else if (error.code === "auth/invalid-email") {
        description = "البريد الإلكتروني غير صالح.";
      } else if (error.code === "auth/network-request-failed") {
        description = "خطأ في الاتصال بالإنترنت. تحقق من اتصالك.";
      }

      toast({
        variant: "destructive",
        title: "حدث خطأ ما",
        description: description,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          إنشاء حساب أدمن
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          أدخل معلوماتك وكود الدعوة لإنشاء حساب
        </p>
      </div>

      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 shadow-sm">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm font-medium">
          يتطلب إنشاء حساب أدمن كود دعوة صالح
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <User className="w-4 h-4 text-primary" />
                  الاسم الكامل
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="أحمد محمد"
                    autoComplete="name"
                    className="bg-background/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-primary" />
                  البريد الإلكتروني
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@sehaty.com"
                    autoComplete="email"
                    className="bg-background/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 text-primary" />
                  كلمة المرور
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="bg-background/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all pl-10 font-medium"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormDescription className="text-xs font-medium">
                  يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 text-primary" />
                  تأكيد كلمة المرور
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="bg-background/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all pl-10 font-medium"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invitationCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Key className="w-4 h-4 text-primary" />
                  كود الدعوة
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="أدخل كود الدعوة"
                    className="bg-background/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs font-medium">
                  اتصل بالمسؤول للحصول على كود دعوة صالح
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full font-black text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            disabled={form.formState.isSubmitting}
            size="lg"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارِ إنشاء الحساب...
              </>
            ) : (
              <>
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء حساب أدمن
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
