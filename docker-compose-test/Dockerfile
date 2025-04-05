FROM node:18.0-alpine3.14 as build-stage

WORKDIR /app

# 使用通配符来确保 package.json 和 package-lock.json 被复制
COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install
# 复制源代码
COPY . .

RUN npm run build

# production stage
FROM node:18.0-alpine3.14 as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install --production

EXPOSE 3000

CMD ["node", "/app/main.js"]
