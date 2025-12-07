export class CreateUserDto {
    name: string;
    email: string;
    password: string;
    coord: {
        lat: number;
        lon: number;
    };
}
