APP_ENV ?= dev
ENV_FILE := .env.$(APP_ENV)
COMPOSE_FILE := docker-compose.$(APP_ENV).yml

help:
	@echo "make up"
	@echo "make down"
	@echo "make ps"
	@echo "make logs"

up:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up -d

down:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) down

ps:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) ps

logs:
	docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) logs --tail=200