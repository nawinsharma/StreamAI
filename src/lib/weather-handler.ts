import { getWeather } from "./ai-tools/weather";
import prisma from "./prisma";

export interface WeatherResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Extracts city name from user input text
 */
export function extractCityFromText(text: string): string | null {
  const patterns = [
    /(?:weather|temperature|forecast)\s*(?:in|of)?\s*([a-zA-Z][a-zA-Z\s]+)$/i,
    /in\s+([a-zA-Z][a-zA-Z\s]+)\s*(?:weather|temperature)/i,
    /weather\s+(?:in|for)\s+([a-zA-Z][a-zA-Z\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Handles weather requests and returns formatted response
 */
export async function handleWeatherRequest(
  city: string,
  chatId?: string,
  userId?: string,
  userMessage?: string
): Promise<WeatherResponse> {
  try {
    const weatherData = await getWeather(city);
    const data = JSON.stringify(weatherData);
    const formatted = `UI_WEATHER:${data}\n\nA quick look at the current weather for ${city}:`;
    
    // Save to database if chat context is available
    if (chatId && userId && userMessage) {
      await saveWeatherToDatabase(chatId, userMessage, formatted);
    }

    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    console.error("Weather request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Weather service unavailable",
    };
  }
}

/**
 * Saves weather conversation to database
 */
async function saveWeatherToDatabase(
  chatId: string,
  userMessage: string,
  weatherResponse: string
): Promise<void> {
  try {
    // Save user message
    await prisma.message.create({
      data: {
        content: userMessage,
        role: "user",
        chatId: chatId,
      },
    });

    // Save AI response
    await prisma.message.create({
      data: {
        content: weatherResponse,
        role: "assistant",
        chatId: chatId,
      },
    });

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
  } catch (error) {
    console.error("Failed to save weather conversation:", error);
  }
}

/**
 * Creates a streaming response for weather data
 */
export function createWeatherStream(content: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(content));
      controller.close();
    },
  });
} 