import { NextRequest, NextResponse } from "next/server";
import { indexWebsite } from "@/lib/rag/indexing";
import { generateSummary } from "@/lib/rag/chat";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const websiteUrl = formData.get("website") as string;

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "No website URL provided" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(websiteUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Generate collection name
    const urlForName = websiteUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .replace(/[\/\?#]/g, "_");
    const collectionName = `website_${slugify(urlForName, { lower: true, strict: true })}_${Date.now()}`;

    // Index the website
    const indexResult = await indexWebsite(websiteUrl, collectionName);

    if (!indexResult.success) {
      return NextResponse.json(
        { error: "Failed to index website" },
        { status: 500 }
      );
    }

    // Generate summary
    let summary;
    try {
      summary = await generateSummary(collectionName);
    } catch (error) {
      console.error("Summary generation failed:", error);
      summary = `Website content with ${indexResult.documentsCount} sections indexed successfully.`;
    }

    // Extract site name from URL
    const siteName = new URL(websiteUrl).hostname;

    return NextResponse.json(
      {
        success: true,
        message: "Website processed successfully",
        name: siteName,
        collectionName,
        summary,
        sourceUrl: websiteUrl,
        documentsCount: indexResult.documentsCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Website processing error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process website" 
      },
      { status: 500 }
    );
  }
} 