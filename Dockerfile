FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY dist/src ./dist/src/

EXPOSE 80

CMD [ "npm", "start" ]