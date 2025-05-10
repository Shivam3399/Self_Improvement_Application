"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function EnsureTheme() {
  const pathname = usePathname()

  useEffect(() => {
    // This runs on every route change
    const applyTheme = () => {
      try {
        // Get stored theme
        const storedTheme = localStorage.getItem("theme")
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

        // Determine if dark mode should be active
        const isDark = storedTheme === "dark" || (storedTheme !== "light" && systemPrefersDark)

        // Ensure correct class is applied
        if (isDark && !document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.add("dark")
        } else if (!isDark && document.documentElement.classList.contains("dark")) {
          document.documentElement.classList.remove("dark")
        }

        // Set background colors
        const bgColor = isDark ? "#030303" : "#ffffff"
        const textColor = isDark ? "#fafafa" : "#0a0a0a"

        // Apply to root elements
        document.documentElement.style.backgroundColor = bgColor
        document.documentElement.style.color = textColor
        document.body.style.backgroundColor = bgColor
        document.body.style.color = textColor

        // Find all app wrappers and ensure they have the background color
        const appContainers = document.querySelectorAll(
          "main, #__next, [data-nextjs-scroll-focus-boundary], div.page-transition-wrapper",
        )
        appContainers.forEach((container) => {
          if (container instanceof HTMLElement) {
            container.style.backgroundColor = bgColor
            container.style.color = textColor
          }
        })
      } catch (e) {
        console.error("Theme application error:", e)
      }
    }

    // Apply immediately and when theme might change
    applyTheme()
    window.addEventListener("storage", applyTheme)
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme)

    return () => {
      window.removeEventListener("storage", applyTheme)
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", applyTheme)
    }
  }, [pathname])

  return null // This component doesn't render anything
}
