import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors({
        origin: process.env.FRONT_URL ?? 'http://localhost:3000',
        credentials: true,
        methods: 'GET,POST,PUT,DELETE',
    });
    await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
