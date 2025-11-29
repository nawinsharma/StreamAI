import { NextRequest, NextResponse } from "next/server";
import { indexText } from "@/lib/rag/indexing";
import { generateSummary } from "@/lib/rag/chat";
import { RAG_LIMITS } from "@/lib/rag/limits";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get("text") as string;
    const title = formData.get("title") as string;

    if (!text || !title) {
      return NextResponse.json(
        { error: "Both text content and title are required" },
        { status: 400 }
      );
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: "Text content is too short (minimum 10 characters)" },
        { status: 400 }
      );
    }

    // Check character limit
    if (text.length > RAG_LIMITS.TEXT_MAX_CHARACTERS) {
      return NextResponse.json(
        { error: `Text content is too long (${text.length} characters). Maximum is ${RAG_LIMITS.TEXT_MAX_CHARACTERS} characters.` },
        { status: 400 }
      );
    }

    // Generate collection name
    const collectionName = `text_${slugify(title, { lower: true, strict: true })}_${Date.now()}`;

    // Index the text
    const indexResult = await indexText(text.trim(), title.trim(), collectionName);

    if (!indexResult.success) {
      return NextResponse.json(
        { error: "Failed to index text" },
        { status: 500 }
      );
    }

    // Generate summary
    let summary;
    try {
      summary = await generateSummary(collectionName);
    } catch (error) {
      console.error("Summary generation failed:", error);
      summary = `Text content "${title}" with ${indexResult.documentsCount} sections indexed successfully.`;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Text processed successfully",
        name: title,
        collectionName,
        summary,
        documentsCount: indexResult.documentsCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Text processing error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process text" 
      },
      { status: 500 }
    );
  }
} 