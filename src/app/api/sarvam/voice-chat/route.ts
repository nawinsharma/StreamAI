import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const SARVAM_TTS_MAX_CHARS = 500;
const VOICE_REPLY_TARGET_CHARS = 350;
const ALLOWED_SPEAKERS = new Set([
  "anushka",
  "abhilash",
  "manisha",
  "vidya",
  "arya",
  "karun",
  "hitesh",
]);

function stripThinkingBlocks(text: string): string {
  if (!text) return "";
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```[\s\S]*?```$/gim, "")
    .trim();
}

function clampForTts(text: string, maxChars: number): string {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  const clipped = clean.slice(0, maxChars);
  const sentenceBoundary = Math.max(
    clipped.lastIndexOf("."),
    clipped.lastIndexOf("!"),
    clipped.lastIndexOf("?")
  );
  if (sentenceBoundary > maxChars * 0.6) {
    return clipped.slice(0, sentenceBoundary + 1).trim();
  }
  return `${clipped.slice(0, maxChars - 3).trim()}...`;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    let languageCode = formData.get("language_code") as string || "unknown";
    const requestedSpeaker = (formData.get("speaker") as string) || "anushka";
    const speaker = ALLOWED_SPEAKERS.has(requestedSpeaker) ? requestedSpeaker : "anushka";
    const chatHistory = formData.get("chat_history") ? JSON.parse(formData.get("chat_history") as string) : [];

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Convert "auto" to "unknown" for Sarvam API compatibility
    if (languageCode === "auto") {
      languageCode = "unknown";
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SARVAM_API_KEY not configured" }, { status: 500 });
    }

    // Step 1: Speech-to-Text
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sarvamFormData = new FormData();
    const blob = new Blob([buffer], { type: audioFile.type || "audio/webm" });
    sarvamFormData.append("file", blob, audioFile.name || "audio.webm");
    sarvamFormData.append("model", "saarika:v2.5");
    sarvamFormData.append("language_code", languageCode);

    const sttResponse = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: sarvamFormData,
    });

    if (!sttResponse.ok) {
      const errorText = await sttResponse.text();
      console.error("Sarvam STT error:", errorText);
      return NextResponse.json(
        { error: `Speech-to-text error: ${sttResponse.statusText}` },
        { status: sttResponse.status }
      );
    }

    const sttData = await sttResponse.json();
    const userMessage = sttData.transcript;
    const detectedLanguage = sttData.language_code || languageCode;

    const languageMap: Record<string, string> = {
      "hi-IN": "Hindi",
      "en-IN": "English",
      "ta-IN": "Tamil",
      "te-IN": "Telugu",
      "bn-IN": "Bengali",
      "kn-IN": "Kannada",
      "ml-IN": "Malayalam",
      "mr-IN": "Marathi",
      "gu-IN": "Gujarati",
      "pa-IN": "Punjabi",
      "od-IN": "Odia",
      "unknown": "the same language as the user",
    };

    const targetLanguage = languageMap[detectedLanguage] || "the same language as the user";

    // Step 2: Chat with Sarvam-M
    // Add system prompt to ensure response in the same language
    const systemPrompt = `You are a helpful AI assistant. IMPORTANT: Always respond in ${targetLanguage}. Match the language of the user's input exactly. If the user speaks in Hindi (हिंदी), respond ONLY in Hindi. If the user speaks in English, respond ONLY in English. Never respond in a different language than the user's input. Always use the exact same language as the user's message.

For voice output:
- Return ONLY the final answer, no reasoning, no analysis, no tags.
- Never output <think>...</think> or markdown code blocks.
- Keep the response concise and natural for speech: 1-3 short sentences, ideally under ${VOICE_REPLY_TARGET_CHARS} characters.`;

    // Filter out any existing system messages and add the current language-specific one
    const filteredHistory = chatHistory.filter((msg: { role?: string }) => msg.role !== "system");
    
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...filteredHistory,
      { role: "user", content: userMessage }
    ];

    const chatResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: chatMessages,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error("Sarvam Chat error:", errorText);
      return NextResponse.json(
        { error: `Chat error: ${chatResponse.statusText}` },
        { status: chatResponse.status }
      );
    }

    const chatData = await chatResponse.json();
    const rawAssistantMessage = chatData.choices[0]?.message?.content || "";
    const assistantMessage = stripThinkingBlocks(rawAssistantMessage);
    const safeTtsInput = clampForTts(
      assistantMessage || "Sorry, I could not generate a response.",
      SARVAM_TTS_MAX_CHARS
    );

    // Step 3: Text-to-Speech (use detected language from STT)
    const ttsResponse = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [safeTtsInput],
        target_language_code: detectedLanguage,
        model: "bulbul:v2",
        speaker,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("Sarvam TTS error:", errorText);
      return NextResponse.json(
        { error: `Text-to-speech error: ${ttsResponse.statusText}` },
        { status: ttsResponse.status }
      );
    }

    const ttsData = await ttsResponse.json();

    return NextResponse.json({
      transcript: userMessage,
      response: assistantMessage,
      audio: ttsData.audios?.[0],
      language_code: detectedLanguage,
      chat_history: [
        ...chatMessages,
        { role: "assistant", content: assistantMessage }
      ],
    });

  } catch (error) {
    console.error("Voice chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process voice chat" },
      { status: 500 }
    );
  }
}
