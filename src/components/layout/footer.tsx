import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-16 bg-muted/50 border-t mt-20">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-right">
        <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                <span className="font-bold font-headline text-xl text-foreground">صحتي</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              منصتك الصحية المتكاملة، لرعاية أفضل وحياة أسعد.
            </p>
        </div>

        <div>
            <h4 className="font-bold text-lg mb-4">روابط سريعة</h4>
            <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">عنّا</Link></li>
                <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">الخدمات</Link></li>
                <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">الأسئلة الشائعة</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">تواصل</Link></li>
            </ul>
        </div>
        
        <div>
            <h4 className="font-bold text-lg mb-4">المساعدة والسياسات</h4>
            <ul className="space-y-3">
                <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">مركز المساعدة</Link></li>
                <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">سياسة الخصوصية</Link></li>
                <li><Link href="/terms-of-use" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">شروط الاستخدام</Link></li>
            </ul>
        </div>

        <div>
            <h4 className="font-bold text-lg mb-4">وسائل التواصل الاجتماعي</h4>
            <div className="flex gap-4 justify-center md:justify-start">
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
