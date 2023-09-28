# Use the official Node.js 20 image as the base image
FROM node:20 as build

RUN mkdir -p /app
WORKDIR /app

# Copy the rest of the frontend application code to the container
COPY frontend/ ./

# Install project dependencies
RUN npm install

# Expose the port your Node.js application uses
EXPOSE 3000

# Command to run the Node.js application
CMD ["npm", "run", "dev"]