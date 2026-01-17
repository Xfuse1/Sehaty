"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { sendPasswordResetEmail } from "firebase/auth"
import { Mail, Send, Loader2, CheckCircle2, ArrowRight, KeyRound } from "lucide-react"

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
import { useAuth } from "@/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/language-context"

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "البريد الإلكتروني مطلوب." })
    .email({ message: "البريد الإلكتروني غير صالح." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })
  const { toast } = useToast()
  const router = useRouter()
  const auth = useAuth()

  async function onSubmit(values: FormValues) {
    try {
      // التحقق من أن Firebase Auth مهيأ بشكل صحيح
      if (!auth) {
        throw new Error("Firebase Auth is not initialized");
      }

      console.log("🔵 Starting password reset process...");
      console.log("📧 Email:", values.email);
      console.log("🌐 Current URL:", window.location.origin);
      
      // إرسال بريد إعادة تعيين كلمة المرور
      // ملاحظة: Firebase يستخدم الإعدادات من Console تلقائياً
      await sendPasswordResetEmail(auth, values.email);

      console.log("✅ Password reset email sent successfully!");
      console.log("📬 Check your email inbox and spam folder");
      
      setEmailSent(true);

      toast({
        title: isRTL ? "✅ تم الإرسال بنجاح!" : "✅ Email Sent Successfully!",
        description: isRTL 
          ? "تم إرسال رابط إعادة تعيين كلمة المرور. تحقق من بريدك الإلكتروني (وصندوق الرسائل غير المرغوب فيها)." 
          : "Password reset link sent. Check your email inbox (and spam folder).",
      });

      // إعادة تعيين النموذج بعد 5 ثواني
      setTimeout(() => {
        form.reset();
        setEmailSent(false);
      }, 5000);
    } catch (error: any) {
      console.error("❌ Error sending password reset email");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      let description = isRTL 
        ? "فشل في إرسال البريد الإلكتروني. الرجاء المحاولة مرة أخرى." 
        : "Failed to send email. Please try again.";

      if (error.code === "auth/user-not-found") {
        description = isRTL 
          ? "❌ لا يوجد حساب مرتبط بهذا البريد الإلكتروني. تأكد من البريد أو قم بإنشاء حساب جديد." 
          : "❌ No account found with this email. Check the email or create a new account.";
      } else if (error.code === "auth/invalid-email") {
        description = isRTL 
          ? "❌ البريد الإلكتروني غير صالح. تحقق من صيغة البريد." 
          : "❌ Invalid email format. Check your email address.";
      } else if (error.code === "auth/too-many-requests") {
        description = isRTL 
          ? "⏳ تم تجاوز عدد المحاولات. الرجاء الانتظار 5 دقائق ثم المحاولة مرة أخرى." 
          : "⏳ Too many requests. Please wait 5 minutes and try again.";
      } else if (error.code === "auth/network-request-failed") {
        description = isRTL 
          ? "🌐 خطأ في الاتصال بالإنترنت. تحقق من اتصالك بالإنترنت." 
          : "🌐 Network error. Check your internet connection.";
      } else if (error.code === "auth/configuration-not-found") {
        description = isRTL 
          ? "⚙️ خطأ في إعدادات Firebase. تأكد من تفعيل Email/Password في Firebase Console." 
          : "⚙️ Firebase configuration error. Make sure Email/Password is enabled in Firebase Console.";
      }

      toast({
        variant: "destructive",
        title: isRTL ? "❌ حدث خطأ" : "❌ Error",
        description: description,
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background relative overflow-hidden" dir={dir}>
      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 -z-10"></div>
      
      <div className="flex items-center justify-center w-full">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-2">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">
              {isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?"}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? "لا تقلق، سنساعدك على استعادة حسابك" 
                : "Don't worry, we'll help you recover your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <div className="space-y-2">
                      <p className="font-medium text-base">
                        {isRTL ? "تم إرسال البريد الإلكتروني بنجاح!" : "Email sent successfully!"}
                      </p>
                      <p className="text-sm">
                        {isRTL 
                          ? "تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور." 
                          : "Check your email and follow the instructions to reset your password."}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {isRTL 
                          ? "لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها." 
                          : "Didn't receive the email? Check your spam folder."}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    <Mail className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? "إرسال مرة أخرى" : "Send Again"}
                  </Button>
                  
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                      {isRTL ? "العودة لتسجيل الدخول" : "Back to Login"}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {isRTL ? "البريد الإلكتروني" : "Email Address"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={isRTL ? "mail@example.com" : "mail@example.com"}
                            autoComplete="email"
                            disabled={form.formState.isSubmitting}
                            className="text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {isRTL 
                            ? "أدخل البريد الإلكتروني المسجل في حسابك" 
                            : "Enter your registered email address"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                    size="lg"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? "جارِ الإرسال..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}
                      </>
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "تذكرت كلمة المرور؟" : "Remember your password?"}
                    </p>
                    <Link href="/login">
                      <Button variant="link" className="text-primary">
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                        {isRTL ? "تسجيل الدخول" : "Sign In"}
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
