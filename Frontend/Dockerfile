# Use the official Node.js image
FROM node:lts-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --silent

# Copy the rest of your application code
COPY . .

# Expose the desired port (if needed)
EXPOSE 3000

# Command to run your application
CMD ["npm", "run", "preview"]
