import Link from "next/link"
import { StethoscopeIcon, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-16 bg-gradient-to-t from-muted/50 to-muted/30 border-t mt-20">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 mb-2">
                <StethoscopeIcon className="h-8 w-8 text-primary" />
                <span className="font-bold font-headline text-xl text-foreground">صحتي</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              منصتك الصحية المتكاملة، لرعاية أفضل وحياة أسعد.
            </p>
        </div>

        <div>
            <h4 className="font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-3">
                <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">الرئيسية</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">الصيدلية</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">المعمل</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">العيادات</Link></li>
            </ul>
        </div>
        
        <div>
            <h4 className="font-bold text-lg mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
                <li className="text-sm text-muted-foreground">+966 12 345 6789</li>
                <li className="text-sm text-muted-foreground">contact@sehaty.com</li>
                <li className="text-sm text-muted-foreground">الرياض، المملكة العربية السعودية</li>
            </ul>
        </div>

        <div>
            <h4 className="font-bold text-lg mb-4">تابعنا</h4>
            <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></Link>
            </div>
        </div>
      </div>
      <div className="container mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © 2024 صحتي. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
