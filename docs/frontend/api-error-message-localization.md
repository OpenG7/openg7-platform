# Clarifier la gestion des messages d'erreur API non localisés

## Résumé

Certaines API renvoient déjà des messages utilisateur prêts à être affichés. Le front applique pourtant systématiquement le pipe `translate` sur la valeur renvoyée par `resolveErrorMessage`, ce qui provoque un aller-retour inutile vers les fichiers de traductions et peut réafficher une clé brute quand l'API fournit un identifiant i18n.

## Problème actuel

- `resolveErrorMessage` renvoie indistinctement une clé de traduction ou un message texte directement fourni par l'API.
- Dans les templates Angular, la valeur est systématiquement passée au pipe `translate`.
- Les messages API non localisés effectuent donc une recherche inutile dans les catalogues i18n. Si la chaîne est déjà une clé i18n, le front réaffiche la clé brute faute de correspondance.

## Proposition

- Introduire un utilitaire capable d'identifier si la chaîne renvoyée est une clé i18n ou un message brut, par exemple au moyen d'un préfixe réservé (`i18n:`) ou d'une convention similaire côté backend.
- Adapter `resolveErrorMessage` pour encapsuler cette logique et exposer une structure explicite (ex. `{ type: 'i18n' | 'plain', value: string }`).
- Mettre à jour les templates pour n'appliquer `translate` que sur les messages marqués `i18n`, et afficher directement les messages bruts sinon.

## Bénéfices

- Réduction des requêtes de traduction inutiles.
- Affichage correct des messages fournis par l'API sans artefact i18n.
- Maintien de la traduction pour les codes d'erreur gérés par le front.
