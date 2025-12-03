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

    async getData(userId: string) {
        const cursor = this.weather.find({ userId }).cursor({ batchSize: 10 });
        console.log({ cursor: cursor });
        let batch: Weather[] = [];
        console.log();
        for await (const doc of cursor) {
            batch.push(doc);

            // se já deu 10 docs...
            if (batch.length === 10) {
                console.log('Salvando batch de 10');
                await this.saveToCsv(batch);
                batch = [];
            }
        }

        // salva o restante que sobrou
        if (batch.length > 0) {
            console.log('Salvando último batch');
            await this.saveToCsv(batch);
        }
    }

    async saveToCsv(batch: any[]) {
        // sua lógica para salvar no CSV
        console.log('batch:', batch.length);
    }
}
