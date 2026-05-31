# Coffre privé — Pense-bête

## Rôle

Ce document cadre le mécanisme de coffre privé pour les informations sensibles utilisées par `Pense-bête`.

La première version est volontairement limitée à `Pense-bête`. Elle sert de pilote avant toute généralisation vers `Contact`, `Calendrier` ou le template applicatif.

## Objectif

Le coffre privé doit permettre d'associer des informations personnelles sensibles à un item sans que le serveur puisse les lire en clair.

Exemples de données sensibles :

* téléphone personnel ;
* courriel personnel ;
* adresse ;
* notes privées ;
* détails familiaux, médicaux, administratifs ou confidentiels.

Les champs métier nécessaires à `Pense-bête` restent utilisables normalement par le backend :

* titre ou libellé neutre ;
* statut ;
* priorité ;
* type ;
* contexte ;
* `due_date` ;
* `review_at`.

## Modèle de sécurité

L'authentification et le déverrouillage sont deux mécanismes distincts.

* l'authentification JWT prouve l'identité de l'utilisateur ;
* la phrase de passe du coffre permet de déchiffrer les données privées côté client.

Règles obligatoires :

* la phrase de passe n'est jamais envoyée au backend ;
* aucune clé de coffre en clair n'est stockée côté serveur ;
* le chiffrement et le déchiffrement des champs sensibles se font dans le frontend ;
* chaque utilisateur possède son propre coffre ;
* une donnée privée chiffrée pour un utilisateur ne doit pas être lisible par un autre utilisateur ;
* la perte de la phrase de passe rend les anciennes données privées non récupérables.

L'administrateur Django peut créer les comptes, gérer les accès et réinitialiser un coffre, mais ne doit pas pouvoir lire le contenu privé chiffré.

## Expérience utilisateur

Après connexion, l'application reste utilisable normalement.

Tant que le coffre est verrouillé :

* les items restent visibles ;
* les champs privés restent masqués ;
* les contacts privés peuvent afficher un libellé neutre, par exemple `Contact privé` ;
* aucune information sensible ne doit être exposée dans les listes, détails ou intégrations.

Quand l'utilisateur déverrouille le coffre :

* il saisit sa phrase de passe ;
* le frontend dérive la clé localement ;
* la clé reste uniquement en mémoire ;
* les champs privés peuvent être lus ou modifiés ;
* le coffre peut être reverrouillé manuellement ou automatiquement.

Une v1 raisonnable doit prévoir un verrouillage automatique après une courte durée d'inactivité ou à la déconnexion.

## Intégration avec Contact

`Pense-bête` peut associer un `Item` à un contact fourni par l'application `Contact`.

Dans cette relation :

* `Pense-bête` conserve la logique métier de l'item ;
* `Contact` reste la source de vérité des données de contact ;
* les champs sensibles du contact doivent être stockés sous forme de payload chiffré ;
* `Pense-bête` ne doit pas transformer le contact privé en champs lisibles côté serveur.

Le nom libre `contact_name` peut rester un libellé neutre ou non sensible. Il ne doit pas contenir d'information privée si l'utilisateur choisit de garder le contact confidentiel.

## Contrat Dashboard et inter-apps

Le token `PENSE_BETE_API_TOKEN` et l'en-tête `X-Internal-Api-Token` servent uniquement à authentifier les appels techniques backend-backend.

Ils ne donnent jamais accès au déchiffrement du coffre privé.

Les endpoints Dashboard doivent continuer à retourner des données déjà filtrées par `Pense-bête` et ne doivent pas exposer de payload privé en clair. Le Dashboard ne doit pas recalculer la logique `today` ou `buy`, et ne doit pas recevoir de phrase de passe ni de clé de coffre.

## Mobile

Le mécanisme v1 doit fonctionner sur mobile sans dépendre d'une clé USB.

Le chemin principal est :

1. connexion utilisateur ;
2. affichage des items ;
3. saisie de la phrase de passe si l'utilisateur veut lire ou modifier des champs privés ;
4. clé gardée en mémoire côté navigateur ;
5. reverrouillage automatique ou manuel.

Une clé USB, une clé matérielle ou un appareil approuvé peuvent être étudiés plus tard, mais ne font pas partie de la v1 documentaire.

## Généralisation future

Si l'expérience est validée dans `Pense-bête`, le mécanisme pourra devenir une convention transversale pour les applications auto-hébergées.

La cible future serait :

* une même expérience de déverrouillage ;
* une phrase de passe utilisateur commune d'usage ;
* des clés séparées par application ou domaine fonctionnel ;
* un module frontend partagé pour chiffrer, déchiffrer, verrouiller et déverrouiller.

Cette généralisation ne doit pas être intégrée au template avant validation réelle dans `Pense-bête`.
