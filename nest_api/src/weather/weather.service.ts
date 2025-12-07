import { Injectable } from '@nestjs/common';
import { SaveWeatherLogsDto } from './dto/create-weather.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Weather } from './weather.schema';
import { Model } from 'mongoose';

@Injectable()
export class WeatherService {
    constructor(
        @InjectModel(Weather.name) private readonly weather: Model<Weather>,
    ) {}

    async saveLog(saveWeatherLogsDto: SaveWeatherLogsDto) {
        const newUser = new this.weather(saveWeatherLogsDto);
        return newUser.save();
    }

    async findLogsByUserId(userId: string) {
        return await this.weather.find({ userId }).exec();
    }

    async removeLogsByUserId(userId: string) {
        await this.weather.deleteMany({ userId }).exec();
    }

    async insertMany(saveWeatherLogsDto: SaveWeatherLogsDto[]) {
        return await this.weather.insertMany(saveWeatherLogsDto);
    }
}
