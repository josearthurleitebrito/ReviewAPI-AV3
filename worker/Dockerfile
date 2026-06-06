# ── Build Stage ────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:worker

# ── Production Stage ───────────────────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist-worker ./dist-worker

CMD ["node", "dist-worker/src/main.js"]
