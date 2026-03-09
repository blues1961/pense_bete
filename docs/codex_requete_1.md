Lis d’abord intégralement :
- docs/INVARIANTS.md
- docs/MVP.md
- docs/CODEX_START.md
- README.md

Travail demandé pour cette première étape :

1. mettre en place le socle backend Django dans `backend/`
2. créer l’app `api`
3. configurer PostgreSQL via variables d’environnement
4. configurer Django REST Framework
5. configurer SimpleJWT
6. exposer les routes backend sous `/api/`
7. mettre en place le socle frontend React/Vite dans `frontend/`
8. configurer `VITE_API_BASE=/api`
9. configurer le proxy Vite `/api` vers `http://backend:8000`
10. créer une base de login protégée côté frontend
11. harmoniser la structure et le style de base avec `~/projets/gestionnaireMDP` puis `~/projets/calendrier`

Contraintes :
- ne pas casser les invariants
- ne pas changer les noms de services
- ne pas utiliser SQLite
- ne pas exposer de secrets
- ne pas coder encore toute la logique métier avancée
- rester dans un premier lot “socle technique + auth”

Avant d’écrire du code :
- résume les invariants compris
- liste les fichiers que tu vas créer ou modifier
- indique comment tu comptes reprendre les patterns visuels des projets de référence