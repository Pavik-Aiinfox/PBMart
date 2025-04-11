# Use Node.js 18 based on Debian Bullseye for better security
FROM node:18-bullseye-slim

# Set working directory
WORKDIR /usr/src/app

# Install security updates and dumb-init for signal handling
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
# Install all dependencies including devDependencies for development, or only production for NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then npm ci; else npm ci --only=production; fi

# Copy the rest of the application code
COPY . .

# Expose a dynamic port (overridden by docker-compose)
ARG PORT=3000
EXPOSE ${PORT}

# Optional health check (for Docker Compose)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT}/ || exit 1

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]

# Start the application, adjusted for potential api/index.js
CMD if [ "$NODE_ENV" = "development" ]; then npx nodemon ${ENTRY_POINT:-index.js}; else node ${ENTRY_POINT:-index.js}; fi