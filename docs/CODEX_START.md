# CODEX_START — Pense-bête

## 0) Rôle attendu de Codex

Tu interviens comme **agent de génération et de modification de code** dans le projet **Pense-bête**.

Ton rôle n’est pas de redéfinir l’architecture ni d’improviser une nouvelle stack.
Tu dois **lire, comprendre et appliquer** les invariants déjà définis dans le dépôt.

Tu dois produire un code :

* cohérent avec les invariants du projet,
* cohérent avec les autres applications existantes,
* maintenable,
* lisible,
* prêt à être relu et testé.

---

## 1) Documents à lire avant toute modification

Avant d’écrire ou modifier du code, lis intégralement, dans cet ordre :

1. `docs/INVARIANTS.md`
2. `docs/MVP.md`
3. `README.md`
4. ce fichier `docs/CODEX_START.md`

Si un point n’est pas clair, privilégie les invariants et la cohérence avec les autres projets existants.

---

## 2) Références visuelles et structurelles externes

Pour le style visuel, la structure frontend et les patterns UI, les projets de référence sont :

* `~/projets/gestionnaireMDP`
* `~/projets/calendrier`

Tu dois t’en servir pour comprendre :

* la structure des pages,
* les conventions CSS,
* le style des formulaires,
* le style des boutons,
* la logique de navigation,
* la présentation des listes,
* le style du login,
* l’organisation générale du frontend.

### Règle importante

Le but n’est **pas** de copier mécaniquement du code d’un autre projet.
Le but est de **reprendre le même langage visuel et les mêmes patterns d’interface** afin que Pense-bête semble appartenir au même écosystème applicatif.

En cas de divergence entre plusieurs références visuelles :

* privilégier d’abord la cohérence avec `gestionnaireMDP`,
* puis utiliser `calendrier` comme second point de référence.

---

## 3) Rappel d’identité du projet

* **Nom** : `Pense-bête`
* **Dépôt** : `pense_bete`
* **Slug** : `pb`
* **But** : capture rapide + suivi léger + revue d’éléments personnels

Pense-bête est une application personnelle, privée et authentifiée.
Elle n’est pas destinée à un accès public anonyme.
Toutes les données utilisateur sont privées, et chaque utilisateur ne doit pouvoir accéder qu’à ses propres items.

---

## 4) Stack imposée

Le projet utilise exclusivement :

* PostgreSQL
* Django
* Django REST Framework
* SimpleJWT
* React
* Vite
* Docker Compose

Tu ne dois pas :

* remplacer PostgreSQL par SQLite,
* remplacer Django par une autre solution backend,
* remplacer React/Vite par une autre stack,
* introduire une bibliothèque UI lourde sans justification claire,
* inventer une architecture parallèle.

---

## 5) Invariants techniques à ne jamais casser

### 5.1 Services Compose

Les noms de services canoniques sont :

* `db`
* `backend`
* `vite`
* `frontend`

Ne pas les renommer.

### 5.2 API

* Toutes les routes backend sont sous `/api/`
* Le frontend doit utiliser `VITE_API_BASE=/api`
* En DEV, le proxy Vite `/api` doit pointer vers `http://backend:8000`

### 5.3 Authentification

L’application doit être protégée par authentification, comme les autres applications du projet.

Règles :

* auth JWT obligatoire,
* aucune vue métier ne doit être accessible anonymement,
* seuls les endpoints minimaux d’auth, health et CSRF peuvent être publics si nécessaire,
* le frontend doit rediriger vers le login si l’utilisateur n’est pas authentifié.

### 5.4 Données privées

* Chaque utilisateur ne voit que ses propres items
* Tous les querysets doivent être filtrés par `request.user`
* Les permissions objet doivent empêcher l’accès aux items d’un autre utilisateur

### 5.5 Variables d’environnement

Respecter les variables déjà définies dans les fichiers `.env*`.
Ne pas renommer les variables structurantes sans nécessité explicite.
Ne jamais introduire de secrets en dur dans le code.

---

## 6) Domaine métier à respecter

L’entité centrale du projet est **`Item`**.

Un item peut représenter par exemple :

* une tâche,
* un achat,
* un suivi,
* un appel,
* une question,
* une idée,
* un document à obtenir ou faire signer.

### Champs métier attendus

À minima :

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

### Distinction importante

Ne pas confondre :

* `due_date` = vraie échéance
* `review_at` = date de réapparition dans l’attention

Le champ `review_at` est central dans la logique de Pense-bête.

---

## 7) Périmètre MVP à viser

Le MVP doit couvrir au minimum :

* login utilisateur
* création rapide d’un item
* édition d’un item
* liste Inbox
* liste Aujourd’hui
* liste En attente
* liste Achats
* liste Tous
* filtres simples
* marquer terminé
* reporter `review_at`

Ne pas dériver vers un périmètre plus large sans raison claire.

### Hors MVP

Ne pas prioriser au départ :

* notifications push,
* intégration calendrier,
* pièces jointes,
* parsing avancé du langage naturel,
* collaboration complexe.

