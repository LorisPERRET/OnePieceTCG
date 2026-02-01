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

# Next standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema (migrate deploy en a besoin)
COPY --from=builder /app/prisma ./prisma

# ⚠️ Important pour Prisma runtime:
# selon setup, les engines peuvent être nécessaires
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
CMD ["sh", "-lc", "npx prisma migrate deploy && node server.js"]