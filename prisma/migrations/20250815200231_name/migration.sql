/*
  Warnings:

  - Made the column `userId` on table `chat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."chat" ALTER COLUMN "userId" SET NOT NULL;
