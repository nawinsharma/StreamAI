import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const languageCode = formData.get("language_code") as string || "unknown";

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SARVAM_API_KEY not configured" }, { status: 500 });
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create FormData for Sarvam API (using multipart/form-data)
    const sarvamFormData = new FormData();
    const blob = new Blob([buffer], { type: audioFile.type || "audio/wav" });
    sarvamFormData.append("file", blob, audioFile.name || "audio.webm");
    sarvamFormData.append("model", "saarika:v2.5");
    sarvamFormData.append("language_code", languageCode);

    // Call Sarvam AI API
    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        // Don't set Content-Type header - let fetch set it with boundary
      },
      body: sarvamFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sarvam API error:", errorText);
      return NextResponse.json(
        { error: `Sarvam API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      transcript: data.transcript,
      language_code: data.language_code,
      words: data.words,
      speaker_segments: data.speaker_segments,
    });

  } catch (error) {
    console.error("Speech-to-text error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
