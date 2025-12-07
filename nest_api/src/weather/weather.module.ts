import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from './weather.schema';
import { InsightModule } from 'src/insight/insight.module';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Weather.name, schema: WeatherSchema },
        ]),
        InsightModule,
    ],
    controllers: [WeatherController],
    providers: [WeatherService, AuthGuard],
    exports: [MongooseModule, WeatherService],
})
export class WeatherModule {}
