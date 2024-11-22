# syntax = docker/dockerfile:1.3

# https://hub.docker.com/_/node
ARG NODE_VERSION=23-bullseye-slim

FROM node:$NODE_VERSION

RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init

ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN npm install
#RUN npm install debug

ENV P2POOL_URL=${P2POOL_URL:-http://127.0.0.1:19000}

EXPOSE 3000

USER node
CMD ["dumb-init", "node", "server.js"]
