FROM node:18-alpine

RUN apk add --no-cache coreutils mongodb-tools

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG ORIGIN
ENV ORIGIN=$ORIGIN

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]