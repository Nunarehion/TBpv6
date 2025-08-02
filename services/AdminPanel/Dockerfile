# Используем легковесный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости, необходимые для продакшена.
# Это создаст папку node_modules внутри контейнера.
RUN npm install --omit=dev

# Копируем собранный проект.
COPY build ./

# Открываем порт
EXPOSE 4173

# Запускаем приложение
CMD ["sh", "-c", "PORT=3000 HOST=0.0.0.0 node index.js"]