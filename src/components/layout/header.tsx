"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StethoscopeIcon, LogOut, Loader2, Menu, Languages, UserCircle } from 'lucide-react';
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
    { href: "#", label: "السجلات" },
    { href: "#services", label: "الخدمات" },
    { href: "#", label: "المواعيد" },
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
             <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
        ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <span className="font-semibold text-primary-foreground hidden sm:inline">مرحباً، {user.displayName || 'زائر'}</span>
                  <Avatar className="h-9 w-9 border-2 border-border">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                    <AvatarFallback className="bg-primary-foreground text-primary font-bold">{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </div>
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
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                      <Languages className="ml-2 h-5 w-5" />
                      English
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>العربية</DropdownMenuItem>
                  <DropdownMenuItem>English</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild>
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
            </div>
        )}
      </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/" className="hidden md:flex items-center gap-2">
                <span className="font-bold text-xl">صحتي</span>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary-foreground text-primary"><UserCircle /></AvatarFallback>
                </Avatar>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
                {navLinks.map(link => (
                    <Link key={link.href} href={link.href} className="text-sm font-medium transition-colors hover:text-white/80">{link.label}</Link>
                ))}
            </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {userMenu}
        </div>
        
        <div className="md:hidden flex items-center flex-1 justify-between">
          <Sheet>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                      <Menu className="h-6 w-6" />
                  </Button>
              </SheetTrigger>
              <SheetContent side="right">
                  <nav className="flex flex-col gap-6 text-lg font-medium mt-10">
                      {navLinks.map(link => (
                          <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
                      ))}
                  </nav>
              </SheetContent>
          </Sheet>
          {userMenu}
        </div>
      </div>
    </header>
  );
}
