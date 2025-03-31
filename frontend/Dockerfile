# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the project files
COPY . .

# Expose the port
EXPOSE 3000

# Start the frontend
CMD ["npm", "run", "dev"]
