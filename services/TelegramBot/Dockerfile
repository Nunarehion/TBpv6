# syntax=docker/dockerfile:1
FROM python:3.12-alpine
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
# WORKDIR /app
RUN ls -R /app

CMD ["python", "-m", "run"]