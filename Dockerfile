# Use Node.js 22 LTS as base image (modern, stable, compatible with React 19)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Expose Vite dev server port
EXPOSE 3060

# Start Vite dev server with host flag for external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]