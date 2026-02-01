# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat aide certains binaires (Prisma) sur alpine
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client
RUN npx prisma generate

# Next build
RUN npm run build

# ---- run ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# user non-root
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# 1) on copie seulement ce qu'il faut pour installer les deps
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# 2) on installe les deps (prisma CLI inclus) dans le runner
# (si prisma est en devDependencies, ça ne sera pas installé en prod → important, voir note)
RUN npm ci

# 3) on copie la build Next standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN apk add --no-cache libc6-compat netcat-openbsd

USER nextjs

EXPOSE 3000
CMD ["sh", "-lc", "until nc -z db 5432; do echo 'waiting for db...'; sleep 1; done; npx prisma migrate deploy && node server.js"]