import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StethoscopeIcon } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <StethoscopeIcon className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">صحتي</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="#">تسجيل الدخول</Link>
          </Button>
          <Button asChild>
            <Link href="#">إنشاء حساب</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
