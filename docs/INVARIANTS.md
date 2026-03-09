---

title: "INVARIANTS — Pense-bête"
project: "Pense-bête"
app_name: "Pense-bête"
app_slug: "pb"
repo: "pense_bete"
status: "normatif"
------------------

# INVARIANTS — Pense-bête

## 0) Rôle du document

Ce document fixe les invariants techniques, structurels, métier, visuels et ergonomiques du projet **Pense-bête**.

Il sert de **source de vérité** pour :

* l’infrastructure locale et serveur,
* les conventions Docker / Compose,
* la structure Django / React,
* les variables d’environnement,
* les règles frontend/backend,
* la cohérence visuelle avec les autres applications existantes,
* les consignes à respecter par Codex et tout autre agent.

En cas de conflit entre une proposition de code et ce document, **ce document prévaut**.

---

## 1) Identité du projet

Pense-bête est une application personnelle, privée et authentifiée.
Elle n’est pas destinée à un accès public anonyme.
Toutes les données utilisateur sont privées, et chaque utilisateur ne doit pouvoir accéder qu’à ses propres items.

### 1.1 Nommage canonique

* **Nom humain** : `Pense-bête`
* **Nom dépôt Git** : `pense_bete`
* **Slug technique** : `pb`
* **Répertoire DEV** : `~/projets/pense_bete`
* **Répertoire PROD** : `/opt/apps/pb`

### 1.2 Variables d’identité

Les variables suivantes sont obligatoires :

* `APP_NAME=Pense-bête`
* `APP_DEPOT=pense_bete`
* `APP_SLUG=pb`
* `APP_ENV=dev|prod`
* `APP_NO=<entier unique>`

### 1.3 Rôle de `APP_NO`

`APP_NO` est l’identifiant numérique unique de l’application dans l’écosystème local.
Il sert à dériver les ports hôte en DEV.

---

## 2) Principes d’architecture

### 2.1 Stack imposée

Le projet utilise exclusivement :

* **PostgreSQL**
* **Django + Django REST Framework**
* **SimpleJWT**
* **React + Vite**
* **Docker Compose**
* **Traefik** comme frontal unique côté serveur

### 2.2 Interdictions

Il est interdit de :

* remplacer PostgreSQL par SQLite,
* remplacer Django par un autre backend,
* remplacer Vite/React par une autre stack frontend,
* exposer directement les apps en PROD sur 80/443,
* contourner Traefik,
* introduire une seconde architecture concurrente,
* modifier les noms canoniques des services Compose,
* stocker des secrets dans les fichiers `.env.dev` ou `.env.prod`.

### 2.3 Objectif du projet

Pense-bête est une application de **capture rapide** et de **suivi léger**.

Ce n’est pas un agenda centré sur l’heure.
C’est une application conçue pour :

* noter rapidement une idée ou une tâche,
* suivre un dossier ouvert,
* revoir des choses à penser ou à relancer,
* distinguer ce qui est à faire, en attente, à acheter ou à revoir.

---

## 3) Répertoires, nommage Docker et conventions système

### 3.1 Répertoires

* **DEV** : `~/projets/${APP_DEPOT}`
* **PROD** : `/opt/apps/${APP_SLUG}`

### 3.2 Nommage Docker

* Containers : `${APP_SLUG}_<service>_${APP_ENV}`
* Réseau par défaut : `${APP_SLUG}_appnet`
* Volume DB recommandé : `${APP_SLUG}_db_data`

### 3.3 Services Compose canoniques

Les services autorisés et attendus sont :

* `db`
* `backend`
* `vite`
* `frontend`

Ces noms sont **stables** et ne doivent pas être renommés.

---

## 4) Ports dérivés de `APP_NO`

### 4.1 Règle canonique

Si `APP_NO = N`, alors en DEV :

* `DEV_DB_PORT   = 5432 + N`
* `DEV_API_PORT  = 8001 + N`
* `DEV_VITE_PORT = 5173 + N`

### 4.2 Ports internes fixes

Les ports internes des conteneurs sont **toujours** :

* DB : `5432`
* backend : `8000`
* vite : `5173`

Seuls les ports **hôte** varient via `APP_NO`.

### 4.3 Exemple pour Pense-bête

Si `APP_NO=5`, alors :

* `DEV_DB_PORT=5437`
* `DEV_API_PORT=8006`
* `DEV_VITE_PORT=5178`

---

## 5) Environnements et secrets

### 5.1 Fichiers canoniques

