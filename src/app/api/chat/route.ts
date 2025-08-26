import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { 
  handleWeatherRequest, 
  createWeatherStream 
} from "@/lib/weather-handler";
import { 
  normalizeMessages, 
  handleAIChatRequest 
} from "@/lib/ai-chat-handler";

/**
 * Extracts text content from a message, handling both string and array formats
 */
function extractTextFromMessage(message: { content: string | Array<{ type: string; text?: string }> }): string {
  if (typeof message.content === "string") {
    return message.content;
  }
  
  if (Array.isArray(message.content)) {
    const textContent = message.content.find((c) => c.type === "text");
    return textContent?.text || "";
  }
  
  return "";
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication first
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    if (!session?.user?.id) {
      return new Response("Unauthorized. Please sign in to continue.", { status: 401 });
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const normalized = normalizeMessages(body);
    
    if (!normalized) {
      return new Response(
        "Invalid request body: provide `messages` or `prompt`.", 
        { status: 400 }
      );
    }

    // Extract context
    const chatId: string | undefined = body?.chatId;
    const userId = session.user.id as string;
    const lastUser = [...normalized].reverse().find(m => m.role === 'user');

    if (!lastUser) {
      return new Response("No user message found", { status: 400 });
    }

    // Extract attachment metadata if present
    const attachmentMeta = body?.attachmentMeta ? {
      name: body.attachmentMeta.name,
      mimeType: body.attachmentMeta.mimeType,
      url: body.attachmentMeta.url,
      type: body.attachmentMeta.type,
      width: body.attachmentMeta.width,
      height: body.attachmentMeta.height,
      extractedTextPreview: body.attachmentMeta.extractedTextPreview,
    } : undefined;

    // Check if this is a weather request (only if no file attachment)
    if (!attachmentMeta) {
      const userText = extractTextFromMessage(lastUser);
      
      // Use the new enhanced weather handler that uses AI city parsing
      const weatherResponse = await handleWeatherRequest(
        userText,
        chatId,
        userId,
        userText
      );

      if (weatherResponse.success && weatherResponse.data) {
        const stream = createWeatherStream(weatherResponse.data);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } else {
        // If weather fails, fall through to AI chat
        console.log("Weather request failed, falling back to AI chat");
      }
    }

    // Handle AI chat request (with or without attachments)
    const chatResponse = await handleAIChatRequest({
      messages: normalized,
      chatId: chatId, // This is crucial for context maintenance
      userId: userId, // Always authenticated user ID
      attachmentMeta,
    });

    return new Response(chatResponse.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      "Internal server error. Please try again.",
      { status: 500 }
    );
  }
} 