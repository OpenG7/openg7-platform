# syntax=docker/dockerfile:1.7

############################
# 1) Build image           #
############################
FROM node:20-bullseye AS build
WORKDIR /srv/openg7
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages ./packages
COPY openg7-org ./openg7-org
RUN corepack enable \
 && yarn install --immutable \
 && yarn --cwd openg7-org build:preprod

############################
# 2) Runtime image         #
############################
FROM node:20-bullseye-slim AS runtime
WORKDIR /srv/openg7
ENV NODE_ENV=production \
    PORT=4000
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY openg7-org/package.json openg7-org/package.json
RUN corepack enable \
 && yarn workspaces focus --production openg7-org
COPY --from=build /srv/openg7/openg7-org/dist/openg7-org ./openg7-org/dist/openg7-org
COPY openg7-org/scripts ./openg7-org/scripts
EXPOSE 4000
CMD ["node", "openg7-org/dist/openg7-org/server/server.mjs"]
