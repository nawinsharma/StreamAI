"use client";

import { AIMessageComponent, AIMessageText } from "@/components/message";

interface WeatherAPILocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

interface WeatherAPICurrent {
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
  vis_km: number;
  vis_miles: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
}

interface WeatherAPIForecast {
  forecastday: Array<{
    date: string;
    date_epoch: number;
    day: {
      maxtemp_c: number;
      maxtemp_f: number;
      mintemp_c: number;
      mintemp_f: number;
      avgtemp_c: number;
      avgtemp_f: number;
      maxwind_mph: number;
      maxwind_kph: number;
      totalprecip_mm: number;
      totalprecip_in: number;
      totalsnow_cm: number;
      avgvis_km: number;
      avgvis_miles: number;
      avghumidity: number;
      daily_will_it_rain: number;
      daily_chance_of_rain: number;
      daily_will_it_snow: number;
      daily_chance_of_snow: number;
      condition: {
        text: string;
        icon: string;
        code: number;
      };
      uv: number;
    };
  }>;
}

interface WeatherAPIResponse {
  location: WeatherAPILocation;
  current: WeatherAPICurrent;
  forecast?: WeatherAPIForecast;
}

export const WeatherLoading = () => (
  <AIMessageComponent>
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-200/50 shadow-lg max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full animate-pulse w-32"></div>
            <div className="h-3 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full animate-pulse w-24"></div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-200 to-blue-200 animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full animate-pulse w-full"></div>
          <div className="h-4 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full animate-pulse w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  </AIMessageComponent>
);

export const Weather = (props: WeatherAPIResponse) => (
  <>
    {props && props.location && props.current ? (
      <AIMessageComponent>
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-200/50 shadow-lg backdrop-blur-sm max-w-md">
          <div className="text-gray-900">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Weather Report</h3>
                  <p className="text-sm text-gray-600">{props.location.name}, {props.location.country}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600 opacity-90">
                  {new Date(props.location.localtime).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-inner border border-sky-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {props.current.temp_c}°C
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">
                      Feels like {props.current.feelslike_c}°C
                    </span>
                    <span className="text-sm text-gray-600">
                      {props.current.condition.text}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-gray-900">
                    {props.current.temp_f}°F
                  </div>
                  <div className="text-sm text-gray-600">
                    Feels like {props.current.feelslike_f}°F
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sky-100">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Humidity</span>
                  <span className="text-sm font-medium text-gray-900">{props.current.humidity}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm text-gray-600">Wind</span>
                  <span className="text-sm font-medium text-gray-900">{props.current.wind_kph} km/h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-sm text-gray-600">Pressure</span>
                  <span className="text-sm font-medium text-gray-900">{props.current.pressure_mb} mb</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-gray-600">UV Index</span>
                  <span className="text-sm font-medium text-gray-900">{props.current.uv}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AIMessageComponent>
    ) : (
      <AIMessageText content="Weather data not available" />
    )}
  </>
);
