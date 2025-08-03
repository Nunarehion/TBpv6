FROM node:18-alpine

RUN apk add --no-cache mongodb-tools

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG ORIGIN
ENV ORIGIN=$ORIGIN

EXPOSE 5173

#rjvbn
CMD ["npm", "run", "dev", "--", "--host"]