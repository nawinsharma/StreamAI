import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

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
      max: 10,
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
         ? [process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL : 'http://localhost:3000']
         : ['http://localhost:3000'],
      credentials: true
   }
})