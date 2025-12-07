import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        const token = request.cookies['access_token'];

        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });

            request['user'] = payload.user;

            return true;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                const refreshToken = request.cookies['refresh_token'];

                const response = context
                    .switchToHttp()
                    .getResponse() as Response;

                if (!refreshToken) {
                    throw new UnauthorizedException();
                }

                try {
                    const refreshTokenPayload =
                        await this.jwtService.verifyAsync(refreshToken, {
                            secret: process.env.JWT_SECRET,
                        });

                    const payload = {
                        sub: refreshTokenPayload._id.toString(),
                        user: {
                            id: refreshTokenPayload._id.toString(),
                            name: refreshTokenPayload.name,
                            coord: refreshTokenPayload.coord,
                        },
                    };

                    const accessToken = await this.jwtService.signAsync(
                        payload,
                        {
                            expiresIn: '1h',
                            secret: process.env.JWT_SECRET,
                        },
                    );

                    response.cookie('access_token', accessToken, {
                        httpOnly: true,
                        sameSite: 'lax',
                        maxAge: 60 * 60 * 1000,
                    });

                    request['user'] = payload;

                    return true;
                } catch (error) {
                    response.clearCookie('access_token');
                    response.clearCookie('refresh_token');

                    throw new UnauthorizedException(
                        'Refresh Token expirou ou é invalido.',
                    );
                }
            }
            throw new UnauthorizedException('Token invalido.');
        }
    }
}
