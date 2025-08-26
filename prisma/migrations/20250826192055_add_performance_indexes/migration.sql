-- CreateIndex
CREATE INDEX "chat_userId_pinned_updatedAt_idx" ON "public"."chat"("userId", "pinned", "updatedAt");

-- CreateIndex
CREATE INDEX "chat_isPublic_idx" ON "public"."chat"("isPublic");

-- CreateIndex
CREATE INDEX "rag_chat_userId_idx" ON "public"."rag_chat"("userId");

-- CreateIndex
CREATE INDEX "rag_chat_isPublic_idx" ON "public"."rag_chat"("isPublic");

-- CreateIndex (PostgreSQL partial index for true-public chats)
CREATE INDEX IF NOT EXISTS "chat_is_public_true_idx"
ON "public"."chat"(id)
WHERE "isPublic" = true;
