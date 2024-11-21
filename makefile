network:
	docker network create linkinpurry-network

db:
	docker compose --env-file ./backend/.env.docker up --build linkinpurry-db

# For local migration, not in container
prisma-migrate:
	cd backend && npx dotenv -e .env.local prisma migrate dev

# For local generate, not in container
prisma-generate:
	cd backend && npx dotenv -e .env.local prisma generate
	
be-dev:
	docker compose --env-file ./backend/.env.docker up --build linkinpurry-be-dev

be-prod:
	docker compose --env-file ./backend/.env.docker up --build linkinpurry-be-prod

stop:
	docker compose --env-file ./backend/.env.docker down

reset:
	docker compose --env-file ./backend/.env.docker down
	docker volume rm linkinpurry-db-data

