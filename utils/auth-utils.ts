/**
 * Check if the user is authenticated by checking multiple sources
 */
export function isUserAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false // Not authenticated on server
  }

  try {
    // Check multiple sources for authentication
    const userData = localStorage.getItem("userData")
    const rememberedUser = localStorage.getItem("rememberedUser")
    const sessionAuth = sessionStorage.getItem("isAuthenticated")
    const justRegistered = localStorage.getItem("justRegistered")

    // Log authentication state for debugging
    console.log("Auth check - userData exists:", !!userData)
    console.log("Auth check - rememberedUser exists:", !!rememberedUser)
    console.log("Auth check - sessionAuth exists:", !!sessionAuth)
    console.log("Auth check - justRegistered:", justRegistered)

    // If any of these exist, consider the user authenticated
    return !!(userData || rememberedUser || sessionAuth === "true" || justRegistered === "true")
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

/**
 * Get the current user's email from localStorage
 */
export function getUserEmail(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    // Try userData first
    const userData = localStorage.getItem("userData")
    if (userData) {
      const parsedUserData = JSON.parse(userData)
      if (parsedUserData.email) {
        return parsedUserData.email
      }
    }

    // Then try rememberedUser
    const rememberedUser = localStorage.getItem("rememberedUser")
    if (rememberedUser) {
      const parsedRememberedUser = JSON.parse(rememberedUser)
      if (parsedRememberedUser.email) {
        return parsedRememberedUser.email
      }
    }

    return null
  } catch (error) {
    console.error("Error getting user email:", error)
    return null
  }
}

/**
 * Get the current user's username from localStorage
 */
export function getUserUsername(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const parsedUserData = JSON.parse(userData)
      if (parsedUserData.username) {
        return parsedUserData.username
      }
      // If no username but email exists, use the part before @ as username
      if (parsedUserData.email) {
        return parsedUserData.email.split("@")[0]
      }
    }

    return null
  } catch (error) {
    console.error("Error getting username:", error)
    return null
  }
}

/**
 * Log out the user by clearing all authentication data
 */
export function logoutUser(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem("userData")
    localStorage.removeItem("justRegistered")
    sessionStorage.removeItem("isAuthenticated")
    // Optionally keep rememberedUser for convenience
    console.log("User logged out successfully")
  } catch (error) {
    console.error("Error logging out:", error)
  }
}

/**
 * Get authentication debug information
 */
export function getAuthDebugInfo(): string {
  if (typeof window === "undefined") {
    return "Not running in a browser environment."
  }

  try {
    const userData = localStorage.getItem("userData")
    const rememberedUser = localStorage.getItem("rememberedUser")
    const sessionAuth = sessionStorage.getItem("isAuthenticated")
    const justRegistered = localStorage.getItem("justRegistered")
    const theme = localStorage.getItem("theme")

    return `
      Authentication Debug Information:
      -----------------------------------
      userData: ${userData || "null"}
      rememberedUser: ${rememberedUser || "null"}
      sessionAuth: ${sessionAuth || "null"}
      justRegistered: ${justRegistered || "null"}
      theme: ${theme || "null"}
    `
  } catch (error) {
    return `Error getting debug info: ${error}`
  }
}
