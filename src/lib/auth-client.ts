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
   baseURL: getBaseURL(),
   fetchOptions: {
      onError: async (context) => {
         const { response } = context;
         
         // Handle rate limiting
         if (response.status === 429) {
            const retryAfter = response.headers.get("X-Retry-After");
            console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
            
            // Don't show toast for session checks to avoid spam
            const url = new URL(context.request.url);
            if (!url.pathname.includes('get-session')) {
               // Only show toast for user-initiated actions
               const message = `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
               // Note: We can't import toast here due to circular dependencies
               // The calling component should handle this
               console.error(message);
            }
         }
         
         // Handle other auth errors
         if (response.status === 401) {
            console.warn("Authentication failed - session may have expired");
         }
      }
   }
})