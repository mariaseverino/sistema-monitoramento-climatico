import {
    Controller,
    Get,
    Post,
    Body,
    HttpException,
    HttpStatus,
    HttpCode,
    Res,
    UseGuards,
    Req,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAccountDto } from './dto/create-account.dto';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { AuthGuard } from './auth.guard';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService,
    ) {}

    @HttpCode(HttpStatus.CREATED)
    @Post('create-account')
    async createAccount(@Body() createAccountDto: CreateAccountDto) {
        const user = await this.userService.findByEmail(createAccountDto.email);

        if (user) {
            throw new HttpException(
                'Já existe uma conta assossiada a esse email',
                HttpStatus.CONFLICT,
            );
        }

        const salt = await bcrypt.genSalt();

        const passwordHash = await bcrypt.hash(createAccountDto.password, salt);

        createAccountDto.password = passwordHash;

        return await this.userService.create(createAccountDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() { email, password }: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const userExists = await this.userService.findByEmail(email);

        if (!userExists) {
            throw new HttpException(
                'Email ou senha incorretos',
                HttpStatus.BAD_REQUEST,
            );
        }

        const passwordValid = await bcrypt.compare(
            password,
            userExists.password,
        );

        if (!passwordValid) {
            throw new HttpException(
                'Email ou senha incorretos',
                HttpStatus.BAD_REQUEST,
            );
        }

        const payload = {
            sub: userExists._id.toString(),
            user: {
                id: userExists._id.toString(),
                name: userExists.name,
                coord: userExists.coord,
            },
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '1h',
            secret: process.env.JWT_SECRET,
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_SECRET,
        });

        response.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { message: 'Logged in' };
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Res() response: Response) {
        response.clearCookie('access_token');
        response.clearCookie('refresh_token');

        response.send({ message: 'logout' });
    }

    @UseGuards(AuthGuard)
    @Get('me')
    getProfile(@Req() request) {
        return request.user;
    }
}
