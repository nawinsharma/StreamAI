import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { DOMAIN_CONFIG } from "./domain-config";

export const auth = betterAuth({
   database: prismaAdapter(prisma, {
      provider: "postgresql"
   }),
   emailAndPassword: {
      enabled: true,
      autoSignIn: true
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
            max: 5, // Limit RAG operations to prevent API overload (5 per minute)
         },
         "/api/chat": {
            window: 60,
            max: 30, // Limit chat requests
         }
      }
   },
   session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 24 hours
      cookieCache: {
         enabled: true,
         maxAge: 60 * 5 // 5 minutes
      }
   },
   cors: {
      origin: DOMAIN_CONFIG.ALLOWED_DOMAINS,
      credentials: true
   },
   onError: (error: Error, request: Request) => {
      console.error('Auth error:', {
         error: error.message,
         url: request.url,
         method: request.method,
         timestamp: new Date().toISOString()
      });
   }
})