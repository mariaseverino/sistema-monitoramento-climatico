export interface SaveWeatherLogsDto {
    userId: string;
    time: string;
    lat: number;
    lon: number;
    description: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    icon: string;
}
