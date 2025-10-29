FROM node:20-alpine
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directories for data and uploads
RUN mkdir -p /app/data /app/uploads

EXPOSE 8080
CMD ["node", "server.js"]
