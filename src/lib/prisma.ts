import { PrismaClient } from "@/generated/prisma";

const prismaClientSingleton = () => {
   return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
         db: {
            url: process.env.DATABASE_URL,
         },
      },
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

export default prisma;