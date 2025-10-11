"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  subject: z.string().min(5, "الموضوع قصير جدًا"),
  message: z.string().min(10, "الرسالة قصيرة جدًا"),
})

export default function ContactPage() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "تم استلام رسالتك",
      description: "شكرًا لتواصلك معنا. سنقوم بالرد في أقرب وقت ممكن.",
    })
    form.reset()
  }

  return (
    <div className="bg-background text-foreground">
       <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            تواصل معنا
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            نحن هنا من أجلك
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            لديك استفسار أو تحتاج إلى مساعدة؟ فريقنا جاهز للإجابة على جميع أسئلتك.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">معلومات التواصل</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary"/>
                  <span className="text-muted-foreground">support@sehaty.app</span>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-primary"/>
                  <span className="text-muted-foreground">9200-XXXXX</span>
                </div>
                 <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-primary"/>
                  <span className="text-muted-foreground">الرياض، المملكة العربية السعودية</span>
                </div>
              </div>
            </div>
             <div>
              <h2 className="text-2xl font-bold mb-4">ساعات العمل</h2>
              <p className="text-muted-foreground">دعم العملاء متاح 24/7</p>
              <p className="text-muted-foreground">العيادات والصيدليات حسب مواعيدها المعلنة.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="اسمك..." {...field} />
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
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموضوع</FormLabel>
                      <FormControl>
                        <Input placeholder="موضوع الرسالة..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رسالتك</FormLabel>
                      <FormControl>
                        <Textarea placeholder="اكتب رسالتك هنا..." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "جارِ الإرسال..." : "إرسال الرسالة"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
