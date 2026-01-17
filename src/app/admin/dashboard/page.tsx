"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ShieldAlert,
  Stethoscope,
  Settings,
  HeartPulse,
  ShieldPlus,
  TestTube,
  CalendarCheck,
  UserPlus,
  UserCog,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  Pill
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

export default function AdminDashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const { isAdmin, isLoading: isUserLoading } = useAdminAuth();

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        {isUserLoading ?
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">{t.common.loading}</p>
          </div> :
          <Card className="max-w-md text-center p-8 border-none shadow-2xl bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-black font-headline">{t.admin.dashboard.denied}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-8">
                {t.admin.dashboard.deniedDesc}
              </p>
              <Button asChild className="w-full h-12 rounded-xl shadow-lg border-none">
                <Link href="/">{t.admin.dashboard.backToSite}</Link>
              </Button>
            </CardContent>
          </Card>
        }
      </div>
    );
  }

  const adminModules = [
    {
      title: t.admin.dashboard.bookings.title,
      desc: t.admin.dashboard.bookings.desc,
      icon: <CalendarCheck className="h-6 w-6" />,
      href: "/admin/bookings",
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-500"
    },
    {
      title: t.admin.dashboard.doctors.title,
      desc: t.admin.dashboard.doctors.desc,
      icon: <Stethoscope className="h-6 w-6" />,
      href: "/admin/doctors",
      color: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-500"
    },
    {
      title: language === 'ar' ? 'أطباء الدليل' : 'Directory Doctors',
      desc: language === 'ar' ? 'إدارة الأطباء في صفحة الدليل العام' : 'Manage doctors in the public directory page',
      icon: <Users className="h-6 w-6" />,
      href: "/admin/directory-doctors",
      color: "from-teal-500/20 to-teal-600/5",
      iconColor: "text-teal-500"
    },
    {
      title: t.admin.dashboard.physio.title,
      desc: t.admin.dashboard.physio.desc,
      icon: <HeartPulse className="h-6 w-6" />,
      href: "/admin/physiotherapy",
      color: "from-rose-500/20 to-rose-600/5",
      iconColor: "text-rose-500"
    },
    {
      title: t.admin.dashboard.nursing.title,
      desc: t.admin.dashboard.nursing.desc,
      icon: <ShieldPlus className="h-6 w-6" />,
      href: "/admin/nursing",
      color: "from-violet-500/20 to-violet-600/5",
      iconColor: "text-violet-500"
    },
    {
      title: t.admin.dashboard.lab.title,
      desc: t.admin.dashboard.lab.desc,
      icon: <TestTube className="h-6 w-6" />,
      href: "/admin/lab-tests",
      color: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-500"
    },
    {
      title: t.admin.dashboard.surgery.title,
      desc: t.admin.dashboard.surgery.desc,
      icon: <LayoutDashboard className="h-6 w-6" />,
      href: "/admin/surgery",
      color: "from-indigo-500/20 to-indigo-600/5",
      iconColor: "text-indigo-500"
    },
    {
      title: t.admin.dashboard.invitations.title,
      desc: t.admin.dashboard.invitations.desc,
      icon: <UserPlus className="h-6 w-6" />,
      href: "/admin/invitations",
      color: "from-cyan-500/20 to-cyan-600/5",
      iconColor: "text-cyan-500"
    },
    {
      title: t.admin.dashboard.admins.title,
      desc: t.admin.dashboard.admins.desc,
      icon: <UserCog className="h-6 w-6" />,
      href: "/admin/manage-admins",
      color: "from-slate-500/20 to-slate-600/5",
      iconColor: "text-slate-500"
    },
    {
      title: t.admin.dashboard.blog.title,
      desc: t.admin.dashboard.blog.desc,
      icon: <BookOpen className="h-6 w-6" />,
      href: "/admin/blog",
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-500"
    },
    {
      title: t.admin.dashboard.pharmacy.title,
      desc: t.admin.dashboard.pharmacy.desc,
      icon: <Pill className="h-6 w-6" />,
      href: "/admin/pharmacy",
      color: "from-blue-400/20 to-blue-500/5",
      iconColor: "text-blue-500"
    },
    {
      title: t.admin.dashboard.settings.title,
      desc: t.admin.dashboard.settings.desc,
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/settings",
      color: "from-orange-500/20 to-orange-600/5",
      iconColor: "text-orange-500",
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

      <div className="container mx-auto px-4 py-12" dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t.admin.dashboard.modules.controlCenter}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-headline text-foreground tracking-tight drop-shadow-sm">
              {t.admin.dashboard.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
              {t.admin.dashboard.subtitle}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-2 hover:bg-primary hover:text-white transition-all duration-300">
            <Link href="/">{t.admin.dashboard.backToSite}</Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminModules.map((module, i) => (
            <Card
              key={i}
              className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-card/60 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <CardHeader className="flex flex-row items-start justify-between pb-4 relative z-10">
                <div className={`p-4 rounded-2xl bg-background shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${module.iconColor}`}>
                  {module.icon}
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <CardTitle className="text-2xl font-bold font-headline mb-3 group-hover:text-primary transition-colors">
                  {module.title}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground leading-relaxed mb-8 group-hover:text-foreground/80 transition-colors">
                  {module.desc}
                </CardDescription>

                {module.disabled ? (
                  <Button variant="secondary" className="w-full rounded-xl cursor-not-allowed opacity-60" disabled>
                    {t.admin.dashboard.modules.soon}
                  </Button>
                ) : (
                  <Button asChild className="w-full h-12 rounded-xl shadow-lg border-none group/btn">
                    <Link href={module.href} className="flex items-center justify-center gap-2">
                      {t.admin.dashboard.modules.open}
                      <ArrowRight className={`h-4 w-4 transition-transform group-hover/btn:translate-x-1 ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
