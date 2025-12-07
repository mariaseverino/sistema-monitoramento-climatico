import type { AxiosError } from 'axios';
import { api } from './api';
import type { LoginData } from '@/routes/_auth/login';
import type { RegisterData } from '@/routes/_auth/register';

interface CurrentUser {
    id: string;
    name: string;
    coord: {
        lat: number;
        lon: number;
    };
}

export async function authenticate(data: LoginData) {
    try {
        const response = await api.post<LoginData>('/auth/login', data, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        throw error;
    }
}

export async function createAccount(data: RegisterData) {
    try {
        const response = await api.post<RegisterData>(
            '/auth/create-account',
            data,
            {
                withCredentials: true,
            }
        );
        return response.data;
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        throw error;
    }
}

export async function getProfile(): Promise<CurrentUser> {
    try {
        const response = await api.get<CurrentUser>('/auth/me', {
            withCredentials: true,
        });

        return response.data;
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        throw error;
    }
}

export async function logout(): Promise<void> {
    try {
        await api.post('/auth/logout', {}, { withCredentials: true });
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        throw error;
    }
}
