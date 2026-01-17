import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { FloatingActionButton } from "@/components/layout/floating-action-button";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from "@/providers/theme-provider";

export const metadata: Metadata = {
  title: 'صحتي | Sehaty',
  description: 'تطبيق صحتي - حلول صحية شاملة',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

import { LanguageProvider } from "@/contexts/language-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700;800&display=swap" rel="stylesheet" />
        {/* We add other fonts for English if needed, but Cairo works for both */}
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <FirebaseClientProvider>
              <div className="relative flex min-h-dvh flex-col bg-background transition-colors duration-300">
                <Header />
                <main className="flex-1">{children}</main>
                <FloatingActionButton />
                <Footer />
              </div>
            </FirebaseClientProvider>
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
