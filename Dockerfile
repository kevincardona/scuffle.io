FROM node:14.6
ENV NODE_ENV=production 
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

EXPOSE 3001
CMD ["yarn", "start"]

