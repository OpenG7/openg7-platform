# Plan de travail — Feu vert du Réacteur Qualité

Date : 6 septembre 2026. Statut : à réaliser. Périmètre : fiabilité du réacteur, qualité de ses données et validation de son fonctionnement sur `/admin/quality`.

Le feu vert signifie que le réacteur peut servir au pilotage : ses chiffres sont exacts, ses diagnostics sont justifiés et ses preuves sont traçables. Un état « critique » correctement justifié est compatible avec ce feu vert. Les lacunes produit signalées restent à traiter selon leur priorité.

**Point de départ vérifié**

- La matrice locale contient 15 domaines ; les catégories du réacteur en comptent 16 à cause du double classement de `linkup-workflow`.
- La couverture calculée vaut 56 %, au lieu de 60 % avec les 9 domaines actuellement classés `covered`. Ce nombre de domaines couverts doit lui-même être revu.
- Le validateur relève trois contradictions : `feed-signals`, `alerts-notifications` et `rbac` sont classés `covered` avec un `summaryStatus` différent de `oui`.
- La tendance dépend uniquement de l'état courant ; les classements absents sont transformés en `proof-gap` ; les modifications du package échappent aux résolveurs d'impact CI et Strapi.
- Vérifications déjà exécutées : 4 tests du composant et 31 tests du modèle/validateur réussis. La validation de la matrice échoue sur les trois contradictions. Aucune revue visuelle ni validation de l'environnement déployé n'a été réalisée.

**Ordre de travail et responsabilités proposées**

| Lot | Travail                                        | Responsable fonctionnel                  | Dépendance      | Condition de sortie                               |
| --- | ---------------------------------------------- | ---------------------------------------- | --------------- | ------------------------------------------------- |
| 1   | Unifier la classification et les calculs       | Développement front et API               | Aucune          | Une catégorie par domaine ; état inconnu conservé |
| 2   | Réconcilier les données dans Strapi            | Responsable qualité et développement API | Règles du lot 1 | Zéro contradiction après export                   |
| 3   | Corriger les diagnostics et la fraîcheur       | Développement front et API               | Lot 1           | Chaque message est justifié par les données       |
| 4   | Réparer la détection d'impact                  | Développement tooling et API             | Aucune          | Résultats identiques dans la CI et Strapi         |
| 5   | Rendre les contrôles obligatoires en CI        | Développement CI                         | Lots 1 à 4      | Une régression provoque un échec explicite        |
| 6   | Effectuer la recette et constituer les preuves | QA et responsable qualité                | Lots 1 à 5      | Tous les critères de feu vert sont vérifiés       |

Les lots 1 et 4 peuvent avancer en parallèle. La revue des preuves du lot 2 peut commencer immédiatement ; son application attend la définition des règles du lot 1.

**Lot 1 — Classification unique et calculs exacts**

Travail : centraliser la classification des domaines et l'utiliser pour les compteurs, les pourcentages et les ratios d'état. Conserver `needsProductWorkFirst` comme information de travail à effectuer, sans créer une seconde appartenance. Définir un état explicite « non évalué » et le préserver dans les contrats, la normalisation et la persistance. Prévoir la compatibilité avec les données existantes : un ancien `proof-gap` ne devient pas automatiquement une évaluation documentée.

Fichiers principaux : `packages/admin-quality/src/lib/pages/admin-quality.page.ts`, `admin-quality-reactor.component.ts`, service matrice de l'application, contrats et schéma Strapi concernés.

Critères et tests :

- Toute entrée apparaît exactement une fois ; la somme des catégories égale le nombre d'entrées retenues.
- La fixture de l'audit produit 9 couverts, 1 manque de preuve, 4 manques produit et 1 limite de périmètre : total 15 et couverture 60 %, avant réconciliation éditoriale.
- Une catégorie absente ou inconnue augmente « non évalués » et diminue la complétude. Une entrée non évaluée empêche l'état « excellent ».
- Tester les matrices vide, entièrement couverte, entièrement non évaluée, les catégories qui se chevauchaient et les seuils d'état juste avant, à et après 20 %, 25 % et 50 %.
- Tous les pourcentages restent compris entre 0 et 100. Les règles d'arrondi sont identiques entre le composant et la page.

