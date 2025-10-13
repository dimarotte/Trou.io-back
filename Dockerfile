# Étape 1 : Builder les fichiers TS
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 : Image de production
FROM node:18

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production

EXPOSE 2567

CMD ["node", "dist/index.js"]
