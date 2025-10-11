"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc } from "firebase/firestore"

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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth, useFirestore } from "@/firebase"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

const formSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون الاسم من حرفين على الأقل." }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(8, { message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل." }),
});

export default function SignupPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
  const { toast } = useToast()
  const router = useRouter()
  const auth = useAuth()
  const firestore = useFirestore()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userData = {
          name: values.name,
          email: values.email,
        };
        setDocumentNonBlocking(userRef, userData, { merge: true });
        
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "مرحباً بك في صحتي!",
        });
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "حدث خطأ ما",
        description: error.message || "فشل في إنشاء الحساب. الرجاء المحاولة مرة أخرى.",
      });
    }
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">إنشاء حساب جديد</CardTitle>
            <CardDescription>
              أدخل معلوماتك بالأسفل لإنشاء حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم الكامل" {...field} />
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
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="mail@example.com" {...field} />
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
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "جار الإنشاء..." : "إنشاء حساب"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