**Lot 2 — Réconciliation des données à la source**

Travail : examiner les preuves et les critères d'acceptation de `feed-signals`, `alerts-notifications` et `rbac`, puis corriger leurs statuts dans Strapi. Mettre à jour `reviewedAt` uniquement après une revue effective. Exporter ensuite la matrice et régénérer la carte d'impact par le mécanisme officiel.

La [gouvernance](./admin-quality-governance.md) désigne Strapi comme source de vérité éditoriale. Le snapshot JSON est un artefact exporté. Aligner les anciens passages de cette documentation qui recommandent encore une édition manuelle du snapshot.

Critères et tests :

- Chaque changement de statut possède une justification et une référence de preuve, ou décrit la lacune restante.
- `yarn validate:admin-quality-matrix` termine avec zéro erreur, sans `--warn`.
- Les statuts et catégories sont cohérents entre Strapi, le snapshot exporté et le réacteur.
- Les mutations API rejettent les contradictions établies par les règles de classification ; couvrir ces rejets avec les tests d'intégration existants.
- Le nombre final de domaines et la couverture résultent des données revues. Les valeurs 15 et 60 % restent des attentes de fixture, pas des objectifs imposés à la base réelle.

**Lot 3 — Diagnostics justifiés et fraîcheur explicite**

Travail : supprimer le lien automatique « critique → en dégradation » et « excellent → en amélioration ». Pour ce premier feu vert, afficher « tendance indisponible » lorsqu'aucun historique comparable n'existe. Une vraie tendance calculée entre évaluations peut être livrée ultérieurement.

Réutiliser les signaux disponibles par domaine (`reviewedAt`, `repoSignalAt`, preuves et recalculs) pour indiquer ce qui reste à revoir. Distinguer la date de synchronisation des données de la date de vérification des preuves. Une simple modification éditoriale ne doit pas rendre les preuves récentes. Définir et documenter la règle d'expiration applicable aux preuves.

Critères et tests :

- Sans historique comparable, aucune amélioration ou dégradation n'est affirmée.
- Une entrée couverte dont la revue précède un changement produit est signalée « à revalider » ; le diagnostic global ne promet pas une couverture entièrement vérifiée.
- Une édition de description ne modifie pas la fraîcheur des preuves des autres domaines.
- Chargement, recalcul, erreur API et données périmées ont des messages distincts. Un échec de rafraîchissement rend explicite que les derniers chiffres connus sont conservés.
- Toutes les nouvelles formulations existent en français et en anglais.

**Lot 4 — Détection d'impact cohérente entre CI et serveur**

Travail : ajouter `packages/admin-quality/` aux règles appropriées depuis `tools/admin-quality-matrix-global-rules.json`, puis exporter/régénérer les artefacts. Corriger le repli des deux résolveurs : `scripts/resolve-admin-quality-matrix-impact.mjs` et `strapi/src/api/admin-quality-matrix/controllers/admin-quality-matrix.ts`. Vérifier aussi les dépendances partagées qui alimentent réellement le réacteur.

Le serveur charge actuellement sa carte d'impact au démarrage. Vérifier que la nouvelle carte est chargée après régénération et redémarrage ou déploiement.

Critères et tests :

- Une modification de `admin-quality-reactor.component.ts` ou de la page du package déclenche une revalidation.
- Pour les mêmes fichiers et la même matrice, CI et API retournent les mêmes domaines et la même portée.
- Couvrir un fichier produit mappé, un fichier produit non mappé, un fichier du package et un changement hors produit.
- `yarn validate:admin-quality-impact-map` réussit ; l'ingestion API enregistre le signal attendu et produit le recalcul prévu.

**Lot 5 — Contrôles obligatoires et preuves CI exactes**

Travail : intégrer la validation stricte de la matrice au workflow principal, puis remplacer les validations seulement informatives par des échecs lorsque la matrice est incohérente. Ajouter explicitement l'exécution des tests Angular du réacteur, de la page et du service, ainsi que les tests des résolveurs et de l'API.

Fichiers principaux : `.github/workflows/ci-validate.yml`, `pr-admin-quality-review.yml`, `sync-admin-quality-matrix-export.yml` et génération du manifeste de preuves.

