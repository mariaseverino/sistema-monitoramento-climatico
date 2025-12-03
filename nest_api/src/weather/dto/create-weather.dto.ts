export interface SaveWeatherLogsDto {
    userId: string;
    lat: number;
    lon: number;
    description: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    icon: string;
}
