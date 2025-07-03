FROM node:20-alpine

# Install dependencies for development
RUN apk add --no-cache \
    git \
    bash \
    curl

# Create workspace directory
WORKDIR /workspace/client

# Copy package files first for better caching
COPY client/package*.json ./

# Install dependencies
RUN npm ci || npm install

# The actual source code will be mounted as a volume
# This allows for hot-reloading during development

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]