# Use an official Bun image as the base
FROM oven/bun::1.2.9 AS builder

# Install OpenSSL and libssl for Prisma
RUN apt-get update && apt-get install -y openssl libssl1.1 || apt-get install -y libssl-dev

# Set the working directory inside the container
WORKDIR /app

# Copy only the package files (not the whole app) to leverage Docker cache
COPY package.json bun.lock ./

# Install dependencies inside the container
RUN timeout 180s bun install

# Copy the Prisma schema (make sure this is done before generating Prisma client)
COPY prisma ./prisma

# Generate Prisma client (run this before copying the rest of the application files)
RUN bun prisma generate

# Copy the rest of the application files
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application (use the compiled main.js in the dist folder)
CMD ["bun", "run", "start"]
