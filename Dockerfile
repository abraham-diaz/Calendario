FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ src/
RUN npm run build && npm prune --omit=dev

COPY public/ public/

EXPOSE 3000

CMD ["node", "dist/server.js"]
