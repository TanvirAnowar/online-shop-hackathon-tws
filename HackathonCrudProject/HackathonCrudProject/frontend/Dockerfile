# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Final stage: distroless Node runtime
FROM gcr.io/distroless/nodejs:20
WORKDIR /app

# Copy built assets and minimal server
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js

ENV NODE_ENV=production
EXPOSE 80

ENTRYPOINT ["node", "server.js"]