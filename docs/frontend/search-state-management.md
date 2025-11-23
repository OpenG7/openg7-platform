# Gestion d'état pour la recherche rapide

## Pourquoi nous n'utilisons pas NgRx dans `QuickSearchModalComponent`

`QuickSearchModalComponent` s'appuie sur les signaux Angular pour gérer les états éphémères de la modale : requête saisie, chargement, erreurs, sections de résultats, index actif, etc. Toutes ces informations sont propres à l'instance de modale ouverte et ne doivent pas être partagées globalement.

Le service `SearchService` se charge déjà d'orchestrer l'appel HTTP, tandis que `SearchHistoryStore` conserve un historique persistant pour l'utilisateur. Ces deux éléments constituent la limite naturelle entre état global et local :

- L'historique et les préférences partagées utilisent `SearchHistoryStore`.
- Les états transitoires (saisie en cours, résultats courants, focus clavier) vivent directement dans le composant via des signaux.

Introduire NgRx ici impliquerait :

1. De créer un **feature store** dédié uniquement à la modale.
2. De propager dans le store des évènements de cycle de vie (ouverture, fermeture, focus) difficiles à raisonner hors du composant.
3. D'ajouter une surcouche d'actions/réducteurs séquentiels qui n'apporte pas de bénéfice de partage ni de sérialisation.

Le résultat serait un code plus complexe à maintenir, sans gain fonctionnel. Les signaux et les `effect()` existants fournissent déjà une synchronisation réactive fine (par exemple entre le `FormControl`, l'analytics et le déclenchement de la recherche) tout en restant faciles à tester.

## Quand envisager NgRx ?

NgRx reste pertinent pour :

- Des états métiers partagés entre plusieurs pages ou composants distants.
- La mise en cache de réponses d'API utilisées dans différentes zones.
- La coordination d'effets secondaires multiples dépendant d'actions globales (authentification, feature flags, etc.).

Si, à l'avenir, les résultats de recherche doivent être affichés dans d'autres composants en dehors de la modale, on pourra extraire une partie de la logique dans un store ou un service partageable. Pour l'instant, conserver l'approche à base de signaux garantit une modale autonome, performante et simple.
