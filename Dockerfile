FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY dist/src ./dist/src/

RUN npm run typeorm -- -d ./app/dist/src/typeorm/sqlclient.js

EXPOSE 80

CMD [ "npm", "start" ]