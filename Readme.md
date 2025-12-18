# 🌦️ Sistema de monitoramento climático

Este ecossistema de microserviços monitora dados climáticos em tempo real, processa informações através de mensageria, gera insights inteligentes via IA (Groq/Ollama) e disponibiliza tudo em um dashboard analítico.

# 🏗️ Arquitetura e Fluxo de Dados

A aplicação segue um fluxo de dados distribuído para garantir escalabilidade:Coleta (Python Worker): Busca dados da API OpenWeather periodicamente e os publica no RabbitMQ. Processamento (Go Worker): Consome a fila do RabbitMQ, valida/transforma os dados e os envia para a API central. Core API (NestJS + MongoDB): Gerencia o armazenamento, autenticação JWT, CRUD de usuários e integração com IA. Inteligência Artificial: Gera insights climáticos automáticos ou sob demanda utilizando Groq (Llama 3). Frontend (React): Dashboard moderno com shadcUI para visualização, exportação de dados (CSV/XLSX).

# 🛠️ Tecnologias Principais

-   React
-   Vite
-   TailwindCSS
-   ShadcnUI
-   TanStack Query
-   NestJS
-   TypeScript
-   MongoDB (Mongoose)
-   Python
-   Go
-   RabbitMQ
-   Groq
-   Docker

# 🚀 Como Executar

## Pré-requisitos

-   Docker e Docker Compose instalados.
-   Chave de API da OpenWeather.
-   API Key do Groq.
-   Clonar projeto.C
-   Configurar Variáveis de Ambiente
-   Crie um arquivo .env na raiz do projeto

```bash
# Chaves Externas
KEY_OPEN_WEATHER=
GROQ_KEY=

# Banco de Dados e Fila
DATABASE_URL=
RABBITMQ_URL=

# URLs de Comunicação
API_URL=
VITE_API_URL=
FRONT_URL=

# Segurança
JWT_SECRET=
```

```
docker-compose up -d --build
```
