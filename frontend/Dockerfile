FROM node:20.11.1

WORKDIR /usr/src/app

COPY . .

RUN npm install --production
RUN npm run build

CMD [ "npm","run","dev"]