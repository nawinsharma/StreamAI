import { parseCityFromText } from "./city-parser";
import { getWeather } from "./weather";

export interface EnhancedWeatherResponse {
  success: boolean;
  data?: any;
  error?: string;
  parsedCity?: string;
}

/**
 * Enhanced weather tool that uses AI to parse city names from user input
 * This is more robust than regex patterns and can handle various input formats
 */
export async function getEnhancedWeather(userInput: string): Promise<EnhancedWeatherResponse> {
  try {
    // Step 1: Use AI to parse city name from user input
    const cityParseResult = await parseCityFromText(userInput);
    
    if (!cityParseResult.success || !cityParseResult.city) {
      return {
        success: false,
        error: cityParseResult.error || "Could not identify a city name in your request"
      };
    }

    const parsedCity = cityParseResult.city;
    console.log(`[Enhanced Weather] Parsed city: "${parsedCity}" from input: "${userInput}"`);

    // Step 2: Get weather data for the parsed city
    const weatherData = await getWeather(parsedCity);
    
    return {
      success: true,
      data: weatherData,
      parsedCity: parsedCity
    };

  } catch (error) {
    console.error("Enhanced weather request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Weather service unavailable"
    };
  }
}

/**
 * Enhanced weather tool for direct city input (bypasses AI parsing)
 * Useful when city name is already known/validated
 */
export async function getWeatherForCity(city: string): Promise<EnhancedWeatherResponse> {
  try {
    const weatherData = await getWeather(city);
    
    return {
      success: true,
      data: weatherData,
      parsedCity: city
    };

  } catch (error) {
    console.error("Weather request failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Weather service unavailable"
    };
  }
} 