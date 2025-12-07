import type { AxiosError } from 'axios';
import { api } from './api';

export interface Weather {
    userId: string;
    lat: number;
    lon: number;
    hour: number;
    description: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    icon: string;
}

export async function getWeatherLogs(userId: string): Promise<Weather[]> {
    try {
        const response = await api.get<Weather[]>(`/weather/logs/${userId}`, {
            withCredentials: true,
        });

        return response.data;
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        throw error;
    }
}

export async function getIAInsights(
    userId: string
): Promise<{ title: string; description: string }[]> {
    try {
        const response = await api.get<
            { title: string; description: string }[]
        >(`/weather/logs/insights/${userId}`, {
            withCredentials: true,
        });

        return response.data;
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        throw error;
    }
}
