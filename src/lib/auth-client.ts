import { createAuthClient } from "better-auth/react"

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BETTER_AUTH_URL || 'https://streamai.nawin.xyz' || 'https://zen.nawin.xyz';
  }
  return 'http://localhost:3000';
};

export const authClient = createAuthClient({
   baseURL: getBaseURL(),
   fetchOptions: {
      onError: async (context) => {
         const { response } = context;
         
         if (response.status === 429) {
            const retryAfter = response.headers.get("X-Retry-After");
            console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
            
            const url = new URL(context.request.url);
            if (!url.pathname.includes('get-session')) {
               const message = `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
               console.error(message);
            }
         }
         
         // Handle other auth errors
         if (response.status === 401) {
            console.warn("Authentication failed - session may have expired");
         }
         
         if (response.status === 0 || response.type === 'opaque') {
            console.error("CORS error detected. Check your domain configuration and ensure the auth server is running.");
         }
      }
   }
})