import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Res,
    BadRequestException,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import type { SaveWeatherLogsDto } from './dto/create-weather.dto';
import { generateWeatherInsights } from 'lib/ollama';
import { stringify } from 'csv-stringify';
import { pipeline } from 'stream/promises';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Controller('weather/logs')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) {}

    @Post()
    saveLogs(@Body() saveWeatherLogsDto: SaveWeatherLogsDto) {
        try {
            return this.weatherService.saveLog(saveWeatherLogsDto);
        } catch (error) {
            new BadRequestException('nao edu pra salvar');
        }
    }

    @Get(':userId')
    getLogs(@Param('userId') id: string) {
        return this.weatherService.findLogsByUserId(id);
    }

    @Delete(':userId')
    remove(@Param('userId') id: string) {
        return this.weatherService.removeLogsByUserId(id);
    }

    @Get('insights/:userId')
    async getIAInsights(@Param('userId') id: string) {
        const data = await this.weatherService.findLogsByUserId(id);
        const insights = await generateWeatherInsights(data);
        // console.log(data);
        console.log(insights);

        return { mesage: 'oi' };
    }

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
