FROM node:18

WORKDIR /app

COPY package*.json ./

RUN rm -rf node_modules && npm install


COPY . .

EXPOSE 5173

CMD ["npx", "vite", "--host"]
