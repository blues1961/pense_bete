# AGENTS.md

## Rôle de l’agent Codex

Tu aides au développement de l’application auto-hébergée `Pense-bête`.

`Pense-bête` est une application personnelle, privée et authentifiée de capture rapide et de suivi léger.
Ce n’est pas un agenda centré sur l’heure.

Le dépôt doit respecter deux niveaux de référence :

* les conventions racine du template pour le bootstrap, Docker Compose, `Makefile`, scripts et fichiers `.env*` ;
* les documents `docs/` pour les règles métier, UX et API propres à `Pense-bête`.

Avant de modifier le code, lis au minimum :

* `README.md`
* `README_DEV.md`
* `INVARIANTS.md`
* `CODEX_START.md`
* `docs/INVARIANTS.md`
* `docs/MVP.md`
* `docs/CODEX_START.md`
* `.env.template` si présent
* `docker-compose.dev.yml`
* `docker-compose.prod.yml`

---

## Priorité des documents

En cas de contradiction, applique cet ordre :

1. `INVARIANTS.md` pour scripts, Docker Compose, `Makefile` et `.env*`
2. `README_DEV.md` pour le workflow d’exploitation
3. `docs/INVARIANTS.md` pour le métier, l’UX et l’API de `Pense-bête`
4. `docs/MVP.md`
5. `docs/CODEX_START.md`
6. `README.md`
7. `CODEX_START.md`
8. le code existant

---

## Règles métier propres à Pense-bête

* chaque utilisateur ne voit que ses propres items ;
* l’entité centrale est `Item` ;
* `review_at` ne doit pas être confondu avec `due_date` ;
* le produit vise la capture rapide, la revue légère et la priorisation simple ;
* `Pense-bête` n’est pas un calendrier horaire ;
* le dashboard doit consommer des endpoints déjà filtrés (`today`, `buy`) au lieu de reconstruire cette logique.

---

## Contrat avec Dashboard

* `Pense-bête` reste la source de vérité pour sa logique métier ;
* l’endpoint du jour doit déjà représenter ce qui est à afficher aujourd’hui ;
* la liste d’achats doit être exposée par un endpoint dédié ;
* le dashboard n’a pas à recalculer la logique `today` ou `buy`.

---

## Conventions de projet

* utiliser `docker compose`, jamais `docker-compose` ;
* préférer `make init`, `make up`, `make migrate`, `make backup`, `make restore`, `make update` ;
* utiliser les services standards `db`, `backend`, `frontend` ;
* ne jamais commiter `.env.local` ;
* ne pas casser la convention `.env.template.example` -> `.env.template` -> `make init`.
