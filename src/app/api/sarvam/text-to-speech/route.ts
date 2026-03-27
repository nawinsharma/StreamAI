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

    const body = await req.json();
    const { text, target_language_code, speaker, pitch, pace, loudness } = body;

    if (!text || !target_language_code || !speaker) {
      return NextResponse.json(
        { error: "text, target_language_code, and speaker are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SARVAM_API_KEY not configured" }, { status: 500 });
    }

    // Call Sarvam AI API
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code,
        model: "bulbul:v2",
        speaker,
        ...(pitch !== undefined && { pitch }),
        ...(pace !== undefined && { pace }),
        ...(loudness !== undefined && { loudness }),
      }),
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
      audios: data.audios,
      request_id: data.request_id,
    });

  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}
