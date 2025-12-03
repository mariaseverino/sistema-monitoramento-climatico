FROM golang:1.22-alpine AS build

RUN apk add --no-cache git

WORKDIR /app

# Copia todo o projeto para dentro do contêiner
COPY . .

# Cria automaticamente o go.mod, se não existir
RUN if [ ! -f go.mod ]; then go mod init worker; fi

# Instala a dependência do RabbitMQ
RUN go get github.com/rabbitmq/amqp091-go

# Ajusta e baixa tudo
RUN go mod tidy

# Compila o projeto
RUN CGO_ENABLED=0 GOOS=linux go build -o worker .

# Imagem mínima para rodar o binário
FROM alpine:latest
WORKDIR /app

COPY --from=build /app/worker .

CMD ["./worker"]


# go run main.go
# go build main.go