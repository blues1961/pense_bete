# CODEX_START.md

## Mandat initial pour Codex

Tu travailles dans le dépôt `Pense-bête`.

L’objectif est de faire évoluer une application de notes, tâches et suivis personnels, sans casser :

* les invariants racine du template ;
* la logique métier propre à `Item` ;
* la distinction entre échéance (`due_date`) et réapparition (`review_at`) ;
* les contrats consommés par `Dashboard`.

Avant toute modification, lis :

1. `AGENTS.md`
2. `INVARIANTS.md`
3. `README_DEV.md`
4. `README.md`
5. `docs/INVARIANTS.md`
6. `docs/MVP.md`
7. `docs/CODEX_START.md`
8. `.env.template` si présent
9. `.env.dev`
10. `.env.prod`
11. `.env.local` si présent, sans afficher son contenu
12. `docker-compose.dev.yml`
13. `docker-compose.prod.yml`

---

## Domaine à préserver

`Pense-bête` sert à noter et suivre rapidement des éléments comme :

* tâches ;
* achats ;
* suivis ;
* appels ;
* idées ;
* documents à récupérer.

Règles :

* ne pas transformer le produit en agenda horaire ;
* garder la capture rapide prioritaire ;
* ne pas alourdir le flux de saisie sans raison forte ;
* traiter `review_at` comme un champ métier central.

---

## Dashboard

Le dashboard dépend de `Pense-bête` pour :

* ce qui est à afficher aujourd’hui ;
* la liste d’achats.

Donc :

* si tu modifies cette logique, maintiens les endpoints filtrés côté source ;
* ne déplace pas cette logique dans `Dashboard` ;
* mets à jour la doc si le contrat change.

---

## Workflow standard

Utilise d’abord les commandes du projet :

```bash
make init
make up
make migrate
make check
make backup
make restore
make update
```

---

## Ce qu’il ne faut pas faire

* ne pas réintroduire un service dev `vite` parallèle au service standard `frontend` ;
* ne pas exposer de secrets ;
* ne pas commiter `.env.local` ;
* ne pas casser les routes `/api/` ni l’usage de `/api` côté frontend ;
* ne pas dupliquer la logique métier dans le dashboard.
