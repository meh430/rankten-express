FROM node:latest

COPY . .

RUN npm install

EXPOSE 3000

CMD ["./wait-for-it.sh", "db:3306", "--", "./wait-for-it.sh", "redis:6379", "--", "node", "app.js"]