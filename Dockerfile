# Use an official Node.js image as the base
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the Prisma schema (make sure this is done before generating Prisma client)
COPY prisma ./prisma

# Generate Prisma client (run this before copying the rest of the application files)
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application (use the compiled main.js in the dist folder)
CMD ["node", "dist/main.js"]
