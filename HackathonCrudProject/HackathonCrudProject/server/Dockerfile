# Use a lightweight Node image
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the server (avoid nodemon in containers for prod)
CMD ["node", "index.js"]