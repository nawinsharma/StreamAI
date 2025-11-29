import { NextRequest, NextResponse } from "next/server";
import { indexPdf } from "@/lib/rag/indexing";
import { generateSummary as generateSummaryFromChat } from "@/lib/rag/chat";
import { RAG_LIMITS } from "@/lib/rag/limits";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Check file size limit
    if (file.size > RAG_LIMITS.PDF_MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `PDF file is too large. Maximum size is ${RAG_LIMITS.PDF_MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Generate collection name
    const fileName = file.name.replace(/\.pdf$/i, "");
    const collectionName = `pdf_${slugify(fileName, { lower: true, strict: true })}_${Date.now()}`;

    // Index the PDF
    const indexResult = await indexPdf(file, collectionName);

    if (!indexResult.success) {
      return NextResponse.json(
        { error: "Failed to index PDF" },
        { status: 500 }
      );
    }

    // Generate summary
    let summary;
    try {
      summary = await generateSummaryFromChat(collectionName);
    } catch (error) {
      console.error("Summary generation failed:", error);
      summary = `PDF document with ${indexResult.documentsCount} sections indexed successfully.`;
    }

    return NextResponse.json(
      {
        success: true,
        message: "PDF processed successfully",
        name: fileName,
        collectionName,
        summary,
        documentsCount: indexResult.documentsCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("PDF processing error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process PDF" 
      },
      { status: 500 }
    );
  }
} 