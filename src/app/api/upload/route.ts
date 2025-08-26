import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadAnyToCloudinary } from "@/lib/cloudinary";
import { extractTextFromFile, truncateText } from "@/lib/extract";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const chatId = form.get('chatId') as string | null;
    const file = form.get('file') as File | null;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // Ensure chat belongs to user
    const chat = await prisma.chat.findFirst({ where: { id: chatId, userId: session.user.id } });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploaded = await uploadAnyToCloudinary({
      buffer,
      filename: file.name,
      mimeType: file.type,
      folder: `users/${session.user.id}/chats/${chatId}`,
    });

    // Extract text if possible for RAG context preview
    const extracted = await extractTextFromFile(buffer, file.type, file.name);

    // Return metadata for client to include with next message
    const attachmentMeta = {
      name: file.name,
      mimeType: file.type,
      size: buffer.length,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
      width: (uploaded as any).width ?? null,
      height: (uploaded as any).height ?? null,
      extractedTextPreview: extracted ? truncateText(extracted, 12000) : null,
    };

    return NextResponse.json({ success: true, attachment: attachmentMeta });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
} 