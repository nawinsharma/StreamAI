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
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full w-24"></div>
          <div className="h-4 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full w-20"></div>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <div className="h-12 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full w-16"></div>
          <div className="w-16 h-16 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full"></div>
        </div>
        <div className="flex justify-around">
          {Array(6).fill(null).map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-3 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full w-8"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full"></div>
              <div className="h-3 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full w-6"></div>
            </div>
          ))}
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

            <div className="bg-white rounded-xl p-6 shadow-inner border border-sky-100 mb-6">
              <div className="flex flex-col items-center mb-6">
                <h1 className="text-5xl font-bold text-gray-900 mb-2">{props.current.temp_c}°C</h1>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-3">
                  <img 
                    src={`https:${props.current.condition.icon}`} 
                    alt={props.current.condition.text}
                    className="w-12 h-12"
                  />
                </div>
                <p className="text-lg font-medium text-gray-700 capitalize">{props.current.condition.text}</p>
                <p className="text-sm text-gray-600">Feels like {props.current.feelslike_c}°C</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Humidity</span>
                  <span className="font-medium text-gray-900">{props.current.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wind</span>
                  <span className="font-medium text-gray-900">{props.current.wind_kph} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pressure</span>
                  <span className="font-medium text-gray-900">{props.current.pressure_mb} mb</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Visibility</span>
                  <span className="font-medium text-gray-900">{props.current.vis_km} km</span>
                </div>
              </div>
            </div>

            {props.forecast && props.forecast.forecastday && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">7-Day Forecast</h4>
                <div className="grid grid-cols-7 gap-2">
                  {props.forecast.forecastday.slice(0, 7).map((day, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 text-center shadow-sm border border-sky-100">
                      <div className="text-xs text-gray-600 mb-1">
                        {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="w-8 h-8 mx-auto mb-1">
                        <img 
                          src={`https:${day.day.condition.icon}`} 
                          alt={day.day.condition.text}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="text-xs font-medium text-gray-900">{day.day.maxtemp_c}°</div>
                      <div className="text-xs text-gray-500">{day.day.mintemp_c}°</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </AIMessageComponent>
    ) : (
      <AIMessageText content="No weather data found for the specified city." />
    )}
  </>
);
