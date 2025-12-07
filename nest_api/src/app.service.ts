import { Injectable, OnModuleInit } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';

import * as bcrypt from 'bcrypt';
import { UserService } from './user/user.service';
import { WeatherService } from './weather/weather.service';

@Injectable()
export class AppService implements OnModuleInit {
    constructor(
        private readonly userService: UserService,
        private readonly weatherService: WeatherService,
    ) {}
    async onModuleInit() {
        const userExists =
            await this.userService.findByEmail('admin@example.com');

        if (userExists) {
            console.log('Admin já existe');
            return;
        }

        const salt = await bcrypt.genSalt();

        const passwordHash = await bcrypt.hash('123456', salt);

        const defaultUser = {
            name: 'admin',
            email: 'admin@example.com',
            password: passwordHash,
            coord: { lat: -22.1175, lon: -45.0517 },
        };

        const createdUser = await this.userService.create(defaultUser);

        const history = generateWeatherHistory(createdUser);

        await this.weatherService.insertMany(history);

        console.log('Admin criado com sucesso');
    }
}

export function generateWeatherHistory(user: any) {
    const now = new Date();
    const history: any = [];

    const descriptions = [
        { description: 'céu limpo', icon: '01d' },
        { description: 'poucas nuvens', icon: '02d' },
        { description: 'nublado', icon: '03d' },
        { description: 'chuva leve', icon: '10d' },
        { description: 'chuva moderada', icon: '10d' },
        { description: 'trovoadas', icon: '11d' },
        { description: 'neblina', icon: '50d' },
    ];

    for (let i = 23; i > 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);

        const random = faker.number.int({
            min: 0,
            max: descriptions.length - 1,
        });

        const entry = {
            userId: user._id,
            time: time.toISOString(),
            lat: -22.1175,
            lon: -45.0517,
            temp: faker.number.float({ min: 288.15, max: 305.15 }), //15°C - 32°C
            humidity: faker.number.int({ min: 40, max: 95 }),
            windSpeed: faker.number.float({ min: 1, max: 8 }),

            description: descriptions[random].description,
            icon: descriptions[random].icon,
        };

        history.push(entry);
    }

    return history;
}
