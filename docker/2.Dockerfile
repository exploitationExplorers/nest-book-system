FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install -g http-server

EXPOSE 8080

VOLUME /app`

CMD ["http-server", "-p", "8080"]
