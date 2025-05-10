"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Apply theme immediately on component mount
  React.useEffect(() => {
    // Get the current theme from localStorage
    const currentTheme = localStorage.getItem("theme") || "system"
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    // Apply theme immediately
    if (currentTheme === "dark" || (currentTheme === "system" && systemPrefersDark)) {
      document.documentElement.classList.add("dark")
      document.documentElement.style.backgroundColor = "#030303"
      document.documentElement.style.color = "#fafafa"
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.style.backgroundColor = "#ffffff"
      document.documentElement.style.color = "#0a0a0a"
    }

    // Re-enable transitions after the initial render
    setTimeout(() => {
      document.documentElement.classList.add("transitions-enabled")
    }, 300)

    setMounted(true)
  }, [])

  // Listen for theme changes
  React.useEffect(() => {
    if (!mounted) return

    // Create a MutationObserver to watch for theme class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark")
          if (isDark) {
            document.documentElement.style.backgroundColor = "#030303"
            document.documentElement.style.color = "#fafafa"
          } else {
            document.documentElement.style.backgroundColor = "#ffffff"
            document.documentElement.style.color = "#0a0a0a"
          }
        }
      })
    })

    // Start observing the document with the configured parameters
    observer.observe(document.documentElement, { attributes: true })

    return () => {
      observer.disconnect()
      document.documentElement.classList.remove("transitions-enabled")
    }
  }, [mounted])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
