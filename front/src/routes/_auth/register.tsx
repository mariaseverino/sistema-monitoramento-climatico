import { createAccount } from '@/api/auth';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

export const Route = createFileRoute('/_auth/register')({
    component: Register,
    head: () => ({
        meta: [
            {
                title: 'Criar Conta',
            },
        ],
    }),
});

export const registerFormSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().min(1, 'Email obrigatório').email('Email inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
    coord: z.object({
        lat: z.number(),
        lon: z.number(),
    }),
});

export type RegisterData = z.infer<typeof registerFormSchema>;

function Register() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerFormSchema),
    });

    const [geolocationHasPermission, setGeolocationHasPermission] =
        useState(false);

    const [shareLocation, setShareLocation] = useState(false);

    const [openAlert, setOpenAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const { mutateAsync: registerMutate } = useMutation({
        mutationFn: createAccount,
        onSuccess() {
            navigate({
                to: '/login',
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

    const requestLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                setValue('coord.lat', latitude);
                setValue('coord.lon', longitude);

                setGeolocationHasPermission(true);
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    showError(
                        'Para continuar, você precisa permitir o acesso à localização no navegador.'
                    );
                }
            }
        );
    };

    async function handleRegisterForm(credentials: RegisterData) {
        registerMutate(credentials);
    }

    function showError(message: string) {
        setErrorMessage(message);
        setOpenAlert(true);
        setShareLocation(false);

        setTimeout(() => {
            setOpenAlert(false);
        }, 3000);
    }

    return (
        <div>
            <div className="flex flex-col justify-center px-6 py-12 lg:px-8 bg-linear-to-r from-[#ffcb6b] to-[#3d8bff] h-screen">
                <div className="rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5 w-lg mx-auto pb-5 pt-2">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            src={`http://openweathermap.org/img/wn/02d@4x.png`}
                            alt=""
                            className="mx-auto h-20 w-auto"
                        />
                        <h2 className="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-500">
                            Crie sua conta
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form
                            onSubmit={handleSubmit(handleRegisterForm)}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm/6 font-medium text-gray-900"
                                >
                                    Nome
                                </label>
                                <div className="mt-2">
                                    <input
                                        {...register('name')}
                                        id="name"
                                        type="name"
                                        required
                                        autoComplete="name"
                                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-500 outline-1 -outline-offset-1 outline-gray-400 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-500 sm:text-sm/6"
                                    />
                                    {errors.name && (
                                        <p className="text-destructive text-sm">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>
                            </div>

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
                                <div className="flex items-start gap-3 mt-4">
                                    <Checkbox
                                        id="terms-2"
                                        className="focus-visible:ring-red-600 focus-visible:border-r-blue-700"
                                        onCheckedChange={(value) => {
                                            setShareLocation(!!value);
                                            if (value) {
                                                requestLocation();
                                            }
                                        }}
                                        checked={shareLocation}
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="terms-2">
                                            Permissão de localização necessária
                                        </Label>
                                        <p className="text-gray-500 text-sm">
                                            você precisa permitir o acesso à
                                            localização no navegador.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:bg-amber-500/60"
                                    disabled={!geolocationHasPermission}
                                >
                                    Criar
                                </button>
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm/6 text-gray-500">
                            Ja te uma conta?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-white hover:text-amber-300"
                            >
                                Faca login!
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {openAlert && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 ">
                    <Alert variant="default">
                        <InfoIcon />
                        <AlertTitle>{errorMessage}</AlertTitle>
                    </Alert>
                </div>
            )}
        </div>
    );
}

function PermissionModal({
    onRetry,
    onClose,
}: {
    onRetry: () => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-xs">
                <h2 className="font-semibold text-lg mb-2">
                    Permissão de localização necessária
                </h2>

                <p className="text-sm text-gray-700 mb-4">
                    Para continuar, você precisa permitir o acesso à localização
                    no navegador.
                </p>

                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    onClick={onRetry}
                >
                    Tentar novamente
                </button>
            </div>
        </div>
    );
}
