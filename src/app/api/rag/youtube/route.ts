import { NextRequest, NextResponse } from "next/server";
import { indexYoutube } from "@/lib/rag/indexing";
import { generateSummary } from "@/lib/rag/chat";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const youtubeUrl = formData.get("youtube") as string;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "No YouTube URL provided" },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    // Extract video ID for naming
    let videoId;
    try {
      const url = new URL(youtubeUrl);
      if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.slice(1);
      } else if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
      }
    } catch {
      videoId = 'unknown';
    }

    // Generate collection name
    const collectionName = `youtube_${slugify(videoId || 'video', { lower: true, strict: true })}_${Date.now()}`;

    // Index the YouTube video
    const indexResult = await indexYoutube(youtubeUrl, collectionName);

    if (!indexResult.success) {
      return NextResponse.json(
        { error: "Failed to index YouTube video" },
        { status: 500 }
      );
    }

    // Generate summary
    let summary;
    try {
      summary = await generateSummary(collectionName);
    } catch (error) {
      console.error("Summary generation failed:", error);
      summary = `YouTube video content with ${indexResult.documentsCount} sections indexed successfully.`;
    }

    return NextResponse.json(
      {
        success: true,
        message: "YouTube video processed successfully",
        name: `YouTube Video (${videoId})`,
        collectionName,
        summary,
        sourceUrl: youtubeUrl,
        documentsCount: indexResult.documentsCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("YouTube processing error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process YouTube video" 
      },
      { status: 500 }
    );
  }
} 