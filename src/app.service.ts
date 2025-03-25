/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WeatherSearchDto } from './app.controller';

export const cityCoordinates = {
  'San Francisco': { latitude: 37.7749, longitude: -122.4194 },
  'New York': { latitude: 40.7128, longitude: -74.006 },
  'Los Angeles': { latitude: 34.0522, longitude: -118.2437 },
  'Chicago': { latitude: 41.8781, longitude: -87.6298 },
  'London': { latitude: 51.5074, longitude: -0.1278 },
  'Paris': { latitude: 48.8566, longitude: 2.3522 },
  'Berlin': { latitude: 52.52, longitude: 13.405 },
  'Tokyo': { latitude: 35.682839, longitude: 139.759455 },
  'Kochi': { latitude: 9.9312, longitude: 76.2673 },
  'Bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'Milan': { latitude: 45.4642, longitude: 9.1900 }
};

@Injectable()
export class AppService {
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';
  getHello(): string {
    return 'Hello World!';
  }

  async getWeatherForecast(dto: WeatherSearchDto) {
    const city = dto.city;

    // Get latitude and longitude from the hardcoded map
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const coordinates = cityCoordinates[city];

    const cityList = this.getCityNames();
    if (!coordinates) {
      throw new HttpException(`City "${city}" not found in database. Available cities are ${cityList.join(', ')}`, HttpStatus.NOT_FOUND);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { latitude, longitude } = coordinates;

    try {
      const url = `${this.API_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: any = await response.json();
      return {
        city,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        temperature:data.current_weather.temperature ,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        windSpeed: data.current_weather.windspeed,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        weather: data.current_weather,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recommondation: this.getWeatherRecommendation(data.current_weather),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        condition: this.getCondition(data.current_weather)
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  getWeatherRecommendation(weather: any): string{
    const condition = this.getCondition(weather);
    if(condition === 'Clear sky'){
      return 'A Great time to walk';
    } else {
      return 'Check the weather before heading out '
    }
  }

  getCondition(weather: any): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!weather || !weather.weathercode) {
      return "Weather data unavailable. Stay prepared!";
    }
  
    const { weathercode, temperature, windspeed } = weather;
  
    if (weathercode === 0) {
      return "Clear sky";
    } else if (weathercode === 1 || weathercode === 2) {
      return "Partly cloudy";
    } else if (weathercode === 3) {
      return "Overcast skies. It might feel gloomy outside.";
    } else if ([45, 48].includes(weathercode)) {
      return "Foggy weather. Drive carefully!";
    } else if ([51, 53, 55].includes(weathercode)) {
      return "Light rain. A raincoat or umbrella is recommended.";
    } else if ([61, 63, 65].includes(weathercode)) {
      return "Rainy weather. Carry an umbrella and wear waterproof shoes.";
    } else if ([71, 73, 75].includes(weathercode)) {
      return "Snowfall expected. Dress warmly and be cautious while driving.";
    } else if ([80, 81, 82].includes(weathercode)) {
      return "Heavy showers expected. Stay indoors if possible.";
    } else if (weathercode >= 95) {
      return "Thunderstorms detected. Avoid going outside.";
    } else if (temperature < 10) {
      return "It’s quite cold. Wear a warm jacket!";
    } else if (temperature > 30) {
      return "It's quite hot. Stay hydrated and avoid the sun!";
    } else if (windspeed > 25) {
      return "Strong winds today. Be cautious if traveling outside.";
    } else {
      return "Weather is moderate. Have a great day!";
    }
  }
  
  getCityNames(): string[] {
    return Object.keys(cityCoordinates);
  }
  
  async getWeatherForCities(cities: string[]): Promise<any[]> {
    const requests = cities.map(async (city) => {
      const coordinates = cityCoordinates[city];

      if (!coordinates) {
        return { city, error: `City "${city}" not found in database` };
      }

      const { latitude, longitude } = coordinates;
      const url = `${this.API_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch weather for ${city}`);
        }

        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const weather = data.current_weather;

        return {
          city,
          latitude,
          longitude,
          weather,
          recommendation: this.getWeatherRecommendation(weather),
        };
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return { city, error: error.message };
      }
    });

    return Promise.all(requests);
  }

  
}
