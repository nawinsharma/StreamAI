import { PrismaClient } from "@/generated/prisma";

// Validate database URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const prismaClientSingleton = () => {
   return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
         db: {
            url: process.env.DATABASE_URL,
         },
      },
      // Add better error handling for production
      errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
   });
};

declare const globalThis: {
   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Always cache to prevent connection pool exhaustion
if (!globalThis.prismaGlobal) {
   globalThis.prismaGlobal = prisma;
}

// Add connection health check
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;