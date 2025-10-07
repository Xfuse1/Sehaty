
import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-16 bg-muted/50 border-t mt-20">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-right">
        <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <rect width="24" height="24" rx="4" fill="currentColor"/>
                    <path d="M12.0002 17.4346L11.0556 16.5919C7.81116 13.7291 5.5 11.7025 5.5 9.16016C5.5 7.15967 7.15967 5.5 9.16016 5.5C10.2227 5.5 11.2334 5.95264 12.0002 6.70264C12.7671 5.95264 13.7778 5.5 14.8403 5.5C16.8408 5.5 18.5005 7.15967 18.5005 9.16016C18.5005 11.7025 16.1893 13.7291 12.9449 16.5919L12.0002 17.4346Z" fill="#A78BFA"/>
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
