FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
