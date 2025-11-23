# syntax=docker/dockerfile:1.7

FROM node:20-bullseye-slim AS builder
ENV NODE_ENV=development
WORKDIR /workspace

# Install workspace dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/
COPY strapi/package.json strapi/
COPY packages/contracts/package.json packages/contracts/
RUN corepack enable \
  && yarn install --immutable

# Copy sources and build artefacts
COPY . .
RUN yarn workspace @openg7/contracts build \
  && yarn workspace @openg7/strapi build \
  && yarn workspaces focus --production @openg7/strapi

FROM node:20-bullseye-slim AS runner
ENV NODE_ENV=production
ENV PORT=1337
ENV STRAPI_TELEMETRY_DISABLED=true
WORKDIR /srv/app

COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/strapi ./strapi
COPY --from=builder /workspace/strapi/node_modules ./strapi/node_modules
COPY --from=builder /workspace/package.json ./package.json
COPY --from=builder /workspace/yarn.lock ./yarn.lock
COPY --from=builder /workspace/.yarnrc.yml ./.yarnrc.yml

WORKDIR /srv/app/strapi
VOLUME ["/srv/app/strapi/public/uploads"]
EXPOSE 1337
CMD ["node", "../node_modules/.bin/strapi", "start"]
