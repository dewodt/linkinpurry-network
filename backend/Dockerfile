# DOCKER FILE FOR STRESS TEST BACKEND
# I think from the specs we shouldn't modify much of this file

FROM node:20

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

COPY ./.env.example ./.env

ENV PORT=3000

EXPOSE 3000

# Generate prisma client
RUN npx prisma generate

# Start app
CMD ["npm", "run", "start"]
