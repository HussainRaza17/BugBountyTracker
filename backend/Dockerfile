# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Generate Prisma client (needs schema)
RUN npx prisma generate

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and prisma files
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Ensure uploads dir exists
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start compiled server
CMD ["node", "dist/index.js"]
