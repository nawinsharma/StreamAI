import { NextRequest, NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbConnection = await checkDatabaseConnection();
    
    // Check all environment variables from user's configuration
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
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    const envStatus = missingEnvVars.length === 0 ? 'healthy' : 'unhealthy';
    
    // Check external services
    const externalServices = {
      google: {
        api: !!process.env.GOOGLE_API_KEY,
        ai: !!process.env.GOOGLE_AI_API_KEY,
        generative: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        oauth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
      },
      cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      qdrant: !!(process.env.QDRANT_URL && process.env.QDRANT_API_KEY),
      mem0: !!process.env.MEM0_API_KEY,
      auth: !!(process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_URL)
    };
    
    // Check for development vs production configuration
    const configWarnings = [];
    
    if (process.env.BETTER_AUTH_SECRET === 'randomsecret123') {
      configWarnings.push('BETTER_AUTH_SECRET is using default value - should be changed in production');
    }
    
    if (process.env.BETTER_AUTH_URL === 'http://localhost:3000') {
      configWarnings.push('BETTER_AUTH_URL is set to localhost - should be updated for production');
    }
    
    if (process.env.NODE_ENV === 'production' && process.env.BETTER_AUTH_URL?.includes('localhost')) {
      configWarnings.push('Production environment detected but using localhost URLs');
    }
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: dbConnection && envStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || 'unknown',
      services: {
        database: dbConnection ? 'healthy' : 'unhealthy',
        environment: envStatus,
        external: externalServices,
      },
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
      warnings: configWarnings.length > 0 ? configWarnings : undefined,
      // Add environment variable status (without exposing values)
      envVarStatus: {
        total: requiredEnvVars.length,
        present: requiredEnvVars.length - missingEnvVars.length,
        missing: missingEnvVars.length
      }
    };
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error("Health check error:", error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
