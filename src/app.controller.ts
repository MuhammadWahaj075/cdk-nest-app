import { Controller, Get, Header } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import Mustache from 'mustache';
import { RestaurantsService } from './restaurants.service';

@Controller()
export class AppController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('/')
  @Header('Content-Type', 'text/html; charset=UTF-8')
  async index() {
    const p1 = join(process.cwd(), 'static', 'index.html');
    const p2 = join(process.cwd(), 'src', 'static', 'index.html');
    const templatePath = existsSync(p1) ? p1 : p2;

    const template = readFileSync(templatePath, 'utf-8');

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayOfWeek = days[new Date().getDay()];

    const restaurants = await this.restaurantsService.list();

    return Mustache.render(template, { dayOfWeek, restaurants });
  }

  @Get('/restaurants')
  async restaurants() {
    return this.restaurantsService.list();
  }
}
