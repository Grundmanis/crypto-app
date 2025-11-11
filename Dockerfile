# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build React frontend
WORKDIR /usr/src/app/client
RUN npm install
RUN npm run build

# Go back to the backend folder and build NestJS
WORKDIR /usr/src/app
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
# CMD ["node", "dist/main"]
CMD ["npm", "run", "start:dev"]