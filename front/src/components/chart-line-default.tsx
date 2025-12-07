'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import type { Weather } from '@/api/weather';

export const description = 'An interactive line chart';

// const chartData = [
//     { hour: '09h', temp: 23.1 },
//     { hour: '10h', temp: 24.3 },
//     { hour: '11h', temp: 25.0 },
//     { hour: '12h', temp: 26.2 },
//     { hour: '13h', temp: 27.1 },
//     { hour: '14h', temp: 27.5 },
//     { hour: '15h', temp: 27.3 },
// ];

const chartConfig = {
    temp: {
        label: 'Temperatura',
        color: '#CA1010',
    },
} satisfies ChartConfig;

export function ChartLineDefault({
    className,
    chartData,
}: {
    className?: string;
    chartData: Weather[];
}) {
    return (
        <Card className={`${className} pt-4 pb-0`}>
            <CardHeader className="flex flex-col items-stretch p-0! sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                    <CardTitle>Line Chart - Interactive</CardTitle>
                    <CardDescription>
                        Showing total visitors for the last 3 months
                    </CardDescription>
                </div>

                {/* Apenas temp */}
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[200px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} />

                        {/* === Horário corrido e simples === */}
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={20}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                const hour = date.toLocaleTimeString('pt-BR', {
                                    timeZone: 'America/Sao_Paulo',
                                    hour: '2-digit',
                                });
                                return `${hour}h`;
                            }}
                        />

                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="temp"
                                    labelFormatter={(value) => value}
                                />
                            }
                        />

                        <Line
                            dataKey="temp"
                            type="monotone"
                            stroke={chartConfig.temp.color}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
