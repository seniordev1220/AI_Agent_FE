FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --force

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache --virtual .build-deps curl \
    && curl -sL https://unpkg.com/pm2@latest/bin/pm2 -o /usr/local/bin/pm2 \
    && chmod +x /usr/local/bin/pm2 \
    && apk del .build-deps

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy PM2 ecosystem file (create this file in your project)
COPY --chown=nextjs:nodejs ecosystem.config.js ./

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pm2-runtime", "ecosystem.config.js"]