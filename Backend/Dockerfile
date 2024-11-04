FROM node:18-alpine


WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --silent

COPY . .

# Correctly specify the command to run
CMD ["node", "test.js"]  # Adjust the filename as necessary
