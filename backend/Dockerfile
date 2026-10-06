FROM node:18-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate && npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
