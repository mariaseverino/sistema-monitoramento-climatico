FROM node:20-alpine

WORKDIR /app

COPY users.json ./

RUN npm install json-server

EXPOSE 3000

ENTRYPOINT ["npx", "json-server", "users.json"]