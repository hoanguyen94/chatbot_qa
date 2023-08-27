FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

COPY entrypoint.sh ./

RUN chmod +x /app/entrypoint.sh

RUN npm ci --omit=dev

COPY dist/src ./dist/src/

# RUN npm run typeorm schema:sync -- -d dist/src/storage/typeorm/sqlClient.js

EXPOSE 80

# CMD [ "npm", "start" ]
CMD ["/app/entrypoint.sh"]