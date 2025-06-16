FROM node:18
RUN apt-get update && apt-get install -y netcat-openbsd
WORKDIR /app
COPY . .
RUN npm install
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
