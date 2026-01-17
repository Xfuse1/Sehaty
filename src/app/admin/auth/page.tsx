"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSignInForm } from "@/components/admin/admin-signin-form"
import { AdminSignUpForm } from "@/components/admin/admin-signup-form"
import { AdminForgetPasswordForm } from "@/components/admin/admin-forget-password-form"
import { Shield, Lock, UserPlus, KeyRound } from "lucide-react"

export default function AdminAuthPage() {
  const [activeTab, setActiveTab] = useState<string>("signin")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 dark:bg-blue-500 mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            لوحة تحكم الأدمن
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم
          </p>
        </div>

        {/* Main Card with Tabs */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-headline text-center">
              مصادقة المسؤول
            </CardTitle>
            <CardDescription className="text-center">
              اختر طريقة المصادقة المناسبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="signin" className="gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                  <span className="sm:hidden">دخول</span>
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">إنشاء حساب</span>
                  <span className="sm:hidden">تسجيل</span>
                </TabsTrigger>
                <TabsTrigger value="forgot" className="gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden sm:inline">نسيت كلمة المرور</span>
                  <span className="sm:hidden">استعادة</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0">
                <AdminSignInForm />
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <AdminSignUpForm />
              </TabsContent>

              <TabsContent value="forgot" className="mt-0">
                <AdminForgetPasswordForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            منطقة آمنة ومحمية - للمسؤولين فقط
          </p>
        </div>
      </div>
    </div>
  )
}
