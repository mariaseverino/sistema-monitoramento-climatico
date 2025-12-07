import { createFileRoute, redirect } from '@tanstack/react-router';
import { DoorOpen, MapPin } from 'lucide-react';
import { getIAInsights, getWeatherLogs } from '@/api/weather';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartAreaDefault } from '@/components/chat-area-default';
import { getProfile, logout } from '@/api/auth';
import image from '@/assets/Empty-pana.svg';

export const Route = createFileRoute('/_internal/overview')({
    component: Overview,
    head: () => ({
        meta: [
            {
                title: 'Overview',
            },
        ],
    }),
    beforeLoad: async () => {
        try {
            const user = await getProfile();

            if (!user) {
                throw redirect({ to: '/login' });
            }

            return { user };
        } catch (error) {
            throw redirect({ to: '/login' });
        }
    },
});

function Overview() {
    const { data: currentUser } = useQuery({
        queryKey: ['current_user'],
        queryFn: () => getProfile(),
    });

    const userId = currentUser?.id;

    const { data = [], isLoading } = useQuery({
        queryKey: ['weather'],
        queryFn: () => getWeatherLogs(userId!),
        refetchInterval: 3600000,
        staleTime: 3600000,
        refetchOnWindowFocus: false,
        enabled: !!userId,
    });

    const { data: insights = [] } = useQuery({
        queryKey: ['insights'],
        queryFn: () => getIAInsights(userId!),
        refetchInterval: 3600000,
        staleTime: 3600000,
        refetchOnWindowFocus: false,
        enabled: !!userId,
    });

    const [userCity, setUserCity] = useState('');

    async function handleLogout() {
        logout();
        window.location.href = '/login';
    }

    const last = data[data.length - 1];

    useEffect(() => {
        if (!currentUser?.coord) return;

        const getUserCity = async () => {
            try {
                const { lat, lon } = currentUser.coord;

                const res = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt
`
                );

                const result = await res.json();

                setUserCity(result.city);
            } catch (error) {
                console.error('Erro ao buscar cidade:', error);
            }
        };

        getUserCity();
    }, [currentUser]);

    if (!data || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center text-black bg-linear-to-r from-[#ffcb6b] to-[#3d8bff]">
                Carregando...
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen py-5 bg-linear-to-r from-[#ffcb6b] to-[#3d8bff] gap-8">
            <header className="w-full md:flex-row flex flex-col justify-between md:items-center px-10 md:pb-5 gap-5">
                <div className="order-2 md:order-1">
                    <p className="text-lg text-muted-foreground">Olá,</p>
                    <h1 className="text-3xl font-semibold">
                        {currentUser?.name}
                    </h1>
                </div>

                <div className="flex items-center gap-6 order-1 md:order-2">
                    <div className="flex items-center md:gap-3 gap-6">
                        <a
                            href="http://localhost:3003/weather/logs/export/csv/69358f8f43a1947916d73d46"
                            target="_self"
                            className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 transition"
                        >
                            Exportar CSV
                        </a>
                        <a
                            href="http://localhost:3003/weather/logs/export/xlsx/69358f8f43a1947916d73d46"
                            target="_self"
                            className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 transition"
                        >
                            Exportar Excel
                        </a>
                    </div>

                    <button
                        className="p-2 rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5 transition hover:bg-white/80"
                        onClick={handleLogout}
                    >
                        <DoorOpen className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {data.length > 0 ? (
                <>
                    <section className="grid lg:grid-cols-4 grid-cols-2 gap-x-5 mx-auto w-screen lg:w-5xl px-10 lg:px-0 gap-y-5">
                        <div className="grid grid-cols-2 md:flex rounded-4xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5 px-8 py-5 justify-between col-span-2">
                            <div className="flex flex-col justify-between">
                                <div className="flex flex-col gap-5">
                                    <div className="rounded-full bg-white px-2 flex items-center gap-2 py-1 md:text-base text-sm">
                                        <MapPin size={18} />
                                        {userCity}
                                    </div>
                                    <p className="text-xl md:text-2xl uppercase">
                                        {last.description}
                                    </p>
                                </div>

                                <div className="text-4xl md:text-6xl font-bold">
                                    {(last.temp - 273.15).toFixed(0)}°C
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <img
                                    src={`http://openweathermap.org/img/wn/${last.icon}@4x.png`}
                                    alt=""
                                />
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-amber-500 rounded-md py-1">
                                        <p className="text-sm md:text-base">
                                            Vento
                                        </p>
                                        <p className="text-sm md:text-base font-medium">
                                            {last.windSpeed}km
                                        </p>
                                    </div>
                                    <div className="bg-green-500 rounded-md py-1">
                                        <p className="text-sm md:text-base">
                                            Humidade
                                        </p>
                                        <p className="text-sm md:text-base font-medium">
                                            {last.humidity}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 col-span-2">
                            {insights.map(({ title, description }) => (
                                <Card
                                    key={title}
                                    title={title}
                                    description={description}
                                />
                            ))}
                        </div>
                    </section>

                    <section className="w-screen lg:w-5xl mx-auto px-10 lg:px-0">
                        <div>
                            <ChartAreaDefault
                                className="rounded-4xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5"
                                chartData={data}
                            />
                        </div>
                    </section>
                </>
            ) : (
                <div className="flex flex-col items-center text-center w-screen grow h-full lg:pt-10">
                    <div className="md:w-xl lg:w-md mx-auto px-10 lg:px-0">
                        <img
                            src={image}
                            alt="Imagem de uma mulher com caixas vazias"
                            className="w-full"
                        />
                    </div>

                    <h2 className="mt-6 text-2xl sm:text-3xl font-semibold text-gray-700">
                        Ops!
                    </h2>

                    <p className="mt-4 text-gray-500 max-w-md text-xl">
                        Parece que você ainda não tem dados. Não se preocupe,
                        estamos trabalhando nisso.
                    </p>
                </div>
            )}
        </div>
    );
}

function Card({ title, description }: { title: string; description: string }) {
    return (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl bg-linear-to-br from-white/20 to-white/5 p-5 rounded-2xl flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>

            <p className="text-base line-clamp-2">{description}</p>
        </div>
    );
}
