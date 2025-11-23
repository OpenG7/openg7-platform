
# 🔍 Analyse détaillée — fonctionnalité de mise en relation

## 🎯 Objectifs produit
- Transformer un **match d’opportunité** (acheteur ↔ fournisseur) en une **demande d’introduction structurée et traçable**.
- Guider l’utilisateur dans la **collecte d’informations critiques** : message d’accroche, conformité, logistique, créneaux, etc.
- Suivre l’avancement via un **pipeline relationnel** (Intro → Reply → Meeting → Review → Deal), synchronisé avec les retours API.

---

## 🧱 Architecture front-end

### 🎛️ Section principale & orchestration UI

- `**Og7IntroBillboardSection**` orchestre l’affichage du panneau partenaire et l’ouverture du dialogue d’introduction. Trois modes sont supportés : `"dialog"`, `"inline"` et `"route"`.  
  📄 `src/app/domains/matchmaking/sections/og7-intro-billboard.section.ts`

- `**IntroBillboardDialogService**` gère le chargement dynamique du composant modal, injecte le match actif, les métadonnées de financement et gère les transitions d’état.  
  📄 `src/app/domains/matchmaking/sections/og7-intro-billboard-dialog.service.ts`

- `**Og7IntroBillboardModalComponent**` encapsule l’expérience utilisateur plein écran. Il affiche les indicateurs (brouillon/existant), le layout principal avec rails latéraux, et les gardes-fous à la fermeture (sauvegarde ou défausse du brouillon).  
  📄 `src/app/domains/matchmaking/sections/og7-intro-billboard-modal.component.ts`

---

## 🧩 Contenu fonctionnel

- `**Og7IntroBillboardContentComponent**` est le cœur fonctionnel : il récupère les profils, pré-remplit le formulaire, gère la progression avec NgRx, et déclenche notifications/analytics.  
  📄 `src/app/domains/matchmaking/sections/og7-intro-billboard-content.component.ts`

- Le stepper est géré par un composant standalone :  
  `**Og7IntroStepperComponent**`, qui gère :
  - la **navigation par étapes**
  - la **validation partielle ou complète**
  - la **synchronisation de l'étape courante dans l’URL**
  - la persistance via NgRx (signal-first)  
  📄 `src/app/domains/matchmaking/og7-mise-en-relation/components/og7-intro-stepper.component.ts`

- Les CTA (envoyer, enregistrer, accéder aux PJ…) sont regroupés dans `**Og7CtaRailComponent**` pour simplifier l’UX et afficher les statuts en temps réel.  
  📄 `src/app/shared/components/cta/og7-cta-rail.component.ts`

---

## 🧮 Structure UI recommandée : **Stepper vertical hybride**

### 📌 But :
Offrir une interface **progressive**, **modulaire** et **simple d’usage**, inspirée des steppers Angular Material mais adaptée à l’architecture `signal()` et au design Tailwind.

### 📁 Fichier suggéré :
`src/app/domains/matchmaking/og7-mise-en-relation/components/og7-intro-stepper.component.ts`

### ✅ Chaque étape comprend :
| Étape | Contenu attendu | Validation |
|-------|------------------|------------|
| 1️⃣ Message | Message personnalisé (≥ 20 caractères) | `messageControl.valid` |
| 2️⃣ Conformité | Upload PJ (ex. NDA, certification) | `attachments.length ≥ 1` |
| 3️⃣ Créneaux | Minimum 2 plages horaires proposées | `slots.length ≥ 2` |
| 4️⃣ Logistique | Mode de transport + Incoterm | `logisticsForm.valid` |
| 5️⃣ Financement (optionnel) | Affichage info programme | — |
| 6️⃣ Pipeline | Affichage progression + badges | — |

> Chaque étape peut intégrer un composant autonome avec `signal()` pour l’état local, et n’émet vers le store que lors du `send()` final ou de la sauvegarde de brouillon.

### 🎨 Exemple de rendu Tailwind :

```html
<div class="space-y-6 border-l-2 border-dashed border-slate-300 pl-4">
  <ng-container *ngFor="let step of steps(); let i = index">
    <div class="relative group">
      <div class="absolute -left-5 top-0 w-3 h-3 rounded-full"
           [class.bg-emerald-600]="step.done()"
           [class.bg-gray-300]="!step.done()"></div>
      <h4 class="font-semibold text-base">{{ step.label }}</h4>
      <p class="text-sm text-gray-500">{{ step.description }}</p>
      <ng-container *ngIf="step.component">
        <ng-container *ngComponentOutlet="step.component"></ng-container>
      </ng-container>
    </div>
  </ng-container>
</div>
```

---

## 📊 Modèle de données & NgRx

- `**ConnectionDraft**`, `**IntroductionDraftState**` et `**PipelineEvent**` sont les entités centrales.  
  📄 `src/app/core/models/connection.ts`

