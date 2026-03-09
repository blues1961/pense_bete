# Pense-bête

Pense-bête est une application personnelle, privée et authentifiée de **capture rapide** et de **suivi léger**.

Elle permet de noter rapidement des éléments à faire, à acheter, à relancer ou à revoir, sans imposer la rigidité d’un agenda centré sur l’heure.

L’application n’est pas publique. Toutes les données utilisateur sont privées, et chaque utilisateur ne doit pouvoir accéder qu’à ses propres items.

---

## Objectif

Le projet vise à fournir une application simple et cohérente avec le reste de l’écosystème applicatif existant.

Pense-bête est conçu pour :

* capturer rapidement une idée,
* suivre un dossier ouvert,
* garder en vue des éléments en attente,
* revoir des sujets à un moment pertinent,
* distinguer ce qui est à faire, à acheter, à relancer ou à archiver.

---

## Documentation de référence

Avant toute modification du projet, lire les documents suivants dans cet ordre :

1. `docs/INVARIANTS.md`
2. `docs/MVP.md`
3. `docs/CODEX_START.md`

### Rôle de chaque document

* **`docs/INVARIANTS.md`**

  * source de vérité du projet
  * règles techniques, structurelles, métier, UX et visuelles
  * conventions Docker / Compose, Django / React, auth, API, confidentialité

* **`docs/MVP.md`**

  * périmètre fonctionnel minimal attendu
  * ce qui doit être livré en priorité
  * ce qui est explicitement hors MVP

* **`docs/CODEX_START.md`**

  * consignes opérationnelles destinées à Codex
  * ordre de travail recommandé
  * références visuelles vers les projets existants
  * règles de cohérence à respecter avant de générer du code

En cas de conflit entre une proposition de code et la documentation, **`docs/INVARIANTS.md` prévaut**.

---

## Références visuelles

Pour conserver une cohérence visuelle avec les autres applications existantes, les projets de référence sont :

* `~/projets/gestionnaireMDP`
* `~/projets/calendrier`

Le but n’est pas de copier mécaniquement du code, mais de reprendre :

* le même langage visuel,
* la même sobriété,
* les mêmes patterns de formulaires,
* la même logique de navigation,
* des composants homogènes avec l’écosystème existant.

---

## Stack technique

Le projet utilise exclusivement :

* PostgreSQL
* Django
* Django REST Framework
* SimpleJWT
* React
* Vite
* Docker Compose

---

## Principes importants

* application privée et authentifiée
* aucune vue métier accessible anonymement
* chaque utilisateur voit uniquement ses propres items
* toutes les routes backend sous `/api/`
* frontend via `VITE_API_BASE=/api`
* proxy Vite local `/api` vers `http://backend:8000`
* cohérence stricte avec les invariants du projet

---

## Structure attendue du dépôt

```text
.
├── backend/
├── frontend/
├── docs/
│   ├── INVARIANTS.md
│   ├── MVP.md
│   └── CODEX_START.md
├── infra/
├── scripts/
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── Makefile
├── .env.dev
├── .env.prod
├── .env.local.example
└── README.md
```

---

## Démarrage du travail

Le dépôt doit être préparé localement avant toute génération de code importante.

Ordre recommandé :

1. préparer la structure du dépôt ;
2. valider les fichiers `.env*` ;
3. relire `docs/INVARIANTS.md` ;
4. relire `docs/MVP.md` ;
5. relire `docs/CODEX_START.md` ;
6. seulement ensuite commencer la génération du backend et du frontend.

---

## Statut actuel

Ce dépôt sert de base de travail pour construire l’application **Pense-bête** selon les invariants communs de l’écosystème existant, en particulier ceux repris du gestionnaire de mots de passe et adaptés au nouveau domaine métier.
