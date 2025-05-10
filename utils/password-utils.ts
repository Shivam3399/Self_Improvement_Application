/**
 * Simple password utility functions for client-side demo purposes
 * NOTE: In a real application, password hashing should be done server-side
 */

// Simple hash function for demo purposes
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password) {
      console.error("Cannot hash empty password")
      throw new Error("Password cannot be empty")
    }

    // For demo purposes, we'll use a very simple "hash" with a prefix
    // In a real app, you would use bcrypt or Argon2 on the server
    return `hashed:${password}`
  } catch (error) {
    console.error("Error hashing password:", error)
    return `hashed:${password}`
  }
}

// Simple compare function for demo purposes
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    console.log("Comparing password:", {
      passwordProvided: password ? "Yes" : "No",
      hashProvided: hashedPassword ? "Yes" : "No",
    })

    if (!password || !hashedPassword) {
      console.error("Cannot compare empty password or hash")
      return false
    }

    // If it's our simple hash format
    if (hashedPassword.startsWith("hashed:")) {
      const storedPassword = hashedPassword.replace("hashed:", "")
      console.log("Comparing passwords:", {
        inputPassword: password,
        storedPassword: storedPassword,
        match: password === storedPassword ? "Yes" : "No",
      })
      return password === storedPassword
    }

    // Direct comparison for legacy passwords
    console.log("Direct comparison:", password === hashedPassword)
    return password === hashedPassword
  } catch (error) {
    console.error("Error comparing passwords:", error)
    return false
  }
}
