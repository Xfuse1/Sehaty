
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, Package, Stethoscope, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  // This is a temporary solution for admin check during development.
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        {isUserLoading ? 
            <Loader2 className="h-12 w-12 animate-spin text-primary" /> :
            <Card className="max-w-md text-center p-8">
                <CardHeader>
                    <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
                    <CardTitle className="text-2xl">وصول مرفوض</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/">العودة إلى الرئيسية</Link>
                    </Button>
                </CardContent>
            </Card>
        }
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary">لوحة تحكم المسؤول</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          أهلاً بك يا مدير. من هنا يمكنك إدارة محتوى التطبيق.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">إدارة العروض</CardTitle>
            <Package className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              إضافة وتعديل وحذف عروض الصيدلية التي تظهر في الصفحة الرئيسية.
            </CardDescription>
            <Button asChild className="mt-4">
              <Link href="/admin/offers">إدارة العروض</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">إدارة الأطباء</CardTitle>
            <Stethoscope className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              التحكم في قائمة الأطباء وبياناتهم وأسعار الكشوفات.
            </CardDescription>
            <Button variant="secondary" className="mt-4" disabled>قريباً</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">الإعدادات العامة</CardTitle>
            <Settings className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              إدارة الصور، الأسماء، والأوصاف العامة في التطبيق.
            </CardDescription>
            <Button variant="secondary" className="mt-4" disabled>قريباً</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
