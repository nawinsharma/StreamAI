import { NextRequest, NextResponse } from "next/server";
import { indexDocument } from "@/lib/rag/indexing";
import { generateSummary as generateSummaryFromChat } from "@/lib/rag/chat";
import { RAG_LIMITS, RAG_DOCUMENT_EXTENSIONS, isSupportedRagDocument } from "@/lib/rag/limits";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // Field is still "pdf" for backwards compatibility, but accepts any document.
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!isSupportedRagDocument(file.name)) {
      return NextResponse.json(
        { error: `Unsupported file type. Supported: ${RAG_DOCUMENT_EXTENSIONS.join(", ")}.` },
        { status: 400 }
      );
    }

    // Check file size limit
    if (file.size > RAG_LIMITS.PDF_MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${RAG_LIMITS.PDF_MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Generate collection name (strip the extension, whatever it is)
    const fileName = file.name.replace(/\.[^.]+$/, "");
    const collectionName = `doc_${slugify(fileName, { lower: true, strict: true })}_${Date.now()}`;

    // Index the document
    const indexResult = await indexDocument(file, collectionName);

    if (!indexResult.success) {
      return NextResponse.json(
        { error: "Failed to index document" },
        { status: 500 }
      );
    }

    // Generate summary
    let summary;
    try {
      summary = await generateSummaryFromChat(collectionName);
    } catch (error) {
      console.error("Summary generation failed:", error);
      summary = `Document with ${indexResult.documentsCount} sections indexed successfully.`;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Document processed successfully",
        name: fileName,
        collectionName,
        summary,
        documentsCount: indexResult.documentsCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Document processing error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process document"
      },
      { status: 500 }
    );
  }
} 