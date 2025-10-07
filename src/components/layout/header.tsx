"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StethoscopeIcon, LogOut, Loader2, Menu, Languages, Heart } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
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
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "#", label: "الصيدلية" },
    { href: "#", label: "المعمل" },
    { href: "#", label: "العيادات" },
];

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  const userMenu = (
      <>
        {isUserLoading ? (
             <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                    <AvatarFallback className="bg-muted text-foreground font-bold">{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'مستخدم'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/my-bookings">حجوزاتي</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50/50">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">إنشاء حساب</Link>
              </Button>
            </div>
        )}
      </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
                <StethoscopeIcon className="h-8 w-8 text-primary" />
                <span className="font-bold font-headline text-2xl text-foreground">صحتي</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
                {navLinks.map(link => (
                    <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>
                ))}
            </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon"><Languages className="h-5 w-5 text-muted-foreground" /></Button>
          <Button variant="ghost" size="icon"><Heart className="h-5 w-5 text-muted-foreground" /></Button>
          {userMenu}
        </div>
        
        <div className="md:hidden flex items-center">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <nav className="flex flex-col gap-6 text-lg font-medium mt-10">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
                        ))}
                    </nav>
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex flex-col gap-4">
                           {userMenu}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
