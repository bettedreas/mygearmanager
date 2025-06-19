export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
  }>;
}

export async function getWeatherForecast(location: string, dates?: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY_ENV_VAR || "default_key";
  
  try {
    // Get current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // Get forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
    );
    
    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
    
    const weather: WeatherData = {
      location: currentData.name,
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed
      },
      forecast: forecastData?.list?.slice(0, 5).map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString().split('T')[0],
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: item.weather[0].description,
        precipitation: item.rain?.['3h'] || 0
      })) || []
    };
    
    return weather;
  } catch (error) {
    console.error("Weather API error:", error);
    // Return mock data as fallback
    return {
      location,
      current: {
        temperature: 15,
        condition: "partly cloudy",
        humidity: 65,
        windSpeed: 10
      },
      forecast: [
        { date: new Date().toISOString().split('T')[0], high: 18, low: 8, condition: "sunny", precipitation: 0 },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], high: 16, low: 6, condition: "cloudy", precipitation: 0.2 },
      ]
    };
  }
}