Fichiers versionnés :

* `.env.dev`
* `.env.prod`
* `.env.local.example`

Fichier non versionné :

* `.env.local`

Symlink canonique :

* `.env -> .env.$(APP_ENV)`

### 5.2 Règles de secrets

Interdit dans `.env.dev` et `.env.prod` :

* `POSTGRES_PASSWORD`
* `DJANGO_SECRET_KEY`
* `ADMIN_USERNAME`
* `ADMIN_EMAIL`
* `ADMIN_PASSWORD`
* tout autre secret réel

Autorisé dans `.env.local` seulement :

* `POSTGRES_PASSWORD`
* `DJANGO_SECRET_KEY`
* `ADMIN_USERNAME`
* `ADMIN_EMAIL`
* `ADMIN_PASSWORD`

### 5.3 Exemples

#### `.env.dev`

```dotenv
APP_ENV=dev
APP_NAME=Pense-bête
APP_DEPOT=pense_bete
APP_SLUG=pb
APP_NO=5

POSTGRES_USER=${APP_SLUG}_pg_user
POSTGRES_DB=${APP_SLUG}_pg_db

DEV_DB_PORT=5437
DEV_API_PORT=8006
DEV_VITE_PORT=5178

VITE_API_BASE=/api
```

#### `.env.prod`

```dotenv
APP_ENV=prod
APP_NAME=Pense-bête
APP_DEPOT=pense_bete
APP_SLUG=pb
APP_NO=5
APP_HOST=pb.mon-site.ca

POSTGRES_USER=${APP_SLUG}_pg_user
POSTGRES_DB=${APP_SLUG}_pg_db

VITE_API_BASE=/api
```

#### `.env.local.example`

```dotenv
POSTGRES_PASSWORD=change_me
DJANGO_SECRET_KEY=change_me
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.test
ADMIN_PASSWORD=change_me
```

---

## 6) Postgres — invariants de connexion

### 6.1 Invariants

* **Host compose** : `db`
* **Port interne** : `5432`
* **Utilisateur** : `${POSTGRES_USER}` = `${APP_SLUG}_pg_user`
* **Base** : `${POSTGRES_DB}` = `${APP_SLUG}_pg_db`

### 6.2 Accès hors conteneur

En DEV, si publication activée :

* `localhost:${DEV_DB_PORT}`

En PROD :

* ne pas publier la DB publiquement,
* privilégier un tunnel SSH ponctuel si nécessaire.

### 6.3 Commandes `psql` canoniques

Depuis le conteneur backend :

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yml exec backend \
  psql -h db -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\dt'
