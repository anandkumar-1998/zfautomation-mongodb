FROM node:20.11.1

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

#install files

RUN npm ci --include=dev --force

COPY . .

EXPOSE 3030

CMD ["npm", "run", "startprod"]