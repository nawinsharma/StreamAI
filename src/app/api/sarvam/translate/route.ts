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
    const { input, source_language_code, target_language_code, mode, output_script, numeral_format } = body;

    if (!input || !source_language_code || !target_language_code) {
      return NextResponse.json(
        { error: "input, source_language_code, and target_language_code are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SARVAM_API_KEY not configured" }, { status: 500 });
    }

    // Call Sarvam AI API
    const response = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        source_language_code,
        target_language_code,
        model: "mayura:v1",
        ...(mode && { mode }),
        ...(output_script && { output_script }),
        ...(numeral_format && { numeral_format }),
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
      translated_text: data.translated_text,
      source_language_code: data.source_language_code,
      target_language_code: data.target_language_code,
      request_id: data.request_id,
    });

  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to translate text" },
      { status: 500 }
    );
  }
}
