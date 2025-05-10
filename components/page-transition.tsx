"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  // Handle path changes
  useEffect(() => {
    // Determine theme
    const isDark = document.documentElement.classList.contains("dark")
    const bgColor = isDark ? "#030303" : "#ffffff"
    const textColor = isDark ? "#fafafa" : "#0a0a0a"

    // Update root element styles
    document.documentElement.style.setProperty("--transition-background", bgColor)

    // Temporarily disable transitions to prevent flashes
    document.documentElement.classList.remove("transitions-enabled")

    // Set background for all major containers
    document.body.style.backgroundColor = bgColor
    document.body.style.color = textColor

    // Find and update all main wrappers
    const mainElements = document.querySelectorAll("main, [data-nextjs-scroll-focus-boundary], #__next")
    mainElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.backgroundColor = bgColor
        el.style.color = textColor
      }
    })

    setIsTransitioning(true)

    // Short timeout to ensure the transition is smooth
    const timeout = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)

      // Re-enable transitions
      setTimeout(() => {
        document.documentElement.classList.add("transitions-enabled")
      }, 100)
    }, 10)

    return () => clearTimeout(timeout)
  }, [pathname, children])

  return (
    <div
      className="page-transition-wrapper"
      style={{
        opacity: isTransitioning ? 0.98 : 1,
        transition: "opacity 100ms ease",
        backgroundColor: "inherit",
        color: "inherit",
        minHeight: "100vh",
      }}
    >
      {displayChildren}
    </div>
  )
}
