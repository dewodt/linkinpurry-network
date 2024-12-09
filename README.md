# LinkInPurry

## Description

LinkInPurry is a professional networking platform built for O.W.C.A. (Organisasi Warga Cool Abiez) agents to connect, share updates, and communicate securely. The platform is built as a Single Page Application (SPA) using React for the frontend and Hono.js for the backend, offering real-time features and a seamless user experience.

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

5. Run redis.

   ```bash
   make redis
   ```

   or

   ```bash
   docker compose --env-file ./backend/.env.docker up --build linkinpurry-redis
   ```

6. Apply the migration to the database

   ```bash
   make prisma-migrate
   ```

   or

   ```bash
   cd backend && npx dotenv -e .env.local prisma migrate dev
   ```

7. Run the database seeder (for non-empty starting state)

   ```bash
   make seeder
   ```

   or

   ```bash
   docker compose --env-file ./backend/.env.docker up --build linkinpurry-seeder

   ```

8. Run the backend service

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

9. Run the frontend SPA

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

10. Stop all of the container (other stop commands can be seen from the makefile file)

    ```bash
    make stop
    ```

    or

    ```bash
    docker compose down
    ```

11. Hard reset (delete docker volume for database & image storage)

    ```bash
    make reset
    ```

    or

    ```bash
    docker compose down
    docker volume rm linkinpurry-db-data
    docker volume rm linkinpurry-upload-data
    ```

## API Documentation

After running the backend service, you can go visit [http://localhost:3000/docs](http://localhost:3000/docs) to see the API documentation.

## Contributors

### Server-side:

13522009: Connection list, request list endpoint.
13522011: Semua endpoint
13522015: Request connect endpoint.

### Client side:

13522009: Connection list, request list page
13522011: Semua page
13522015: Feed Page, Login Page, Register Page
