# Use official Node.js image as the base
FROM node:20

# Install Bun globally
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/bun

# Install OpenSSL and libssl (for Prisma compatibility)
RUN apt-get update && \
    apt-get install -y openssl libssl-dev

# Set working directory
WORKDIR /app

# Copy lock files and package.json for efficient Docker caching
COPY package.json package-lock.json* bun.lock ./

# Install dependencies using npm
RUN npm install

# Optional: Dry-run bun install to validate bun.lockb (optional)
RUN bun install --dry-run || true

# Copy Prisma schema first for client generation
COPY prisma ./prisma

# Generate Prisma client
RUN bun x prisma generate

# Copy the rest of your application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application using Bun
CMD ["bun", "run", "start"]
