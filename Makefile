ENV_LINK := .env
LOCAL_ENV_FILE := .env.local
DETECTED_APP_ENV := $(strip $(shell [ -f $(ENV_LINK) ] && awk -F= '/^APP_ENV=/{print $$2; exit}' $(ENV_LINK)))
APP_ENV ?= $(if $(DETECTED_APP_ENV),$(DETECTED_APP_ENV),dev)
ENV_FILE = .env.$(APP_ENV)
COMPOSE_FILE = docker-compose.$(APP_ENV).yml
COMPOSE_ENV_ARGS = --env-file $(ENV_LINK)
COMPOSE = docker compose $(COMPOSE_ENV_ARGS) -f $(COMPOSE_FILE)
FRONTEND_SERVICE = $(if $(filter prod,$(APP_ENV)),frontend,vite)

ifneq ("$(wildcard $(LOCAL_ENV_FILE))","")
COMPOSE_ENV_ARGS += --env-file $(LOCAL_ENV_FILE)
endif

.PHONY: help envlink ensure-env up down restart ps logs logs-backend logs-frontend logs-db makemigrations migrate createsuperuser psql dps dps-all prod-deploy prod-health prod-logs

help:
	@echo "Cibles disponibles pour $(APP_ENV) :"
	@echo "  make envlink APP_ENV=dev|prod"
	@echo "  make ensure-env"
	@echo "  make up"
	@echo "  make down"
	@echo "  make restart"
	@echo "  make ps"
	@echo "  make logs"
	@echo "  make logs-backend"
	@echo "  make logs-frontend"
	@echo "  make logs-db"
	@echo "  make makemigrations"
	@echo "  make migrate"
	@echo "  make createsuperuser"
	@echo "  make psql"
	@echo "  make dps"
	@echo "  make dps-all"
	@echo "  make prod-deploy"
	@echo "  make prod-health"
	@echo "  make prod-logs"

envlink:
	@test -f "$(ENV_FILE)" || { echo "Fichier introuvable: $(ENV_FILE)"; exit 1; }
	@ln -sfn "$(ENV_FILE)" "$(ENV_LINK)"
	@echo "$(ENV_LINK) -> $(ENV_FILE)"

ensure-env:
	@test -f "$(ENV_FILE)" || { echo "Fichier introuvable: $(ENV_FILE)"; exit 1; }
	@test -L "$(ENV_LINK)" || { echo "$(ENV_LINK) doit etre un lien symbolique vers $(ENV_FILE). Lancez: make envlink APP_ENV=$(APP_ENV)"; exit 1; }
	@test "$$(readlink $(ENV_LINK))" = "$(ENV_FILE)" || { echo "$(ENV_LINK) doit pointer vers $(ENV_FILE). Lancez: make envlink APP_ENV=$(APP_ENV)"; exit 1; }
	@test -f "$(COMPOSE_FILE)" || { echo "Fichier introuvable: $(COMPOSE_FILE)"; exit 1; }

up: ensure-env
	$(COMPOSE) up -d

down: ensure-env
	$(COMPOSE) down

restart: ensure-env
	$(COMPOSE) down
	$(COMPOSE) up -d

ps: ensure-env
	$(COMPOSE) ps

logs: ensure-env
	$(COMPOSE) logs --tail=200

logs-backend: ensure-env
	$(COMPOSE) logs --tail=200 backend

logs-frontend: ensure-env
	$(COMPOSE) logs --tail=200 $(FRONTEND_SERVICE)

logs-db: ensure-env
	$(COMPOSE) logs --tail=200 db

makemigrations: ensure-env
	$(COMPOSE) exec backend python manage.py makemigrations

migrate: ensure-env
	$(COMPOSE) exec backend python manage.py migrate

createsuperuser: ensure-env
	$(COMPOSE) exec backend python manage.py createsuperuser

psql: ensure-env
	$(COMPOSE) exec db sh -lc 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

dps: ensure-env
	$(COMPOSE) ps

dps-all:
	docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

prod-deploy: APP_ENV=prod
prod-deploy: ensure-env
	$(COMPOSE) up -d --build

prod-health: APP_ENV=prod
prod-health: ensure-env
	$(COMPOSE) ps

prod-logs: APP_ENV=prod
prod-logs: ensure-env
	$(COMPOSE) logs --tail=200
