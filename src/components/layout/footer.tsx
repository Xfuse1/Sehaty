
import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-16 bg-muted/50 border-t mt-20">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-right">
        <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <rect x="0.5" y="0.5" width="23" height="23" rx="3.5" fill="white" stroke="#E5E7EB"/>
                    <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor"/>
                    <path d="M12 18.35L10.55 17.03C6.4 13.25 4 11.12 4 8.5C4 6.5 5.5 5 7.5 5C9.04 5 10.5 5.95 11.07 7.3H12.94C13.5 5.95 14.96 5 16.5 5C18.5 5 20 6.5 20 8.5C20 11.12 17.6 13.25 13.45 17.04L12 18.35Z" fill="#A78BFA"/>
                </svg>
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
