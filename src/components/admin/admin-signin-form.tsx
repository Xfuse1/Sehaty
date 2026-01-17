"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth, useFirestore } from "@/firebase"

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "البريد الإلكتروني مطلوب." })
    .email({ message: "البريد الإلكتروني غير صالح." }),
  password: z
    .string()
    .min(1, { message: "كلمة المرور مطلوبة." }),
});

type FormValues = z.infer<typeof formSchema>;

export function AdminSignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const { toast } = useToast()
  const router = useRouter()
  const auth = useAuth()
  const firestore = useFirestore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  async function onSubmit(values: FormValues) {
    try {
      // تسجيل الدخول باستخدام Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      const user = userCredential.user;

      // محاولة 1: التحقق من Custom Claims
      let idTokenResult = await user.getIdTokenResult();
      let isAdmin = !!idTokenResult.claims.admin;

      // إذا لم يكن admin، جرّب force refresh (للحسابات الجديدة)
      if (!isAdmin) {
        // force refresh للـ token
        await user.getIdToken(true);
        idTokenResult = await user.getIdTokenResult(true);
        isAdmin = !!idTokenResult.claims.admin;
      }

      // محاولة 2: التحقق من Firestore كـ fallback
      if (!isAdmin) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          const userData = userDoc.data();

          if (userData?.role === "admin") {
            isAdmin = true;
          }
        } catch (firestoreError) {
          // تجاهل الخطأ
        }
      }

      // التحقق النهائي
      if (!isAdmin) {
        // تسجيل الخروج إذا لم يكن أدمن
        await auth.signOut();

        toast({
          variant: "destructive",
          title: "غير مصرح",
          description: "هذا الحساب ليس لديه صلاحيات أدمن. إذا كنت قد سجلت للتو، انتظر دقيقة ثم حاول مرة أخرى.",
        });
        return;
      }

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة تحكم الأدمن!",
      });

      // التوجيه إلى لوحة التحكم
      router.push("/admin/dashboard");
    } catch (error: any) {
      let description = "فشل في تسجيل الدخول. الرجاء المحاولة مرة أخرى.";

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        description = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if (error.code === "auth/too-many-requests") {
        description = "تم تجاوز عدد المحاولات. الرجاء المحاولة لاحقاً.";
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
          تسجيل الدخول
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          أدخل بيانات اعتمادك للوصول إلى لوحة التحكم
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      autoComplete="current-password"
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
                جارِ تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn className="ml-2 h-4 w-4" />
                تسجيل الدخول
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            تسجيل الدخول الآمن
          </span>
        </div>
      </div>
    </div>
  )
}
