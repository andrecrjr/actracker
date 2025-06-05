setup:
	docker compose down && docker compose up

run:
	docker compose stop && docker compose run

exec:
	docker exec -it actracker-app-1 sh

build:
	docker compose down && docker compose up -d && docker exec -it actracker-app-1 sh -c "cd /app && npm run deploy"
