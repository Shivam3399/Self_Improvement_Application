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
    // Get the current theme
    const isDark = document.documentElement.classList.contains("dark")
    const bgColor = isDark ? "#030303" : "#ffffff"

    // Set a background color on the main element to prevent flash
    const mainElement = document.querySelector("main")
    if (mainElement) {
      mainElement.style.backgroundColor = bgColor
    }

    setIsTransitioning(true)

    // Short timeout to ensure the transition is smooth
    const timeout = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, 10)

    return () => clearTimeout(timeout)
  }, [pathname, children])

  return (
    <div
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
