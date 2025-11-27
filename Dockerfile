FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --production
RUN cd client && npm install --production

# Copy application files
COPY . .

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/index.js"]