```

Depuis l’hôte si port publié :

```bash
psql -h localhost -p "$DEV_DB_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c 'select 1;'
```

---

## 7) Conteneurisation (Compose)

### 7.1 Règles générales

* Utiliser exclusivement `docker compose`
* Toujours fournir `--env-file`
* Conserver deux fichiers :

  * `docker-compose.dev.yml`
  * `docker-compose.prod.yml`

### 7.2 Services

* `db` : Postgres
* `backend` : Django API
* `vite` : serveur dev frontend
* `frontend` : build statique / service web selon le mode

### 7.3 Healthchecks et dépendances

* `backend` dépend de `db` healthy
* `vite` peut dépendre de `backend` en DEV
* le système doit démarrer sans ordre implicite fragile

### 7.4 PROD et exposition réseau

En PROD :

* ne jamais publier 80/443 depuis l’application,
* Traefik reste le frontal unique,
* un bind local `127.0.0.1:PORT->8000` peut exister pour debug/health local seulement.

---

## 8) Backend Django (API)

### 8.1 Règles générales

* commande DEV : `python manage.py runserver 0.0.0.0:8000`
* toutes les routes backend sont sous le préfixe `/api/`
* auth JWT via **SimpleJWT**
* API REST via **DRF**
* base de données PostgreSQL uniquement

### 8.2 Règles d’auth

* `JWTAuthentication` doit être activé
* les endpoints JWT doivent exister
* une route `whoami` ou équivalent doit exister
* l’API doit être utilisable via le proxy Vite `/api`
* l’application doit être protégée par authentification, comme le calendrier et le gestionnaire de mots de passe
* aucune vue métier ne doit être accessible à un utilisateur anonyme, sauf les endpoints strictement nécessaires à l’authentification, à la santé et au CSRF si requis

### 8.3 Structure recommandée

```text
backend/
├── api/
│   ├── migrations/
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py
│   ├── urls.py
│   ├── views.py
│   ├── views_auth.py
│   └── views_login.py / views_logout.py (si conservés)
├── pb/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── Dockerfile.dev
├── Dockerfile.prod
├── manage.py
└── requirements.txt
```

### 8.4 Permissions

Chaque utilisateur ne voit que ses propres objets.
Aucun objet métier ne doit être global par défaut.

Règles :

* filtrer les querysets par `request.user`
* object-level permissions strictes
* pas de fuite de données inter-utilisateurs

### Invariants de confidentialité et d’accès

- **Pense-bête n’est pas une application publique.**
- **Toutes les données utilisateur sont privées.**
- **Chaque utilisateur ne voit que ses propres items.**
- **Aucune vue métier ne doit être accessible sans authentification.**
- **Les endpoints anonymes doivent être limités au strict minimum** : login, refresh JWT, healthcheck, CSRF si requis.
- **Les querysets backend doivent toujours être filtrés par `request.user`.**
- **Les permissions objet doivent empêcher tout accès à un item appartenant à un autre utilisateur.**
- **Le frontend doit rediriger vers la page de login si l’utilisateur n’est pas authentifié ou si son token est invalide.**
---

## 9) Métier — modèle central de l’application

### 9.1 Entité principale

L’entité principale est : **`Item`**

Un `Item` représente un élément de suivi personnel :

* tâche,
* achat,
* suivi,
* appel,
* question,
* idée,
* document à obtenir ou faire signer.

### 9.2 Champs métier minimaux

Le modèle `Item` doit prévoir au minimum :

* `title`
* `details`
* `kind`
* `status`
* `priority`
* `context`
* `contact_name`
* `due_date`
* `review_at`
* `completed_at`
* `created_at`
* `updated_at`
* `user`

### 9.3 Types (`kind`)

Valeurs minimales recommandées :

* `task`
* `buy`
* `followup`
* `call`
* `question`
* `idea`
* `document`

### 9.4 Statuts (`status`)

Valeurs minimales recommandées :

* `inbox`
* `next`
* `waiting`
* `scheduled`
* `done`
* `archived`

### 9.5 Priorité (`priority`)

Valeurs minimales recommandées :

* `low`
* `normal`
* `high`

### 9.6 Distinction importante

`due_date` et `review_at` ne doivent pas être confondus.

* `due_date` = échéance réelle
* `review_at` = moment où l’item doit revenir dans l’attention

Pour Pense-bête, `review_at` est un champ central.

### 9.7 Historique

Prévoir si possible une entité `ItemEvent` ou équivalent pour tracer :

* création,
* modification,
* changement de statut,
* report de revue,
* marquage terminé.

---

## 10) API métier

### 10.1 Endpoints minimaux

Routes CRUD minimales :

* `GET /api/items/`
* `POST /api/items/`
* `GET /api/items/{id}/`
* `PATCH /api/items/{id}/`
* `DELETE /api/items/{id}/`

### 10.2 Endpoints utiles

Routes recommandées :

* `GET /api/items/inbox/`
* `GET /api/items/today/`
* `GET /api/items/waiting/`
* `GET /api/items/buy/`
* `GET /api/items/review/`
* `GET /api/items/overdue/`

### 10.3 Actions rapides

Actions métier recommandées :

* `POST /api/items/{id}/mark_done/`
* `POST /api/items/{id}/move_to_inbox/`
* `POST /api/items/{id}/set_waiting/`
* `POST /api/items/{id}/reschedule_review/`

### 10.4 Recherche / filtres

`GET /api/items/` doit pouvoir filtrer au minimum par :

* `status`
* `kind`
* `priority`
* `q`
* items à revoir

---

## 11) Frontend React / Vite

### 11.1 Stack frontend

* React
* Vite
* proxy local `/api` vers `http://backend:8000`
* `VITE_API_BASE=/api`

### 11.2 Règles frontend

* ne pas coder en dur une base API absolue locale
* toujours passer par `VITE_API_BASE`
* pas d’appel direct au backend hors proxy dans le frontend DEV normal
* structure de code claire et maintenable

### 11.3 Structure recommandée

