# I think from the specs we shouldn't modify much of this file

FROM node:20-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

ENV PORT=3000

EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]