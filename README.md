# LinkInPurry

## How To Run

## How To Install & Run

1. Clone the repository

   ```bash
   https://github.com/Labpro-21/if-3310-2024-2-k01-08
   ```

2. In each of the folder (backend and frontend) Create a `.env.<foo>` file and copy the value from `.env.<foo>.example` to it. (e.g. .env.docker and .env.local).

3. Create docker network

   ```bash
   make network
   ```

   or

   ```bash
   docker network create linkinpurry-network
   ```

4. Run the database.

   ```bash
   make db
   ```

   or

   ```bash
   docker compose up --build linkinpurry-db
   ```

5. Apply the migration to the database

   ```bash
   make prisma-migrate
   ```

   or

   ```bash
   cd backend && npx dotenv -e .env.local prisma migrate dev
   ```

6. Run the backend service

   - For development,

     ```bash
     make be-dev
     ```

     or

     ```bash
     docker compose --env-file ./backend/.env.docker up --build linkinpurry-be-dev
     ```

   - For production

     ```
     make be-prod
     ```

     or

     ```bash
     docker compose --env-file ./backend/.env.docker up --build linkinpurry-be-prod
     ```

7. Run the frontend SPA

   - For development,

     ```bash
     make fe-dev
     ```

     or

     ```bash
     docker compose --env-file ./frontend/.env.docker up --build linkinpurry-fe-dev
     ```

   - For production

     ```bash
     make fe-prod
     ```

     or

     ```bash
     docker compose --env-file ./frontend/.env.docker up --build linkinpurry-fe-prod
     ```

8. Stop the container

   ```bash
   make stop
   ```

   or

   ```bash
   docker compose down
   ```

9. Hard reset (delete docker volume for database & image storage)

   ```bash
   make reset
   ```

   or

   ```bash
   docker compose down
   docker volume rm linkinpurry-db-data
   docker volume rm linkinpurry-upload-data
   ```