```text
frontend/src/
├── api.js
├── App.jsx
├── main.jsx
├── styles.css
├── components/
│   ├── QuickCapture.jsx
│   ├── ItemForm.jsx
│   ├── ItemList.jsx
│   ├── ItemCard.jsx
│   ├── ItemFilters.jsx
│   ├── StatusBadge.jsx
│   └── ToastProvider.jsx
└── pages/
    ├── LoginPage.jsx
    ├── InboxPage.jsx
    ├── TodayPage.jsx
    ├── WaitingPage.jsx
    ├── BuyPage.jsx
    ├── AllItemsPage.jsx
    └── ItemDetailPage.jsx
```

### 11.4 Token frontend

Le token JWT doit être stocké sous une clé cohérente avec le projet, par exemple :

* `pb.jwt`

Éviter toute référence résiduelle à `mdp.jwt`.

### 11.5 Intercepteur

Un intercepteur 401 peut rediriger vers la page de login si le token est invalide ou expiré.

---

## 12) Vues fonctionnelles minimales

L’application doit proposer au minimum :

* **Login**
* **Inbox**
* **Aujourd’hui**
* **En attente**
* **Achats**
* **Tous**
* **Détail item**

### 12.1 Vue Login

L’application doit exiger une authentification avant d’accéder aux vues métier.
La page de login doit rester cohérente visuellement avec celles des autres applications du projet.

### 12.2 Vue Inbox

Affiche les items non encore triés ou non encore traités, statut `inbox`.

### 12.3 Vue Aujourd’hui

Affiche les items :

* à revoir aujourd’hui,
* ou échus,
* ou prioritaires selon la logique métier définie.

### 12.4 Vue En attente

Affiche les items dépendant d’une autre personne ou d’une réponse externe.

### 12.5 Vue Achats

Affiche les items de type `buy` non terminés.

---

## 13) Invariants UX

### 13.1 Principe fondamental

La **capture rapide** est la fonctionnalité centrale.

Créer un item simple doit être plus rapide qu’ouvrir un formulaire classique.

### 13.2 Règles

* l’utilisateur doit pouvoir noter une idée rapidement,
* la création simple ne doit pas imposer une date,
* les champs obligatoires doivent être réduits au strict minimum,
* le tri peut se faire après la création,
* les actions fréquentes doivent être accessibles rapidement,
* la navigation doit refléter le métier réel, pas une logique technique.

### 13.3 Conséquences

En pratique :

* un champ d’entrée rapide visible dès l’ouverture,
* création via Enter possible si pertinent,
* édition légère après capture,
* accès rapide aux statuts fréquents (`inbox`, `waiting`, `done`).

---

## 14) Invariants UI / visuels

### 14.1 Objectif général

L’application doit appartenir visuellement au même écosystème que les autres applications existantes.

Le but n’est pas de créer une interface de démonstration générique, mais une interface sobre, cohérente, lisible et homogène.

### 14.2 Source de vérité visuelle

Le frontend des applications existantes constitue la référence visuelle prioritaire, en particulier :

* la structure globale,
* la logique des formulaires,
* les cartes,
* les listes,
* les boutons,
* les messages toast,
* les pages de login,
* la feuille de style globale.

Toute divergence visuelle importante doit être justifiée.

### 14.3 Principes visuels obligatoires

* interface sobre,
* lisibilité avant décor,
* hiérarchie visuelle claire,
* espacement cohérent,
* contrastes suffisants,
* pas d’animations décoratives inutiles,
* pas de style “dashboard marketing”,
* pas de mélange de styles contradictoires.

### 14.4 Mise en page

* structure stable d’écran,
* en-tête clair,
* navigation simple,
* contenu principal lisible,
* écrans non surchargés,
* une action principale visible par vue.

### 14.5 Composants à harmoniser

Doivent être cohérents d’une page à l’autre :

* boutons primaires / secondaires / danger,
* champs texte,
* textarea,
* select,
* badges,
* cartes,
* filtres,
* messages d’erreur,
* messages de succès,
* loaders,
* modales éventuelles.

### 14.6 Règles CSS

* privilégier une feuille de style globale,
* limiter les styles inline,
* éviter la duplication de CSS,
* préférer des composants réutilisables,
* garder des noms de classes cohérents et maintenables.

### 14.7 Invariants visuels métier

L’interface doit rendre rapidement visibles :

* le statut,
* la priorité,
* le type,
* la date de revue,
* la date d’échéance.

Les badges et codes couleur doivent rester sobres et cohérents.

### 14.8 Responsive

* l’application doit être utilisable sur laptop et desktop,
* les vues principales doivent rester lisibles,
* éviter les tableaux rigides si des cartes/listes sont plus robustes,
* les actions importantes ne doivent pas dépendre exclusivement du hover.

