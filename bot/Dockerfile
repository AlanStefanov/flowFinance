FROM node:24-alpine
WORKDIR /app

# Copy local node_modules (already installed)
COPY node_modules ./node_modules
COPY package.json ./

# Copy Prisma schema + bot source
COPY prisma ./prisma
COPY bot ./bot

# Generate Prisma client
RUN node node_modules/prisma/build/index.js generate

# Compile bot TypeScript
RUN node node_modules/typescript/bin/tsc -p bot/tsconfig.json

CMD ["node", "bot/dist/index.js"]
