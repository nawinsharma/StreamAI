import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ALLOWED_SPEAKERS = new Set([
  "anushka",
  "abhilash",
  "manisha",
  "vidya",
  "arya",
  "karun",
  "hitesh",
]);

const LANGUAGE_FALLBACK_MAP: Record<string, string> = {
  unknown: "en-IN",
  auto: "en-IN",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { speaker, language_code } = await req.json();
    if (!speaker || !ALLOWED_SPEAKERS.has(speaker)) {
      return NextResponse.json({ error: "Invalid speaker" }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SARVAM_API_KEY not configured" }, { status: 500 });
    }

    const safeLanguageCode =
      LANGUAGE_FALLBACK_MAP[language_code as string] ?? (language_code as string) ?? "en-IN";

    const previewText =
      safeLanguageCode === "hi-IN"
        ? "नमस्ते, यह मेरी आवाज़ का छोटा सा नमूना है।"
        : "Hello, this is a short preview of my voice.";

    const ttsResponse = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [previewText],
        target_language_code: safeLanguageCode,
        model: "bulbul:v2",
        speaker,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("Sarvam preview TTS error:", errorText);
      return NextResponse.json(
        { error: `Text-to-speech error: ${ttsResponse.statusText}` },
        { status: ttsResponse.status }
      );
    }

    const ttsData = await ttsResponse.json();
    return NextResponse.json({ audio: ttsData.audios?.[0] ?? null });
  } catch (error) {
    console.error("Voice preview error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate voice preview" },
      { status: 500 }
    );
  }
}
