import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RestaurantsService } from './restaurants.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [RestaurantsService],
})
export class AppModule {}
