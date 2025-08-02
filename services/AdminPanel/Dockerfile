FROM node:18-alpine

WORKDIR /app

COPY package.json ./

COPY build ./

EXPOSE 4173

CMD ["node", "--input-type=module", "index.js"]