Critères et tests :

- Une fixture incohérente, un compteur erroné ou un impact ignoré fait échouer le contrôle associé.
- Les tests Angular sont exécutés explicitement : `yarn prebuild:web` lance la génération et les tests des contrats, et ne suffit pas à prouver l'exécution de ces tests Angular.
- Le manifeste référence uniquement les contrôles et les specs réellement exécutés avec succès ; il contient le commit et les liens du run et des artefacts disponibles.
- Les contrôles exigés par le dépôt avant PR passent. La configuration de protection de branche est vérifiée avant d'affirmer que les contrôles empêchent effectivement une fusion.

**Lot 6 — Recette du réacteur et décision de feu vert**

Travail : compléter les tests existants et effectuer une revue visuelle de `/admin/quality`. Vérifier l'affichage sur mobile et bureau, en français et en anglais, avec navigation clavier et réduction des animations. Contrôler la lisibilité des petites légendes, notamment « non évalués », et mesurer le coût des animations si le rendu manque de fluidité.

Scénarios obligatoires : catégories mixtes, tous couverts, classement manquant, données périmées, recalcul en cours, erreur de rafraîchissement et absence de domaines. Vérifier également que « Voir les écarts prioritaires » ouvre les résultats correspondant aux données et place correctement la navigation dans la section cible.

Sur l'environnement de recette, vérifier le parcours complet : modification produit détectée → ingestion → domaine à revalider → revue et preuve → export → affichage cohérent. Conserver le SHA testé, les rapports de tests, l'export revu et les captures des états principaux.

**Commandes de validation ciblée prévues**

Exécuter sous la version Node du dépôt (`.nvmrc`, 22.x). Pour Karma, utiliser un navigateur installé ; définir `CHROME_BIN` si nécessaire. L'export exige l'accès à la base de recette et un jeton configuré dans l'environnement. Ces commandes sont à exécuter au cours des lots, pas considérées comme déjà validées par ce plan.

```sh
yarn export:admin-quality-matrix
yarn validate:admin-quality-matrix
yarn validate:admin-quality-impact-map
node --test scripts/__tests__/admin-quality-matrix-model.test.mjs scripts/__tests__/validate-admin-quality-matrix.test.mjs scripts/__tests__/resolve-admin-quality-matrix-impact.test.mjs
yarn workspace @openg7/web test --watch=false --browsers=ChromeHeadlessNoSandbox --include=src/app/domains/admin/pages/admin-quality-reactor.component.spec.ts --include=src/app/domains/admin/pages/admin-quality.page.spec.ts --include=src/app/domains/admin/data-access/admin-quality-matrix.service.spec.ts --progress=false
yarn workspace @openg7/strapi test:integration:admin-quality-matrix
yarn build:admin-quality
yarn workspace @openg7/web e2e e2e/admin-quality-recalculate-matrix.spec.ts
```

Étendre le scénario E2E existant ou ajouter une spec dédiée pour couvrir les états du réacteur ; exécuter cette nouvelle couverture à la recette. Compléter ces commandes par les contrôles avant PR d'`AGENTS.md` et les validations de préproduction lorsque la livraison cible cet environnement.

**Conditions cumulatives du feu vert**

- [ ] Classification unique et pourcentages exacts, y compris sur données incomplètes.
- [ ] Zéro contradiction de statut dans la base de recette et son export validé.
- [ ] Tendance, fraîcheur et diagnostic global justifiés par des données identifiables.
- [ ] Modification du package détectée par la CI et Strapi avec des résultats cohérents.
- [ ] Tests ciblés, build du package et contrôles requis réussis sur le commit présenté.
- [ ] Recette fonctionnelle et visuelle réalisée sur l'environnement cible.
- [ ] Aucune anomalie restante qui fausse un indicateur, masque une donnée inconnue ou périmée, ou empêche l'action principale.
- [ ] Rapport de recette et preuves consultables ; décision de feu vert consignée par le responsable qualité.

La livraison peut conserver des domaines en manque de preuve, en manque produit ou hors périmètre, à condition que le réacteur les représente correctement et que leur traitement soit suivi.
