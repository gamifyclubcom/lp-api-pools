FROM node:16-alpine as development

WORKDIR /app

RUN chown -R node:node /app

COPY --chown=node:node ["package.json", "package-lock.json", "./"]

USER node

RUN npm ci --no-optional

COPY --chown=node:node . .

RUN npm run build

# PRODUCTION

FROM node:16-alpine as production

WORKDIR /app

RUN chown -R node:node /app

COPY --chown=node:node package*.json ./

RUN npm install --only=production

COPY --chown=node:node . .

COPY --chown=node:node --from=development /app/dist ./dist

CMD ["node", "dist/main"]
