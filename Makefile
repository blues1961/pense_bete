APP_ENV ?= dev
ENV_FILE := .env.$(APP_ENV)
LOCAL_ENV_FILE := .env.local
COMPOSE_FILE := docker-compose.$(APP_ENV).yml
COMPOSE_ENV_ARGS := --env-file $(ENV_FILE)

ifneq ("$(wildcard $(LOCAL_ENV_FILE))","")
COMPOSE_ENV_ARGS += --env-file $(LOCAL_ENV_FILE)
endif

help:
	@echo "make up"
	@echo "make down"
	@echo "make ps"
	@echo "make logs"

up:
	docker compose $(COMPOSE_ENV_ARGS) -f $(COMPOSE_FILE) up -d

down:
	docker compose $(COMPOSE_ENV_ARGS) -f $(COMPOSE_FILE) down

ps:
	docker compose $(COMPOSE_ENV_ARGS) -f $(COMPOSE_FILE) ps

logs:
	docker compose $(COMPOSE_ENV_ARGS) -f $(COMPOSE_FILE) logs --tail=200