- `**connections.reducer.ts**` gère :
  - l’historique pipeline
  - les états de brouillon
  - les transitions (success/échec)  
  📄 `src/app/store/connections/connections.reducer.ts`

- Les **sélecteurs** exposent les données pertinentes pour afficher badges, brouillons ou statuts.  
  📄 `src/app/store/connections/connections.selectors.ts`

---

## 📤 Flux d’envoi de la mise en relation

1. **Validation locale** : `sendIntroduction()` construit le `ConnectionDraft` uniquement si toutes les étapes sont valides.
2. **Dispatch NgRx** : `ConnectionsActions.createConnection(draft)`
3. **Appel API** via `ConnectionsService.createConnection()`
4. **Effets (`ConnectionsEffects`)** : orchestration des retours, analytics, erreurs.
5. **Réponse Strapi** : succès → mise à jour pipeline + affichage badge `DL`; échec → rollback et message d’erreur localisé.

---

## 💾 Gestion des brouillons & relance

- Détection des modifications : si l’utilisateur ferme sans envoyer, un prompt propose `Sauvegarder`, `Annuler`, `Retour`.
- Restauration du brouillon à la réouverture (message, PJ, créneaux, etc.)
- Suivi des évènements analytics (`intro_template_loaded`, `intro_draft_resumed`)

---

## 📎 Partage & téléchargement

- Chaque mise en relation peut être :
  - partagée via Web Share API
  - téléchargée (PDF ou ZIP) incluant les PJ
  - traquée avec analytics (`partner_card_download`, `partner_card_share`)

---

## 🧠 Points techniques sensibles

- **Accessibilité (a11y)** : navigation clavier complète, éléments ARIA, labels dynamiques.
- **i18n** : message par défaut localisé, changements de langue réactifs.
- **URL sync** : `?step=3` dans la query string pour reprise ou partage d’étape.

---

## 📈 Opportunités d’évolution

- **Push pipeline via Webhooks** Strapi pour les transitions automatiques (`reply`, `deal`).
- **KPI de conversion** par étape dans Matomo ou Segment.
- **Pré-validation CMS** : messages d’erreurs contextualisés avant soumission (PJ manquantes, slots invalides).

---

## ✅ Revue de code — alignement avec l’implémentation

- `Og7IntroBillboardSection` rend désormais le panneau partenaire directement dans la page dédiée (via `forcePanelOpen`) et délègue la navigation aux routes standards sans recourir à une modale propriétaire.
  📄 `src/app/domains/matchmaking/sections/og7-intro-billboard.section.ts`
- `Og7IntroBillboardContentComponent.scorePercent` s’appuie désormais sur `normalizeConfidencePercent`, garantissant un calcul unique du score entre les différentes surfaces (matches, panneau partenaire, modal).
  📄 `src/app/domains/matchmaking/sections/og7-intro-billboard-content.component.ts`
- `Og7IntroStepperComponent` désactive les CTA tant que le message, la conformité, la logistique et le pipeline ne sont pas validés, et persiste l’étape courante dans la query string (`?step=`) pour favoriser la reprise.
  📄 `src/app/domains/matchmaking/og7-mise-en-relation/components/og7-intro-stepper.component.ts`

---

## ⚠️ Revue de code — points à adresser

1. **Les raccourcis CTA ferment le panneau au lieu de cibler l’étape appropriée.** `handleComplianceShortcut()` et `handleSchedulerShortcut()` se contentent d’émettre `closeRequested`, ce qui provoque la fermeture du panneau/du modal au lieu de naviguer vers les étapes `compliance` ou `scheduler` du stepper.
   📄 `src/app/domains/matchmaking/sections/og7-intro-billboard-content.component.ts`
   → Recommandation : appeler `introStepper?.goToStep('compliance' | 'scheduler')` et conserver le panneau ouvert pour respecter la promesse UX des boutons « Proposer des créneaux » et « Ajouter des pièces jointes ».

2. **Effet de bord critique en mode « inline ».** Dans la page dédiée (`Og7IntroBillboardPage`), `panelClosed` est relié à `handleClose()` qui renvoie l’utilisateur vers l’accueil. Comme les raccourcis CTA déclenchent `closeRequested`, un clic sur ces boutons dans le mode inline fait immédiatement sortir l’utilisateur du flow de mise en relation.
   📄 `src/app/domains/matchmaking/sections/og7-intro-billboard.section.ts`
   📄 `src/app/domains/matchmaking/og7-mise-en-relation/og7-intro-billboard.page.ts`
   → Recommandation : supprimer l’émission `closeRequested` pour ces actions ou distinguer un nouvel événement (`focusStep`) qui laisse le panneau ouvert et positionne le stepper sur l’étape ciblée.
