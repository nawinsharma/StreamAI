-- AlterTable
ALTER TABLE "public"."chat" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."rag_chat" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;
