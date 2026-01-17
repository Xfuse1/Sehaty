
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/login-button';
import { ModeToggle } from '@/components/mode-toggle';
import { LogOut, Loader2, Menu, Languages, Shield, User, CalendarPlus } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '@/contexts/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const Logo = ({ appName }: { appName: string }) => (
  <div className="flex items-center gap-2 group cursor-pointer">
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:rotate-6">
      <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"
          fill="white"
        />
      </svg>
    </div>
    <span className="font-bold text-lg md:text-2xl font-headline tracking-tight text-foreground whitespace-nowrap">{appName}</span>
  </div>
);

const LangToggle = ({ setLanguage }: { setLanguage: (l: 'ar' | 'en') => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="hover:bg-muted relative">
        <Languages className="h-5 w-5" />
        <span className="sr-only">Toggle Language</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="rounded-xl">
      <DropdownMenuItem onClick={() => setLanguage('ar')} className="flex items-center justify-between">
        <span>العربية</span>
        <span className="text-[10px] bg-muted px-1 rounded uppercase">ar</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setLanguage('en')} className="flex items-center justify-between">
        <span>English</span>
        <span className="text-[10px] bg-muted px-1 rounded uppercase">en</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const adminEmails = ["sarsor6578@gmail.com", "workspacesara53@gmail.com"];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name[0].toUpperCase();
  }

  const navLinks = [
    { href: "/", label: t.header.home },
    { href: "/about", label: t.header.about },
    { href: "/#services", label: t.header.services },
    { href: "/specialized-clinics", label: t.header.clinics },
    { href: "/faq", label: t.header.faq },
    { href: "/contact", label: t.header.contact },
  ];

  const userMenu = (
    <>
      {isUserLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="font-semibold text-foreground hidden sm:inline group-hover:text-primary transition-colors">
                {t.header.hello} {user.displayName}
              </span>
              <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary transition-all">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard">
                  <Shield className="ml-2 h-4 w-4" />
                  {t.header.dashboard}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/profile">{t.header.profile}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-bookings">{t.header.myBookings}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50/50">
              <LogOut className="ml-2 h-4 w-4" />
              <span>{t.header.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:bg-muted px-2">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Toggle Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('ar')} className={language === 'ar' ? 'bg-accent/20' : ''}>العربية</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent/20' : ''}>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <LoginButton>
            {t.header.login}
          </LoginButton>
        </div>
      )}
    </>
  );

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a simpler version or null during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 animate-pulse" />
            <div className="w-20 h-6 bg-muted animate-pulse rounded" />
          </div>
          <div className="hidden lg:flex gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-16 h-4 bg-muted animate-pulse rounded" />)}
          </div>
          <div className="w-24 h-10 bg-muted animate-pulse rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 md:h-20 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transform hover:scale-105 transition-transform duration-300">
            <Logo appName={t.common.appName} />
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-bold transition-all duration-300 hover:text-primary relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border/50">
            <ModeToggle />
            <LangToggle setLanguage={setLanguage} />
          </div>
          <div className="h-6 w-[1px] bg-border mx-2" />
          {user ? (
            userMenu
          ) : (
            <LoginButton className="rounded-full px-6 shadow-md hover:shadow-lg transition-all duration-300">
              {t.header.login}
            </LoginButton>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2 sm:gap-3">
          <ModeToggle />
          <LangToggle setLanguage={setLanguage} />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 hover:bg-muted">
                <Menu className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-10 mt-4">
                  <Logo appName={t.common.appName} />
                </div>
                <nav className="flex flex-col gap-4 text-lg font-medium">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center p-3 rounded-xl hover:bg-muted transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pb-8">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold truncate">{user.displayName}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" asChild className="w-full rounded-xl justify-start h-12" onClick={() => setIsOpen(false)}>
                          <Link href="/profile" className="flex items-center gap-3">
                            <User className="h-5 w-5" />
                            {t.header.profile}
                          </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full rounded-xl justify-start h-12" onClick={() => setIsOpen(false)}>
                          <Link href="/my-bookings" className="flex items-center gap-3">
                            <CalendarPlus className="h-5 w-5" />
                            {t.header.myBookings}
                          </Link>
                        </Button>
                      </div>
                      <Button variant="destructive" className="w-full rounded-xl" onClick={handleLogout}>
                        <LogOut className="ml-2 h-4 w-4" />
                        {t.header.logout}
                      </Button>
                    </div>
                  ) : (
                    <LoginButton className="w-full rounded-xl py-6 text-lg">
                      {t.header.login}
                    </LoginButton>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
