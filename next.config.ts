import type { NextConfig } from "next";

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'GOOGLE_API_KEY',
  'GOOGLE_AI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'MEM0_API_KEY',
  'QDRANT_URL',
  'QDRANT_API_KEY'
];

// Check for missing environment variables in production
if (process.env.NODE_ENV === 'production') {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missingVars.join(', ')}`);
  }
  
  // Additional production-specific checks
  if (process.env.BETTER_AUTH_SECRET === 'randomsecret123') {
    throw new Error('BETTER_AUTH_SECRET must be changed from default value in production');
  }
  
  if (process.env.BETTER_AUTH_URL?.includes('localhost')) {
    throw new Error('BETTER_AUTH_URL must be updated to production URL');
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.weatherapi.com',
      },
      {
        protocol: 'http',
        hostname: 'openweathermap.org',
      },
      {
        protocol: 'https',
        hostname: 'api.openweathermap.org',
      },
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
      }
    ],
  },
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
  // Add experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Add logging for production debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Add environment variable validation
  env: {
    CUSTOM_KEY: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  },
};

export default nextConfig;
