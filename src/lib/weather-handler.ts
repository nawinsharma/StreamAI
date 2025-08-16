import { getEnhancedWeather, getWeatherForCity } from "./ai-tools/enhanced-weather";
import prisma from "./prisma";

export interface WeatherResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Handles weather requests using AI-powered city parsing
 * This replaces the old regex-based extractCityFromText function
 */
export async function handleWeatherRequest(
  userInput: string,
  chatId?: string,
  userId?: string,
  userMessage?: string
): Promise<WeatherResponse> {
  try {
    const weatherResult = await getEnhancedWeather(userInput);
    
    if (!weatherResult.success) {
      return {
        success: false,
        error: weatherResult.error || "Failed to get weather information"
      };
    }

    const weatherData = weatherResult.data;
    const parsedCity = weatherResult.parsedCity;
    const data = JSON.stringify(weatherData);
    const formatted = `UI_WEATHER:${data}\n\nA quick look at the current weather for ${parsedCity}:`;
    
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
 * Handles weather requests when city name is already known
 * This is a more direct approach when city is validated
 */
export async function handleWeatherRequestForCity(
  city: string,
  chatId?: string,
  userId?: string,
  userMessage?: string
): Promise<WeatherResponse> {
  try {
    const weatherResult = await getWeatherForCity(city);
    
    if (!weatherResult.success) {
      return {
        success: false,
        error: weatherResult.error || "Failed to get weather information"
      };
    }

    const weatherData = weatherResult.data;
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