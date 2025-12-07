export class CreateAccountDto {
    name: string;
    email: string;
    password: string;
    coord: {
        lat: number;
        lon: number;
    };
}
