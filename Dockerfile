# Use the official Node.js image with Alpine
FROM node:23-slim

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV PORT=8080

# Expose the application port
EXPOSE $PORT

# Start the application
CMD ["pnpm", "start"]