---

## 8) Invariants UX à respecter

### 8.1 Fonction centrale

La capture rapide est la fonction principale de l’application.

Créer un item simple doit être :

* rapide,
* direct,
* possible sans formulaire long,
* possible sans date obligatoire,
* plus rapide qu’un flux de saisie traditionnel.

### 8.2 Principes d’ergonomie

* les champs obligatoires doivent être réduits au minimum,
* l’utilisateur doit pouvoir trier plus tard,
* les statuts fréquents doivent être faciles à modifier,
* la navigation doit refléter l’usage réel : Inbox, Aujourd’hui, En attente, Achats, Tous.

---

## 9) Invariants visuels à respecter

### 9.1 Principe général

Pense-bête doit avoir un visuel cohérent avec les autres applications du projet.

Il faut éviter :

* l’effet maquette générique,
* le style dashboard marketing,
* les animations inutiles,
* la multiplication de patterns visuels incompatibles.

### 9.2 Ce qu’il faut rechercher

* sobriété,
* lisibilité,
* hiérarchie visuelle claire,
* cohérence des espacements,
* cohérence des boutons,
* cohérence des cartes,
* cohérence des formulaires,
* cohérence des pages de login,
* cohérence des messages toast / erreurs / succès.

### 9.3 Source visuelle prioritaire

Avant d’écrire une nouvelle page ou un nouveau composant, examiner dans les projets de référence :

* la feuille de style globale,
* les composants d’auth,
* les listes,
* les formulaires,
* la navigation,
* les composants réutilisables.

### 9.4 Règles CSS

* privilégier une feuille de style globale,
* limiter les styles inline,
* éviter la duplication CSS,
* réutiliser les patterns déjà présents dans les autres projets,
* conserver des noms de classes clairs et maintenables.

---

## 10) Ce que tu dois faire avant toute écriture de code

Avant de modifier le projet, tu dois :

1. relire les invariants,
2. résumer les contraintes que tu as comprises,
3. lister les fichiers que tu prévois créer ou modifier,
4. justifier brièvement si tu t’écartes d’un pattern existant,
5. vérifier si un composant ou une logique similaire existe déjà dans les projets de référence.

---

## 11) Ordre de travail recommandé

Tu dois travailler par étapes courtes et vérifiables.

### Étape 1 — socle technique

Mettre en place ou compléter :

* structure backend Django,
* structure frontend React/Vite,
* configuration DRF,
* configuration SimpleJWT,
* configuration Postgres,
* proxy Vite `/api`,
* base du système de login.

### Étape 2 — modèle métier

Créer :

* modèle `Item`,
* serializer(s),
* viewset / vues API,
* permissions utilisateur,
* routes `/api/items/...`.

### Étape 3 — UI minimale

Créer une UI fonctionnelle avec :

* login,
* Quick Capture,
* Inbox,
* Today,
* Waiting,
* Buy,
* All Items,
* détail / édition d’un item.

### Étape 4 — harmonisation visuelle

Ajuster :

* styles,
* composants,
* structure de page,
* navigation,
* états visuels,

en se basant sur `gestionnaireMDP` puis `calendrier`.

### Étape 5 — qualité

Ajouter ou compléter :

* tests backend,
* tests frontend utiles,
* documentation technique,
* nettoyage du code,
* factorisation de composants.

---

## 12) Comportement attendu quand tu modifies du code

Quand tu proposes une modification :

* ne change que ce qui est nécessaire,
* évite les refontes larges non demandées,
* garde la structure du dépôt stable,
* garde les noms de fichiers cohérents,
* évite les dépendances supplémentaires inutiles,
* écris un code simple à relire.

Si une amélioration hors périmètre semble utile, tu peux la signaler, mais sans l’imposer au flux principal.

---

## 13) Signaux d’erreur à éviter absolument

Ne pas laisser dans le projet :

* des références résiduelles à `mdp.jwt`,
* des routes ou noms métier du gestionnaire de mots de passe,
* des composants ou textes copiés-collés parlant de mots de passe,
* des conventions de calendrier qui ne correspondent pas au métier de Pense-bête,
* des secrets codés en dur,
* des accès anonymes aux vues métier.

---

## 14) Livrables attendus de Codex

Quand tu proposes une étape de travail, on attend de toi :

* un résumé de ce que tu changes,
* la liste des fichiers modifiés,
* un code cohérent avec les invariants,
* des snippets ou patchs clairs,
* des instructions de validation si nécessaire.

---

## 15) Priorité de décision en cas de doute

Si plusieurs options existent, l’ordre de priorité est :

1. respecter `docs/INVARIANTS.md`
2. respecter le périmètre `docs/MVP.md`
3. rester cohérent avec `gestionnaireMDP`
4. rester cohérent avec `calendrier`
5. choisir la solution la plus simple et maintenable

---

## 16) Résumé opérationnel

En une phrase :

> Construis Pense-bête comme une application privée, authentifiée, sobre et cohérente avec mes autres apps, en respectant strictement les invariants techniques, métier et visuels déjà définis.