### 14.9 Do / Don’t

**Do**

* réutiliser les patterns visuels existants,
* harmoniser login, formulaires, listes et navigation,
* privilégier simplicité, clarté, homogénéité,
* factoriser les composants.

**Don’t**

* pas de refonte graphique isolée,
* pas de nouvelle bibliothèque UI sans nécessité claire,
* pas de composant “demo style” déconnecté du reste,
* pas de mélange de plusieurs systèmes visuels concurrents.

---

## 15) Auth, API et proxy — fragments normatifs

### 15.1 Fragment `frontend/vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: false,
      },
    },
  },
})
```

### 15.2 Fragment `backend/api/urls.py`

```py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import ItemViewSet, healthz
from .views_auth import csrf, login_view, logout_view
from .views_jwt_whoami import jwt_whoami

app_name = "api"

router = DefaultRouter()
router.register(r"items", ItemViewSet, basename="item")

urlpatterns = [
    path("", include(router.urls)),
    path("healthz/", healthz, name="api-healthz"),
    path("csrf/", csrf, name="api-csrf"),
    path("login/", login_view, name="api-login"),
    path("logout/", logout_view, name="api-logout"),
    path("whoami/", jwt_whoami, name="api-whoami"),
    path("auth/jwt/create/", TokenObtainPairView.as_view(), name="jwt-create"),
    path("auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),
    path("auth/jwt/verify/", TokenVerifyView.as_view(), name="jwt-verify"),
    path("auth/whoami/", jwt_whoami, name="jwt-whoami"),
]
```

---

## 16) Makefile — cibles standard attendues

Cibles minimales recommandées :

* `help`
* `envlink`
* `ensure-env`
* `up`
* `down`
* `restart`
* `ps`
* `logs`
* `logs-backend`
* `logs-frontend`
* `logs-db`
* `makemigrations`
* `migrate`
* `createsuperuser`
* `psql`
* `prod-deploy`
* `prod-health`
* `prod-logs`

Utilitaires utiles :

* `dps`
* `dps-all`

---

## 17) Vérification des invariants

Un script de vérification est recommandé :

* `scripts/verifier-invariants.sh`

Ce script doit vérifier au minimum :

* conformité des noms de services,
* présence du proxy Vite `/api`,
* usage des variables d’environnement attendues,
* absence de secrets dans les fichiers versionnés,
* conformité des ports dérivés,
* cohérence des routes API,
* cohérence des fichiers `.env`,
* présence des fragments structurants frontend/backend.

---

## 18) Checklist avant merge

* [ ] `scripts/verifier-invariants.sh` OK
* [ ] `frontend/vite.config.js` conforme
* [ ] `frontend/src/api.js` conforme
* [ ] backend DEV sur `0.0.0.0:8000`
* [ ] routes backend sous `/api/`
* [ ] JWT configuré
* [ ] proxy Vite `/api` fonctionnel
* [ ] secrets présents uniquement dans `*.local`
* [ ] chemins DEV/PROD conformes
* [ ] visuel cohérent avec les autres apps
* [ ] capture rapide présente et utilisable
* [ ] authentification requise sur les vues métier
* [ ] aucun résidu MDP (`mdp.jwt`, `passwords`, `categories`, etc.)

---

## 19) Emplacement du document

Chemin recommandé :

* `docs/INVARIANTS.md`

Ce document doit être référencé depuis :

* `README.md`
* `docs/CODEX_START.md`

---

## 20) Consignes permanentes pour Codex

À chaque intervention sur le projet :

1. relire ce document intégralement ;
2. proposer une alternative compatible si une idée casse un invariant ;
3. produire des snippets prêts à copier ;
4. ne jamais casser les conventions cross-apps ;
5. respecter à la fois l’infrastructure **et** la cohérence visuelle ;
6. ne pas improviser une UI déconnectée des autres apps ;
7. ne pas exposer de secrets ;
8. ne pas introduire une nouvelle stack.

---

## 21) Extension cross-apps

Ce document est conçu comme une déclinaison du template commun de tes applications :

* mêmes noms de services,
* mêmes conventions `/api/`,
* mêmes pratiques Docker/Compose,
* mêmes règles `.env`,
* mêmes invariants de sécurité,
* même exigence de cohérence frontend.

Seuls changent :

* l’identité applicative (`APP_*`),
* le métier,
* les vues fonctionnelles,
* certains détails d’UX.
