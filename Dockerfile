FROM node:15-alpine3.10
COPY ./package.json .
RUN yarn
