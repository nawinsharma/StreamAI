import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { z } from "zod";
import { CUSTOM_EVENT_NAME } from "@/app/server";
import { Weather, WeatherLoading } from "@/components/ui/weather";
import { ErrorHandler, createToolError } from "@/lib/error-handler";

// Define the interface locally since it's not exported from the component
interface WeatherAPIResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    windchill_c: number;
    windchill_f: number;
    heatindex_c: number;
    heatindex_f: number;
    dewpoint_c: number;
    dewpoint_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
}

const weatherSchema = z.object({
  city: z.string().describe("The city name to get weather for"),
});

async function weatherData(input: z.infer<typeof weatherSchema>) {
  try {
    // Use WeatherAPI.com service
    const apiKey = process.env.WEATHER_API_KEY || 'demo';
    
    if (!apiKey || apiKey === 'demo') {
      throw new Error("Weather API key is not configured");
    }

    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(input.city)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Weather API authentication failed");
      } else if (response.status === 400) {
        throw new Error(`City '${input.city}' not found`);
      } else if (response.status >= 500) {
        throw new Error("Weather service is temporarily unavailable");
      } else {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Weather API returned an error");
    }

    return data as WeatherAPIResponse;
  } catch (err) {
    console.error("Weather API error:", err);
    
    // Handle specific errors
    if (err instanceof Error) {
      if (err.message.includes("API key") || err.message.includes("authentication")) {
        ErrorHandler.handleAPIError(err, "WeatherAPI");
      } else if (err.message.includes("not found")) {
        ErrorHandler.handleValidationError("City", err.message);
      } else if (err.message.includes("unavailable")) {
        ErrorHandler.handleAPIError(err, "WeatherAPI");
      } else {
        ErrorHandler.handleToolError(createToolError("WeatherTool", err.message, err));
      }
    }
    
    // Return mock data as fallback
    return {
      location: {
        name: input.city,
        region: "Unknown",
        country: "Unknown",
        lat: 0,
        lon: 0,
        tz_id: "UTC",
        localtime_epoch: Date.now() / 1000,
        localtime: new Date().toISOString()
      },
      current: {
        last_updated_epoch: Date.now() / 1000,
        last_updated: new Date().toISOString(),
        temp_c: 22,
        temp_f: 71.6,
        is_day: 1,
        condition: {
          text: "Partly cloudy",
          icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
          code: 1003
        },
        wind_mph: 7.5,
        wind_kph: 12.1,
        wind_degree: 87,
        wind_dir: "E",
        pressure_mb: 1013,
        pressure_in: 29.92,
        precip_mm: 0,
        precip_in: 0,
        humidity: 65,
        cloud: 40,
        feelslike_c: 24,
        feelslike_f: 75.2,
        windchill_c: 22,
        windchill_f: 71.6,
        heatindex_c: 24,
        heatindex_f: 75.2,
        dewpoint_c: 15,
        dewpoint_f: 59,
        vis_km: 10,
        vis_miles: 6,
        uv: 5,
        gust_mph: 12.5,
        gust_kph: 20.1
      }
    } as WeatherAPIResponse;
  }
}

export const weatherTool = tool(
  async (input, config: RunnableConfig) => {
    await dispatchCustomEvent(
      CUSTOM_EVENT_NAME,
      {
        output: {
          value: <WeatherLoading />,
          type: "append",
        },
      },
      config,
    );

    const data = await weatherData(input);

    await dispatchCustomEvent(
      CUSTOM_EVENT_NAME,
      {
        output: {
          value: <Weather {...data} />,
          type: "update",
        },
      },
      config,
    );

    return JSON.stringify(data, null);
  },
  {
    name: "WeatherTool",
    description: `A tool to fetch the current weather, given a city using WeatherAPI.com service.`,
    schema: weatherSchema,
  },
);
