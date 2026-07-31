FROM node:24.16.0-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Using a creative port number for Raspberry Pi hosting
EXPOSE 8443

CMD ["npm", "start"]
