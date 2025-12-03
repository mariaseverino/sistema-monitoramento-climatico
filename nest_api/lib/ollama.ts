import { Ollama } from 'ollama';

const client = new Ollama({
    host: process.env.OLLAMA_URL!,
});

export async function generateWeatherInsights(data) {
    const prompt = `Você receberá dados climáticos no formato JSON. Retorne 3 insights. Origatoriamente a resposta dever ser em pt-br e no seguinte formato:
    {
        "insights": [
            { "title": "string", "description": "string" },
            { "title": "string", "description": "string" },
            { "title": "string", "description": "string" }
        ]
    }
    Aqui estão os dados climáticos: ${JSON.stringify(data)}`;

    const response = await client.chat({
        model: 'llama3',
        messages: [
            {
                role: 'system',
                content: 'Gere insights climáticos...',
            },
            { role: 'user', content: prompt },
        ],
    });

    return response.message.content;
}
