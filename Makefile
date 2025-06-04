setup:
	docker compose down && docker compose up

run:
	docker compose stop && docker compose run

exec:
	docker exec -it actracker-app-1 sh
