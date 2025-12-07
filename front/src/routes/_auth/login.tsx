import { getWeatherLogs } from '@/api/weather';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { authenticate } from '@/api/auth';
import { useState } from 'react';
import type { AxiosError } from 'axios';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

export const loginFormSchema = z.object({
    email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginData = z.infer<typeof loginFormSchema>;

export const Route = createFileRoute('/_auth/login')({
    component: Login,
    head: () => ({
        meta: [
            {
                title: 'Login',
            },
        ],
    }),
});

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: zodResolver(loginFormSchema),
    });

    const navigate = useNavigate();

    const [openAlert, setOpenAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { mutateAsync: login } = useMutation({
        mutationFn: authenticate,
        onSuccess() {
            navigate({
                to: '/overview',
            });
        },
        onError(error) {
            const err = error as AxiosError<{ message?: string }>;
            showError(
                err.response?.status === 400
                    ? 'Ops! Email ou senha incorretos.'
                    : 'Erro inesperado. Tente novamente.'
            );
        },
    });

    async function handleLoginForm(credentials: LoginData) {
        login(credentials);
    }

    function showError(message: string) {
        setErrorMessage(message);
        setOpenAlert(true);

        setTimeout(() => {
            setOpenAlert(false);
        }, 3000);
    }

    return (
        <div className="relative">
            <div className="flex flex-col justify-center px-6 py-12 lg:px-8 bg-linear-to-r from-[#ffcb6b] to-[#3d8bff] h-screen">
                <div className="rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5 w-lg mx-auto pb-5 pt-2">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            src={`http://openweathermap.org/img/wn/02d@4x.png`}
                            alt=""
                            className="mx-auto h-20 w-auto"
                        />
                        <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-500">
                            Acesse sua conta
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        {/* <div className="grid w-full max-w-xl items-start gap-4"> */}

                        {/* </div> */}
                        <form
                            onSubmit={handleSubmit(handleLoginForm)}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm/6 font-medium text-gray-900"
                                >
                                    Email
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-500 outline-1 -outline-offset-1 outline-gray-400 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-500 sm:text-sm/6"
                                    />
                                    {errors.email && (
                                        <p className="text-destructive text-sm">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm/6 font-medium text-gray-900"
                                    >
                                        Senha
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-500 outline-1 -outline-offset-1 outline-gray-400 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-500 sm:text-sm/6"
                                    />
                                    {errors.password && (
                                        <p className="text-destructive text-sm">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                                >
                                    Entrar
                                </button>
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm/6 text-gray-500">
                            Nao tem uma conta?{' '}
                            <Link
                                to="/register"
                                className="font-semibold text-white hover:text-amber-300"
                            >
                                Crie a sua!
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            {openAlert && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 ">
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>{errorMessage}</AlertTitle>
                    </Alert>
                </div>
            )}
        </div>
    );
}
