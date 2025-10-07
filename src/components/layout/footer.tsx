import Link from "next/link"
import { StethoscopeIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-8 md:px-8 bg-secondary/50 border-t mt-16">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
            <StethoscopeIcon className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg text-foreground">صحتي</span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © 2024 صحتي. جميع الحقوق محفوظة.
        </p>
        <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                سياسة الخصوصية
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                شروط الاستخدام
            </Link>
        </div>
      </div>
    </footer>
  );
}
