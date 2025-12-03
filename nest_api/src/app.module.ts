import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { User, UserSchema } from './user/user.schema';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.DATABASE_URL!),
        UserModule,
        AuthModule,
        WeatherModule,
    ],
    providers: [AppService],
})
export class AppModule {}
