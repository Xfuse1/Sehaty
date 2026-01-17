"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface LoginButtonProps {
  children: ReactNode
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  asChild?: boolean
}

/**
 * زر لتسجيل الدخول مع حفظ الصفحة الحالية للعودة إليها
 */
export function LoginButton({ children, variant, size, className, asChild }: LoginButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    // حفظ الصفحة الحالية في sessionStorage
    if (pathname !== "/login" && pathname !== "/signup") {
      console.log('💾 LoginButton: Saving redirect path:', pathname)
      sessionStorage.setItem('redirectAfterLogin', pathname)
    } else {
      console.log('⚠️ LoginButton: Not saving redirect - already on auth page')
    }
    
    // الانتقال لصفحة تسجيل الدخول
    router.push('/login')
  }

  return (
    <Button 
      onClick={handleClick} 
      variant={variant} 
      size={size} 
      className={className}
      asChild={asChild}
    >
      {children}
    </Button>
  )
}

/**
 * زر لإنشاء حساب مع حفظ الصفحة الحالية للعودة إليها
 */
export function SignupButton({ children, variant, size, className, asChild }: LoginButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = () => {
    // حفظ الصفحة الحالية في sessionStorage
    if (pathname !== "/login" && pathname !== "/signup") {
      sessionStorage.setItem('redirectAfterLogin', pathname)
    }
    
    // الانتقال لصفحة إنشاء الحساب
    router.push('/signup')
  }

  return (
    <Button 
      onClick={handleClick} 
      variant={variant} 
      size={size} 
      className={className}
      asChild={asChild}
    >
      {children}
    </Button>
  )
}
