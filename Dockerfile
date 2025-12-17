
# Use Node 20 (Lightweight Alpine version)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start command (using dev script for hot-reloading with volumes)
CMD ["npm", "run", "dev"]
