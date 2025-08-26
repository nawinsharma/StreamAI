import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export interface CityParseResponse {
  success: boolean;
  city?: string;
  error?: string;
}

/**
 * Uses AI to extract city name from user input text
 * This is more robust than regex patterns and can handle various input formats
 */
export async function parseCityFromText(text: string): Promise<CityParseResponse> {
  try {
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: `You are a city name extractor. Your job is to extract the city name from user input related to weather queries.

Rules:
1. Extract ONLY the city name, nothing else
2. Return just the city name as plain text, no quotes, no additional text
3. If no city is mentioned or unclear, return "null"
4. Handle various formats like "weather in New York", "temperature in London", "what's the weather like in Tokyo", etc.
5. Normalize city names (e.g., "NYC" -> "New York", "LA" -> "Los Angeles")
6. If multiple cities are mentioned, return the first one
7. If the input is not weather-related, return "null"

Examples:
- "What's the weather in Paris?" -> "Paris"
- "Temperature in New York City" -> "New York"
- "How's the weather in London today?" -> "London"
- "Tell me about Tokyo's weather" -> "Tokyo"
- "What's the time?" -> "null"
- "How to cook pasta?" -> "null"`
        },
        {
          role: "user",
          content: text
        }
      ],
    });

    let cityName = "";
    for await (const delta of result.textStream) {
      cityName += delta;
    }

    // Clean up the response
    cityName = cityName.trim().toLowerCase();
    
    // Check if AI returned null or empty
    if (!cityName || cityName === "null" || cityName === "none" || cityName === "unknown") {
      return {
        success: false,
        error: "No city name found in the input"
      };
    }

    // Capitalize first letter of each word for proper city names
    const formattedCity = cityName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      success: true,
      city: formattedCity
    };

  } catch (error) {
    console.error("City parsing failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse city name"
    };
  }
} 