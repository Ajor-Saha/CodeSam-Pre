FROM node:18-alpine
WORKDIR /team
COPY . /team
RUN npm install
EXPOSE 8000
COPY .env ./.env 
CMD ["npm", "start"]