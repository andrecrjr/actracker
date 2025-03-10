setup:
	docker compose down && docker compose up

run:
	docker compose stop && docker compose run
