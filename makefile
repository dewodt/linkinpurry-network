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

fe-dev:
	docker compose --env-file ./frontend/.env.docker up --build linkinpurry-fe-dev

fe-prod:
	docker compose --env-file ./frontend/.env.docker up --build linkinpurry-fe-prod

seeder:
	docker compose --env-file ./backend/.env.docker up --build linkinpurry-seeder

stop-be-dev:
	docker stop linkinpurry-be-dev
	docker rm linkinpurry-be-dev

stop-be-prod:
	docker stop linkinpurry-be-prod
	docker rm linkinpurry-be-prod

stop-fe-dev:
	docker stop linkinpurry-fe-dev
	docker rm linkinpurry-fe-dev

stop-fe-prod:
	docker stop linkinpurry-fe-prod
	docker rm linkinpurry-fe-prod

stop:
	docker compose --env-file ./backend/.env.docker down

reset:
	docker compose --env-file ./backend/.env.docker down
	docker volume rm linkinpurry-db-data
	docker volume rm linkinpurry-upload-data

