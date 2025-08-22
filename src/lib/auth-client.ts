import { createAuthClient } from "better-auth/react"

// Function to get the base URL for different environments
function getBaseURL() {
  // In production, use the BETTER_AUTH_URL if set, otherwise construct from VERCEL_URL or current domain
  if (process.env.NODE_ENV === 'production') {
    if (process.env.BETTER_AUTH_URL) {
      return process.env.BETTER_AUTH_URL;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Fallback for production
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  
  // Development environment
  return process.env.BETTER_AUTH_URL || 'http://localhost:3000';
}

export const authClient = createAuthClient({
   baseURL: getBaseURL()
})