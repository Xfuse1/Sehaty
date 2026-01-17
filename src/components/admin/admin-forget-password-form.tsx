"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { sendPasswordResetEmail } from "firebase/auth"
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react"

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
import { useAuth } from "@/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "البريد الإلكتروني مطلوب." })
    .email({ message: "البريد الإلكتروني غير صالح." }),
});

type FormValues = z.infer<typeof formSchema>;

export function AdminForgetPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })
  const { toast } = useToast()
  const auth = useAuth()

  async function onSubmit(values: FormValues) {
    try {
      await sendPasswordResetEmail(auth, values.email, {
        url: `${window.location.origin}/admin/auth`,
      });

      setEmailSent(true);

      toast({
        title: "تم إرسال البريد الإلكتروني",
        description: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور.",
      });

      // إعادة تعيين النموذج بعد 3 ثواني
      setTimeout(() => {
        form.reset();
        setEmailSent(false);
      }, 5000);
    } catch (error: any) {
      console.error("خطأ في إرسال البريد الإلكتروني:", error);

      let description = "فشل في إرسال البريد الإلكتروني. الرجاء المحاولة مرة أخرى.";

      if (error.code === "auth/user-not-found") {
        description = "لا يوجد حساب مرتبط بهذا البريد الإلكتروني.";
      } else if (error.code === "auth/invalid-email") {
        description = "البريد الإلكتروني غير صالح.";
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
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          استعادة كلمة المرور
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور
        </p>
      </div>

      {emailSent ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="space-y-2">
              <p className="font-medium">تم إرسال البريد الإلكتروني بنجاح!</p>
              <p className="text-sm">
                تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@sehaty.com"
                      autoComplete="email"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    سنرسل لك رابطاً لإعادة تعيين كلمة المرور
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
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جارِ الإرسال...
                </>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال رابط الاستعادة
                </>
              )}
            </Button>
          </form>
        </Form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            استعادة آمنة
          </span>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p>تذكرت كلمة المرور؟ ارجع إلى تسجيل الدخول</p>
      </div>
    </div>
  )
}
