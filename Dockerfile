# Use an official Bun image as the base
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./

# Install dependencies inside the container
RUN bun install

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
