# Base
FROM node:20-alpine as base
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend/ ./

# For development
FROM base as development
CMD ["npm" , "run", "dev"]

# For production
FROM base as production
CMD ["npm", "run", "start"]