-- CreateTable
CREATE TABLE "public"."rag_collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collectionName" TEXT NOT NULL,
    "summary" TEXT,
    "type" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rag_document" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "pageNumber" INTEGER,
    "chunkIndex" INTEGER,
    "collectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rag_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rag_chat" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rag_message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "sources" JSONB,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rag_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rag_collection_collectionName_key" ON "public"."rag_collection"("collectionName");

-- AddForeignKey
ALTER TABLE "public"."rag_collection" ADD CONSTRAINT "rag_collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rag_document" ADD CONSTRAINT "rag_document_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."rag_collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rag_chat" ADD CONSTRAINT "rag_chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rag_chat" ADD CONSTRAINT "rag_chat_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."rag_collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rag_message" ADD CONSTRAINT "rag_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."rag_chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
