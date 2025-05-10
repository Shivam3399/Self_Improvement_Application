import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import Script from "next/script"

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Ensure text remains visible during font loading
  preload: true,
  fallback: ["system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: "Self Improvement App",
  description: "Track your habits and improve yourself",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#030303" },
  ],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Enhanced flash prevention script - runs as early as possible */}
        <Script id="prevent-flash" strategy="beforeInteractive">
          {`
            (function() {
              // Apply a base background color immediately to prevent white flash
              document.documentElement.style.backgroundColor = '#030303';
              
              // Check if dark mode is preferred
              const isDarkMode = localStorage.getItem('theme') === 'dark' || 
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
              
              // Apply dark class immediately to prevent flash
              if (isDarkMode) {
                document.documentElement.classList.add('dark');
                document.documentElement.style.backgroundColor = '#030303';
                document.documentElement.style.color = '#fafafa';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.backgroundColor = '#ffffff';
                document.documentElement.style.color = '#0a0a0a';
              }
              
              // Listen for theme changes and apply them immediately
              window.addEventListener('storage', function(e) {
                if (e.key === 'theme') {
                  if (e.newValue === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#030303';
                    document.documentElement.style.color = '#fafafa';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.backgroundColor = '#ffffff';
                    document.documentElement.style.color = '#0a0a0a';
                  }
                }
              });
            })();
          `}
        </Script>

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
