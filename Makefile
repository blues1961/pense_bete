ENV_LINK := .env
LOCAL_ENV_FILE := .env.local
DETECTED_APP_ENV := $(strip $(shell [ -f $(ENV_LINK) ] && awk -F= '/^APP_ENV=/{print $$2; exit}' $(ENV_LINK)))
APP_ENV ?= $(if $(DETECTED_APP_ENV),$(DETECTED_APP_ENV),dev)
ENV_FILE = .env.$(APP_ENV)
COMPOSE_FILE = docker-compose.$(APP_ENV).yml
COMPOSE_ENV_ARGS = --env-file $(ENV_LINK)
COMPOSE = docker compose $(COMPOSE_ENV_ARGS) -f $(COMPOSE_FILE)
FRONTEND_SERVICE = $(if $(filter prod,$(APP_ENV)),frontend,vite)
PROD_STATIC_ENV = APP_SLUG=pb \
	APP_ENV=prod \
	APP_HOST=pb.mon-site.ca \
	POSTGRES_USER=pb_pg_user \
	POSTGRES_DB=pb_pg_db \
	VITE_API_BASE=/api
PROD_ENV_EXPORT = set -a; . ./$(LOCAL_ENV_FILE); set +a;

ifneq ("$(wildcard $(LOCAL_ENV_FILE))","")
COMPOSE_ENV_ARGS += --env-file $(LOCAL_ENV_FILE)
endif

ifeq ($(APP_ENV),prod)
COMPOSE = $(PROD_ENV_EXPORT) \
	$(PROD_STATIC_ENV) \
	docker compose -f $(COMPOSE_FILE)
endif

.PHONY: help envlink ensure-env ensure-local-env up down restart ps logs logs-backend logs-frontend logs-db makemigrations migrate createsuperuser create-superuser psql dps dps-all prod-deploy prod-health prod-logs

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
	@echo "  make create-superuser"
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

ensure-local-env:
	@if [ "$(APP_ENV)" = "prod" ]; then \
		test -f "$(LOCAL_ENV_FILE)" || { echo "Fichier introuvable: $(LOCAL_ENV_FILE)"; exit 1; }; \
	fi

ensure-env: ensure-local-env

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

create-superuser: APP_ENV=prod
create-superuser: ensure-env
	@set -a; . ./$(LOCAL_ENV_FILE); set +a; \
		test -n "$$ADMIN_USERNAME" || { echo "ADMIN_USERNAME manquant dans $(LOCAL_ENV_FILE)"; exit 1; }; \
		test -n "$$ADMIN_EMAIL" || { echo "ADMIN_EMAIL manquant dans $(LOCAL_ENV_FILE)"; exit 1; }; \
		test -n "$$ADMIN_PASSWORD" || { echo "ADMIN_PASSWORD manquant dans $(LOCAL_ENV_FILE)"; exit 1; }; \
	$(PROD_STATIC_ENV) \
	docker compose -f $(COMPOSE_FILE) exec -T \
		-e ADMIN_USERNAME="$$ADMIN_USERNAME" \
		-e ADMIN_EMAIL="$$ADMIN_EMAIL" \
		-e ADMIN_PASSWORD="$$ADMIN_PASSWORD" \
		backend python manage.py shell -c "import os; from django.contrib.auth import get_user_model; username = os.environ['ADMIN_USERNAME']; email = os.environ['ADMIN_EMAIL']; password = os.environ['ADMIN_PASSWORD']; User = get_user_model(); user, created = User.objects.get_or_create(username=username, defaults={'email': email}); user.email = email; user.is_superuser = True; user.is_staff = True; if password: user.set_password(password); user.save(); action = 'created' if created else 'updated'; print(f\"Superuser '{username}' {action}.\")"
