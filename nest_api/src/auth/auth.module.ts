import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret: 'jggiyiyioutoiypiypiy',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
})
export class AuthModule {}
