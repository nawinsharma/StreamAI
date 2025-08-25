import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

// Validate required auth environment variables
const validateAuthConfig = () => {
  const requiredVars = [
    'GOOGLE_CLIENT_ID', 
    'GOOGLE_CLIENT_SECRET',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL'
  ];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required auth environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate configuration on startup
validateAuthConfig();

export const auth = betterAuth({
   database: prismaAdapter(prisma, {
      provider: "postgresql"
   }),
   emailAndPassword: {
      enabled: true,
      autoSignIn: false
   },
   socialProviders: {
      google: {
         clientId: process.env.GOOGLE_CLIENT_ID as string,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
   },
   rateLimit: {
      window: 60, // time window in seconds
      max: 100, // Increased from 10 to 100 to match Better Auth defaults
      // Add custom rules for specific endpoints
      customRules: {
         "/get-session": {
            window: 60,
            max: 50, // Allow more frequent session checks
         },
         "/sign-in": {
            window: 60,
            max: 5, // Keep sign-in attempts limited
         },
         "/sign-up": {
            window: 60,
            max: 5, // Keep sign-up attempts limited
         },
         "/api/upload": {
            window: 60,
            max: 10, // Limit file uploads
         },
         "/api/rag/*": {
            window: 60,
            max: 20, // Limit RAG operations
         },
         "/api/chat": {
            window: 60,
            max: 30, // Limit chat requests
         }
      }
   },
   // Add session configuration for better persistence
   session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 24 hours
      cookieCache: {
         enabled: true,
         maxAge: 60 * 5 // 5 minutes
      }
   },
   // Add better CORS configuration for production
   cors: {
      origin: process.env.NODE_ENV === 'production' 
         ? [
            process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? 
               `https://${process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL}` : 
               'http://localhost:3000'
           ]
         : ['http://localhost:3000'],
      credentials: true
   },
   // Add better error handling
   onError: (error: Error, request: Request) => {
      console.error('Auth error:', {
         error: error.message,
         url: request.url,
         method: request.method,
         timestamp: new Date().toISOString()
      });
   }
})