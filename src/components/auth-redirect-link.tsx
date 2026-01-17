"use client"

import { useRouter, usePathname } from "next/navigation"
import { ReactNode, MouseEvent } from "react"

interface AuthRedirectLinkProps {
  href: "/login" | "/signup"
  children: ReactNode
  className?: string
}

/**
 * مكون لإنشاء رابط تسجيل دخول/إنشاء حساب مع حفظ الصفحة الحالية
 * سيتم إعادة توجيه المستخدم للصفحة الأصلية بعد تسجيل الدخول
 */
export function AuthRedirectLink({ href, children, className }: AuthRedirectLinkProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // حفظ الصفحة الحالية في sessionStorage
    if (pathname !== "/login" && pathname !== "/signup") {
      console.log('💾 AuthRedirectLink: Saving redirect path:', pathname)
      sessionStorage.setItem('redirectAfterLogin', pathname)
      console.log('✅ Saved to sessionStorage:', sessionStorage.getItem('redirectAfterLogin'))
    } else {
      console.log('⚠️ AuthRedirectLink: Not saving redirect - already on auth page')
    }
    
    // التوجيه للصفحة المطلوبة
    router.push(href)
  }
  
  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
