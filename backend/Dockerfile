FROM node:20-alpine
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directories for data and uploads
RUN mkdir -p /app/data /app/uploads && \
    chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 8080
CMD ["node", "server.js"]
