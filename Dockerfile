FROM node:alpine
COPY ./package.json .
RUN yarn

