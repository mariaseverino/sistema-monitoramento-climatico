import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user/user.service';

@Injectable()
export class AppService implements OnModuleInit {
    constructor(private readonly userService: UserService) {}
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

        await this.userService.create(defaultUser);

        console.log('Admin criado com sucesso');
    }
}
