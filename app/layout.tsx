import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import Script from "next/script"
import { EnsureTheme } from "@/components/ensure-theme"

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
    <html lang="en" suppressHydrationWarning className="no-flash">
      <head>
        {/* Enhanced flash prevention script - runs as early as possible */}
        <Script id="prevent-flash" strategy="beforeInteractive">
          {`
    (function() {
      try {
        // Get stored theme or use system preference with a more reliable fallback
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Determine if dark mode should be active
        const isDark = 
          storedTheme === 'dark' || 
          (storedTheme !== 'light' && systemPrefersDark);
        
        // Apply theme IMMEDIATELY before any rendering
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
          document.documentElement.style.backgroundColor = '#030303';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
          document.documentElement.style.backgroundColor = '#ffffff';
        }
        
        // Create a style element to ensure consistent background during transitions
        const style = document.createElement('style');
        style.innerHTML = \`
          html, body, #__next, main, div {
            transition: background-color 0s !important;
            background-color: \${isDark ? '#030303' : '#ffffff'} !important;
          }
          
          @media (prefers-color-scheme: dark) {
            :root:not(.light) {
              color-scheme: dark;
              background-color: #030303 !important;
            }
          }
          
          @media (prefers-color-scheme: light) {
            :root:not(.dark) {
              color-scheme: light;
              background-color: #ffffff !important;
            }
          }
        \`;
        document.head.appendChild(style);
        
        // Remove the style tag after the page has fully loaded
        window.addEventListener('load', function() {
          setTimeout(function() {
            document.head.removeChild(style);
          }, 300);
        });
      } catch (e) {
        console.error('Theme initialization error:', e);
      }
    })();
  `}
        </Script>

        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <EnsureTheme />
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
