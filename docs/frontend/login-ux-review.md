# Audit UX/UI — Page de connexion

Cette note synthétise les observations réalisées sur le composant `LoginPage` et propose des pistes d'amélioration pour fluidifier l'expérience de connexion tout en renforçant l'accessibilité et la clarté du parcours.

## 1. Forces existantes

- **Structure claire** : la page affiche un titre et un sous-titre introductif qui plantent le décor du parcours de connexion, avec un gabarit responsive simple en colonne.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L17-L44】
- **Gestion des modes d'authentification** : le rendu conditionnel adapte l'interface selon la configuration (`local-only`, `hybrid`, `sso-only`), ce qui facilite l'activation progressive des fournisseurs externes.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L27-L37】
- **Gestion des erreurs côté champ** : les messages d'erreur pour l'e-mail et le mot de passe apparaissent après interaction et sont localisés, ce qui limite la frustration utilisateur.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L45-L91】【F:openg7-org/src/assets/i18n/fr.json†L96-L140】
- **Notifications et redirection après succès** : le succès déclenche une notification et une redirection automatique vers `/profile`, consolidant la cohérence du parcours post-authentification.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L162-L168】

## 2. Points de friction UX/UI observés

- **Labels masqués** : les champs reposent sur des `label` visuellement masqués (`sr-only`) et sur des placeholders pour guider l'utilisateur. Cette approche pénalise la lisibilité (notamment en cas d'autocomplétion) et peut perturber certains lecteurs d'écran qui attendent un lien explicite entre le champ et le message d'erreur.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L45-L89】
- **Absence de repères contextuels en mode SSO** : le même sous-titre est utilisé quelle que soit la configuration, y compris quand seul le SSO est proposé, ce qui peut laisser l'utilisateur sans indication claire sur la marche à suivre.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L23-L37】【F:openg7-org/src/assets/i18n/fr.json†L96-L115】
- **Feedback d'erreur API générique** : la chaîne de repli `auth.errors.api` reste très générale, ce qui risque de créer de l'incertitude lorsque l'API retourne un message technique ou vide.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L103-L107】【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L181-L211】
- **Ergonomie clavier perfectible** : aucun focus initial n'est défini sur le champ e-mail, et l'absence d'indicateur de verrouillage majuscule ou de bascule d'affichage du mot de passe peut freiner les utilisateurs sur desktop.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L45-L90】
- **Jerky layout en cas d'erreur** : l'affichage conditionnel des erreurs et du message API insère du contenu sous le lien « mot de passe oublié », ce qui provoque des sauts de mise en page répétés sur un écran étroit.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L93-L120】

## 3. Recommandations priorisées

### 3.1 Quick wins (1 à 2 sprints)

1. **Afficher les labels visibles** : remonter les labels au-dessus des champs ou adopter un composant avec label flottant afin de conserver un repère permanent, tout en associant les messages d'erreur via `aria-describedby` pour améliorer l'annonce aux lecteurs d'écran.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L45-L89】
2. **Adapter la microcopie au mode d'authentification** : prévoir des sous-titres distincts pour le SSO seul, le mode hybride et la connexion locale afin d'orienter clairement l'utilisateur (ex. « Sélectionnez votre fournisseur d'entreprise pour continuer »).【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L27-L37】【F:openg7-org/src/assets/i18n/fr.json†L96-L115】
3. **Pré-positionner le focus et l'autocomplétion** : ajouter `autofocus` sur l'e-mail (en tenant compte du SSR) et vérifier que les attributs `autocomplete` correspondent aux attentes (`username` / `current-password`) pour accélérer la saisie.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L45-L90】
4. **Stabiliser le layout des erreurs** : réserver un bloc de hauteur fixe pour les messages de validation/API ou déplacer le message d'erreur global au-dessus du formulaire pour éviter les décalages à chaque tentative ratée.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L93-L120】

### 3.2 Évolutions UX majeures

1. **Mode mot de passe lisible** : ajouter un bouton « afficher/masquer » accessible au champ mot de passe afin de limiter les erreurs de frappe, tout en respectant la charte visuelle (`btn-ghost` secondaire, par exemple).【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L71-L90】
2. **Feedback API contextualisé** : enrichir `resolveErrorMessage` pour mapper les codes d'erreur courants (compte inactif, mot de passe expiré, etc.) vers des messages actionnables et proposer des CTA (ex. renvoyer vers la réinitialisation).【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L181-L211】
3. **Guidage SSO** : lorsqu'un seul fournisseur est disponible, afficher son logo, un descriptif des étapes et éventuellement un lien d'aide interne (FAQ) pour réduire le taux d'abandon en mode « sso-only ».【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L27-L37】
4. **Instrumentation de la friction** : exploiter les notifications et le store d'observabilité pour tracer les erreurs de formulaire répétées, l'utilisation du SSO vs local et la proportion d'abandons sur la page de login afin de prioriser les améliorations futures.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L162-L176】

### 3.3 Bonnes pratiques long terme

- **Sécurité perçue** : compléter le sous-titre ou ajouter un micro-bloc rassurant sur la protection des données (mention RGPD, chiffrement) pour renforcer la confiance, surtout lorsque l'on demande le mot de passe interne.【F:openg7-org/src/assets/i18n/fr.json†L96-L103】
- **Assistance contextuelle** : proposer un lien « Besoin d'aide ? » menant vers la documentation ou un canal de support, idéalement visible dès le header du formulaire pour limiter les contacts support non qualifiés.【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L17-L107】
- **Préparer le responsive étendu** : vérifier le comportement du formulaire sur mobile paysage / tablettes, notamment la lisibilité du bouton primaire et la taille des zones cliquables, afin de rester conforme aux critères WCAG 2.2 (cibles de 24 px minimum).【F:openg7-org/src/app/domains/auth/pages/login.page.ts†L109-L120】

---

Ces recommandations peuvent être intégrées progressivement : commencer par sécuriser l'accessibilité (labels, focus, messages) puis travailler la différenciation des parcours SSO/locaux et la qualité des feedbacks API pour réduire le churn sur la page de connexion.
