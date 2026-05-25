# Thème commun des applications auto-hébergées

`gestionnaireMDP` est le modèle visuel de référence pour les applications auto-hébergées.

Pour Pense-bête, le contrat est appliqué dans `frontend/src/theme.css`.
Les styles locaux de l'application doivent consommer ces variables au lieu de redéfinir une palette complète dans `styles.css`.

## Règles

- utiliser les logos communs `mon-site-logo.png` et `mon-site-symbol.png` ;
- utiliser le fond commun `meteo-bg.jpg` ;
- gérer le choix clair/sombre via `data-theme="light|dark"` sur `document.documentElement` ;
- persister le choix dans `localStorage` avec la clé `mon-site.theme` ;
- reprendre les tokens de `gestionnaireMDP` pour couleurs, surfaces, boutons, bordures, ombres et rayons ;
- limiter les styles propres à l'application au layout, aux composants métier et aux états spécifiques.

## Migration des autres applications

Les autres applications doivent pouvoir reprendre le même principe :

1. ajouter un fichier `theme.css` équivalent au thème commun ;
2. l'importer avant les styles locaux ;
3. remplacer les palettes locales par les variables du thème commun ;
4. migrer les anciennes clés de thème vers `mon-site.theme` si nécessaire.
