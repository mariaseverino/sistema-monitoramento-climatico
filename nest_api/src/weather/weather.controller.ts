import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Res,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import type { SaveWeatherLogsDto } from './dto/create-weather.dto';
import { stringify } from 'csv-stringify';
import { pipeline } from 'stream/promises';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { InsightService } from 'src/insight/insight.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('weather/logs')
export class WeatherController {
    constructor(
        private readonly weatherService: WeatherService,
        private readonly insightService: InsightService,
    ) {}

    @Post()
    async saveLogs(
        @Body() saveWeatherLogsDto: SaveWeatherLogsDto,
        @Res() resposne: Response,
    ) {
        try {
            await this.weatherService.saveLog(saveWeatherLogsDto);

            const data = await this.weatherService.findLogsByUserId(
                saveWeatherLogsDto.userId,
            );

            await this.insightService.removeInsightsById(
                saveWeatherLogsDto.userId,
            );

            await this.insightService.generateWeatherInsights(
                saveWeatherLogsDto.userId,
                data,
            );

            return resposne.send();
        } catch (error) {
            throw new BadRequestException();
        }
    }

    @UseGuards(AuthGuard)
    @Get(':userId')
    getLogs(@Param('userId') id: string) {
        return this.weatherService.findLogsByUserId(id);
    }

    @UseGuards(AuthGuard)
    @Delete(':userId')
    remove(@Param('userId') id: string) {
        return this.weatherService.removeLogsByUserId(id);
    }

    @UseGuards(AuthGuard)
    @Get('insights/:userId')
    async getIAInsights(@Param('userId') id: string) {
        return await this.insightService.findInsightsByUserId(id);
    }

    @UseGuards(AuthGuard)
    @Get('export/csv/:userId')
    async getCsLogs(@Param('userId') id: string, @Res() response: Response) {
        const logs = await this.weatherService.findLogsByUserId(id);

        response.setHeader('Content-Type', 'text/csv');
        response.setHeader(
            'Content-Disposition',
            `attachment; filename="user_${id}.weather_logs.csv"`,
        );

        await pipeline(
            logs,
            stringify({
                delimiter: ',',
                header: true,
                quote: false,
                columns: [
                    { key: '_id', header: 'ID' },
                    { key: 'description', header: 'Descricao' },
                    { key: 'temp', header: 'Temperatura' },
                    { key: 'humidity', header: 'Humidade' },
                    { key: 'windSpeed', header: 'Velocidade do vento' },
                ],
            }),
            response,
        );

        response.send();
    }

    @UseGuards(AuthGuard)
    @Get('export/xlsx/:userId')
    async getExcelogs(@Param('userId') id: string, @Res() response: Response) {
        const logs = await this.weatherService.findLogsByUserId(id);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Weather Logs');

        sheet.columns = [
            { key: '_id', header: 'ID', width: 32 },
            { key: 'description', header: 'Descricao', width: 12 },
            { key: 'temp', header: 'Temperatura', width: 14 },
            { key: 'humidity', header: 'Humidade', width: 12 },
            { key: 'windSpeed', header: 'Velocidade do vento', width: 20 },
        ];

        sheet.addRows(logs);

        response.setHeader('Content-Type', 'text/xlsx');
        response.setHeader(
            'Content-Disposition',
            `attachment; filename="user_${id}.weather_logs.xlsx"`,
        );

        await workbook.xlsx.write(response);

        return response.send();
    }
}
