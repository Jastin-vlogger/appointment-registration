import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WeatherSearchDto {
  @IsString()
  city: string;
}

export class Cities {
  @ApiProperty()
  cities: string[]
}

@Controller()
export class AppController {

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('search')
  async searchWeather(@Body() dto: WeatherSearchDto) {
    return this.appService.getWeatherForecast(dto);
  }


  @Post('search/cities')
  async getWeather(@Body() body:Cities ) {
    return this.appService.getWeatherForCities(body.cities);
  }


}
