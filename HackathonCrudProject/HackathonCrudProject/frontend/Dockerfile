# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Final stage: lightweight Node runtime (use alpine instead of gcr.io/distroless)
FROM node:20-alpine
WORKDIR /app

# Copy static assets and minimal server
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js

ENV NODE_ENV=production
EXPOSE 80

CMD ["node", "server.js"]