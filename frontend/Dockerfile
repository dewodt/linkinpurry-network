# Base
FROM node:20-alpine as base
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm ci
COPY ./frontend/ ./

# For development
FROM base as development
ENV NODE_ENV=development
CMD ["npm" , "run", "dev"]

# For production
FROM base as production
RUN npm run build
ENV NODE_ENV=production
CMD ["npm", "run", "start"]