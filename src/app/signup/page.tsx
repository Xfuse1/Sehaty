"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth"
import { doc } from "firebase/firestore"
import { Suspense, useEffect, useState } from "react"
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { AuthRedirectLink } from "@/components/auth-redirect-link"
import { useLanguage } from "@/contexts/language-context"

const formSchema = z.object({
  firstName: z.string().min(2, { message: "يجب أن يكون الاسم الأول من حرفين على الأقل." }),
  lastName: z.string().min(2, { message: "يجب أن يكون اسم العائلة من حرفين على الأقل." }),
  phone: z.string().regex(/^(05|5)[0-9]{8}$/, { message: "رقم الجوال غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }).optional().or(z.literal("")),
  password: z.string()
    .min(8, { message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل." })
    .regex(/[0-9]/, { message: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل." }),
});

function SignupForm() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
    },
  })

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const firestore = useFirestore()
  const [redirect, setRedirect] = useState('/')

  useEffect(() => {
    const redirectFromUrl = searchParams.get('redirect')
    const redirectFromStorage = sessionStorage.getItem('redirectAfterLogin')
    const finalRedirect = redirectFromUrl || redirectFromStorage || '/'
    setRedirect(finalRedirect)
  }, [searchParams])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // استخدام رقم الجوال كبريد إلكتروني مؤقت إذا لم يتم إدخال بريد
      const emailToUse = values.email || `${values.phone}@sehaty.temp`;
      const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, values.password);
      const user = userCredential.user;

      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userData = {
          firstName: values.firstName,
          lastName: values.lastName,
          name: `${values.firstName} ${values.lastName}`,
          phone: values.phone,
          email: values.email || "",
          createdAt: new Date().toISOString(),
        };
        setDocumentNonBlocking(userRef, userData, { merge: true });

        toast({
          title: "تم إنشاء الحساب بنجاح! 🎉",
          description: `مرحباً ${values.firstName}! نحن سعداء بانضمامك إلى صحتي.`,
        });

        // TODO: إرسال رمز التحقق عبر SMS
        router.push(redirect);
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = "فشل في إنشاء الحساب. الرجاء المحاولة مرة أخرى.";

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "هذا الحساب مسجل بالفعل. الرجاء تسجيل الدخول.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "كلمة المرور ضعيفة جداً. استخدم كلمة مرور أقوى.";
      }

      toast({
        variant: "destructive",
        title: "حدث خطأ ما",
        description: errorMessage,
      });
    }
  }

  async function signUpWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userData = {
          name: user.displayName || "",
          email: user.email || "",
          createdAt: new Date().toISOString(),
        };
        setDocumentNonBlocking(userRef, userData, { merge: true });

        toast({
          title: "تم إنشاء الحساب بنجاح! 🎉",
          description: "مرحباً بك في صحتي!",
        });
        router.push(redirect);
      }
    } catch (error: any) {
      console.error(error);
      let description = "فشل في التسجيل عبر Google. الرجاء المحاولة مرة أخرى.";

      if (error.code === 'auth/account-exists-with-different-credential') {
        description = "هذا البريد الإلكتروني مسجل بالفعل. الرجاء تسجيل الدخول بدلاً من إنشاء حساب جديد.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        description = "تم إلغاء عملية التسجيل.";
      }

      toast({
        variant: "destructive",
        title: "حدث خطأ ما",
        description: description,
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 -z-10"></div>
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-headline bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            إنشاء حساب جديد
          </CardTitle>
          <CardDescription className="text-base">
            انضم إلى آلاف المرضى الراضين عن خدماتنا
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* الاسم الأول والأخير */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الأول</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="أحمد" className="pr-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم العائلة</FormLabel>
                      <FormControl>
                        <Input placeholder="محمد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* رقم الجوال */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      رقم الجوال
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute right-3 top-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-lg">🇸🇦</span>
                          <span dir="ltr">+966</span>
                        </div>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          placeholder="512345678"
                          className="pr-24"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      سنرسل لك رمز تحقق عبر SMS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* البريد الإلكتروني (اختياري) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      البريد الإلكتروني
                      <span className="text-xs text-muted-foreground">(اختياري)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* كلمة المرور */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-bold text-foreground/80">
                      <Lock className="h-4 w-4 text-primary" />
                      كلمة المرور
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 h-11 border-border/60 bg-background focus:ring-primary/20 transition-all font-medium"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs font-medium">
                      8 أحرف على الأقل، تحتوي على رقم واحد
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* زر التسجيل */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-black bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "جار الإنشاء..." : "أنشئ حسابي 🚀"}
              </Button>
            </form>
          </Form>

          {/* فاصل */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو المتابعة بواسطة</span>
            </div>
          </div>

          {/* تسجيل عبر Google */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={signUpWithGoogle}
              className="w-full"
            >
              <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled
            >
              <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>

          {/* رابط تسجيل الدخول */}
          <div className="mt-6 text-center text-sm">
            لديك حساب بالفعل؟{" "}
            <AuthRedirectLink href="/login" className="font-semibold text-primary hover:underline">
              تسجيل الدخول
            </AuthRedirectLink>
          </div>

          {/* سياسة الخصوصية */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            بإنشاء حساب، أنت توافق على{" "}
            <Link href="/terms-of-use" className="underline hover:text-foreground">
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link href="/privacy-policy" className="underline hover:text-foreground">
              سياسة الخصوصية
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
