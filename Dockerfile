FROM node:23-alpine

WORKDIR /app/core-linked

COPY package*.json ./
RUN npm install

COPY . .

RUN npm link