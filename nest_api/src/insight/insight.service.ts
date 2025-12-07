import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Insight } from './insight.schema';
import { Model } from 'mongoose';
import { Weather } from 'src/weather/weather.schema';
import { groq } from 'lib/groq';

interface CreateInsightDto {
    userId: string;
    title: string;
    description: string;
}

@Injectable()
export class InsightService {
    constructor(
        @InjectModel(Insight.name) private readonly insight: Model<Insight>,
    ) {}

    async save(createInsightDto: CreateInsightDto) {
        const newInsight = await this.insight.create(createInsightDto);
        newInsight.save();
    }

    async findInsightsByUserId(userId: string) {
        return await this.insight.find({ userId }).exec();
    }

    async removeInsightsById(userId: string) {
        await this.insight.deleteMany({ userId }).exec();
    }

    async generateWeatherInsights(userId: string, data: Weather[]) {
        const instructionJson = `"{\"role\": \"Consultor de Ação Diária e Bem-Estar\", \"task\": \"Gerar uma lista de 4 insights acionáveis e altamente relevantes para o dia a dia do usuário, baseados nos dados climáticos fornecidos. O foco deve ser em dicas práticas de conforto térmico, segurança, e saúde.\", \"input_data_description\": \"Você receberá uma lista ou objeto contendo dados climáticos detalhados da região do usuário. Estes dados incluirão, mas não se limitarão a: temperatura horária, umidade relativa, velocidade do vento, índice UV, previsão de precipitação, e possivelmente pontos de orvalho e índices de sensação térmica (ex: 'Heat Index' ou 'Wind Chill').\", \"output_format\": \"JSON. A saída deve ser um objeto JSON contendo uma única chave 'insights', cujo valor é uma lista (array) de objetos. Cada objeto na lista deve ter exatamente duas propriedades: 'title' e 'description'.\", \"insight_categories_required\": [\"1. **Conforto e Atividade:** Recomendações sobre os melhores horários para exercícios ou abrir janelas para ventilação natural.\", \"2. **Alerta de Segurança:** Avisos sobre riscos (chuva, calor extremo, vento, UV) e como se proteger.\", \"3. **Saúde e Vestuário:** Dicas específicas sobre hidratação, proteção solar ou vestuário ideal para a sensação térmica do dia.\"], \"constraints\": [\"Cada insight deve ser direto, relevante e baseado estritamente nos dados fornecidos.\", \"A 'title' deve ser um resumo curto (máximo 5 palavras) do insight.\", \"A 'description' deve ser uma dica prática com foco em 'o que fazer' e 'o benefício' para o conforto ou segurança do usuário, com no máximo 5 palavras.\", \"Gere exatamente 2 insights no total, focando nas informações mais críticas e acionáveis.\"], \"example_output\": {\"insights\": [{\"title\": \"Horário Fresco para Exercício\", \"description\": \"Aproveite a brisa ideal entre 16:00 e 18:30 para caminhar ou correr com mais conforto.\"}, {\"title\": \"Alerta: Dirija com Cuidado\", \"description\": \"Há risco de alagamentos e visibilidade reduzida entre 10h e 13h. Evite rotas conhecidas por inundações.\"}, {\"title\": \"Hidratação Essencial\", \"description\": \"Beba água constantemente! A baixa umidade do ar acelera a desidratação, mesmo sem sentir sede.\"}, {\"title\": \"Protetor Solar Duplo\", \"description\": \"O Índice UV está alto. Use filtro solar e óculos escuros o dia todo para proteger a pele e os olhos.\"}]}}"`;

        const prompt = `
        Instruções para a IA:
        ${instructionJson}

        Dados Climáticos para Análise:
        ${JSON.stringify(data)}

        Gere a saída JSON estritamente seguindo o 'output_format' definido.
    `;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_completion_tokens: 1024,
            top_p: 1,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            return;
        }

        const json = JSON.parse(content);

        if (!json.insights || !Array.isArray(json.insights)) {
            console.log('JSON sem campo insights', json);
            return;
        }

        for (const insight of json.insights) {
            await this.save({
                userId,
                title: insight.title,
                description: insight.description,
            });
        }
    }
}
