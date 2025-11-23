**Languages:** [English](#english) | [Français](#francais)

<a id="english"></a>
# Repository ruleset – main (English)

This document describes the GitHub ruleset **“OpenG7 – Main branch protection”**, applied to the `main` branch of the repository.

Its goal is to keep `main` **stable, verified, and readable**, while staying practical for maintainers in their day‑to‑day work.

Associated JSON model: `docs/governance/repository-ruleset-main.json`  
Effective source of truth: **GitHub → Settings → Rules → Rulesets**.

---

## 1. Scope of the ruleset

```json
{
  "name": "OpenG7 – Main branch protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "refs/heads/main"
      ]
    }
  }
}
```

- **name**: functional name of the ruleset, as shown in the GitHub UI.
- **target: "branch"**: the ruleset applies to branches (not tags or the whole repo).
- **enforcement: "active"**: the rules are actually enforced, not in draft mode.
- **ref_name.include: ["refs/heads/main"]**: only the `main` branch is targeted.

👉 In practice:
- `main` is treated as the **protected, stable branch** (code that should be deployable).
- Development happens on feature branches, then flows back into `main` through PRs.

---

## 2. Rules and why they exist

### 2.1 Required pull request reviews

```json
{
  "type": "required_pull_request_reviews",
  "parameters": {
    "dismiss_stale_reviews_on_push": true,
    "require_code_owner_review": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  }
}
```

**What it enforces**

- All changes to `main` must go through a **pull request**.
- At least **1 approving review** is required.
- When new commits are pushed to the PR, previous reviews are **dismissed**.

**Why for OpenG7**

- Prevent direct, unreviewed pushes to `main`.
- Avoid merging code that has changed since it was reviewed.
- Encourage a habit of **systematic peer review**, even in a small core team.

---

### 2.2 Required status checks

```json
{
  "type": "required_status_checks",
  "parameters": {
    "strict_required_status_checks_policy": true,
    "required_status_checks": [
      { "context": "ci/lint",  "integration_id": null },
      { "context": "ci/test",  "integration_id": null },
      { "context": "ci/build", "integration_id": null }
    ]
  }
}
```

**What it enforces**

A PR cannot be merged into `main` unless these checks are green:

- `ci/lint`: monorepo ESLint / code quality.
- `ci/test`: tests (unit / integration).
- `ci/build`: build of the main artefacts (Angular, Strapi, etc.).

**Why for OpenG7**

- Ensure that:
  - the code **builds**,
  - basic **quality** is respected,
  - **tests** are passing before hitting `main`.
- Limit obvious regressions on a branch meant to be **deployable and trustworthy**.

> Note: after importing the ruleset, the check names (`ci/lint`, `ci/test`, `ci/build`) must be aligned with the **exact job names** in GitHub Actions.

---

### 2.3 Non fast-forward (history protection)

```json
{
  "type": "non_fast_forward",
  "parameters": {}
}
```

**What it enforces**

- Blocks history‑rewriting operations on `main` (e.g. rebase / force‑push on the protected branch).

**Why for OpenG7**

- Protect the `main` history from destructive actions.
- Keep history **auditable and reproducible**, which matters for:
  - community trust,
  - institutional or governmental reuse of OpenG7.

---

### 2.4 Required linear history

```json
{
  "type": "required_linear_history",
  "parameters": {}
}
```

**What it enforces**

- The `main` branch must have a **linear history**:
  - no complex merge commits,
  - PRs are merged as fast‑forward / squash.

**Why for OpenG7**

- Make Git history **easy to read and debug**:
  - simpler `git bisect`,
  - clearer release notes,
  - easier onboarding for new contributors.

---

### 2.5 Restricted pushes

```json
{
  "type": "restrict_pushes",
  "parameters": {
    "allowed_actor_ids": [],
    "allowed_actor_type": "RepositoryRole",
    "branch_allowlist": [],
    "push_allowance_actors": []
  }
}
```

**What it enforces**

- Direct pushes to `main` are restricted to explicitly allowed actors.
- With the current parameters, the intent is: **no one should push directly to `main`**, everything goes through PRs.

**Why for OpenG7**

- Reinforce the principle: **“main never changes without a pull request”**.
- Prevent human errors (accidental push on `main` instead of a feature branch).
- Align with OpenG7’s ambition as an **infrastructure of trust**.

---

### 2.6 Required signatures

```json
{
  "type": "required_signatures",
  "parameters": {}
}
```

**What it enforces**

- Commits must be **signed** (GPG / GitHub verified) to be accepted into `main` (when signature enforcement is enabled at repo/org level).

**Why for OpenG7**

- Strengthen **authenticity and traceability** of commits.
- Useful if the project is reused by public or regulated institutions, for which code provenance matters.

> If commit signing is not yet in place for all maintainers, this rule can be temporarily disabled in GitHub or documented as a **future target**.

---

### 2.7 Pull request – dismiss stale reviews

```json
{
  "type": "pull_request",
  "parameters": {
    "dismiss_stale_reviews_on_push": true
  }
}
```

**What it enforces**

- Any review becomes stale when new commits are pushed to the PR.

**Why for OpenG7**

- Ensure we review **the actual code being merged**, not an outdated snapshot.
- Encourage contributors to re‑request review when the implementation changes.

---

## 3. Bypass actors (emergency lane)

```json
"bypass_actors": [
  {
    "actor_id": 1,
    "actor_type": "RepositoryRole",
    "bypass_mode": "always"
  }
]
```

**What it means**

- A GitHub repository role (configured in the UI) is allowed to bypass the ruleset in some cases.
- `bypass_mode: "always"`: this actor can override protection if absolutely necessary.

**Why for OpenG7**

- Keep a **controlled emergency lane** for:
  - production incidents requiring a hotfix,
  - CI issues blocking all merges,
  - major migrations.
- Bypasses should remain **exceptional** and documented (PR comment, internal note, etc.).

---

## 4. Ruleset lifecycle

### 4.1 Sources of truth

- **Effective configuration**: GitHub Settings → Rules → Rulesets.  
- **Declarative model**: `docs/governance/repository-ruleset-main.json`.  
- **Human explanation**: this markdown file.

In case of divergence, GitHub settings win, but any significant change should:

1. Go through a PR updating the JSON and this document.  
2. Then be reflected in GitHub (import or manual adjustment).

### 4.2 When to evolve this ruleset?

This ruleset can be tightened or relaxed when:

- the number of maintainers grows (e.g. require 2 reviews, enable code owners, etc.);
- the CI matures (add more required checks);
- forks / mirrors appear in other organizations or countries (local adaptations).

---

## 5. Summary

In one sentence:

> This ruleset protects `main` so it remains a **stable, tested, and readable trunk**, aligned with OpenG7’s ambition to be a new kind of “Hello, World” for economic collaboration.

---

<a id="francais"></a>
# Ruleset du dépôt – branche main (Français)

Ce document décrit le ruleset GitHub **« OpenG7 – Main branch protection »**, appliqué à la branche `main` du dépôt.

Son objectif : faire de `main` une branche **stable, vérifiée et lisible**, tout en restant exploitable au quotidien par les mainteneur·e·s.

Modèle JSON associé : `docs/governance/repository-ruleset-main.json`  
Source de vérité effective : **GitHub → Settings → Rules → Rulesets**.

---

## 1. Portée du ruleset

```json
{
  "name": "OpenG7 – Main branch protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "refs/heads/main"
      ]
    }
  }
}
```

- **name** : nom fonctionnel du ruleset dans l’interface GitHub.
- **target: "branch"** : le ruleset s’applique aux branches (et non aux tags ou au dépôt entier).
- **enforcement: "active"** : les règles sont effectivement appliquées, pas en mode “brouillon”.
- **ref_name.include: ["refs/heads/main"]** : seule la branche `main` est ciblée.

👉 En pratique :
- `main` est la branche **protégée et stable** (code supposé déployable).  
- Le développement se fait sur des branches de feature, fusionnées ensuite via PR.

---

## 2. Règles et raisons d’être

### 2.1 required_pull_request_reviews

```json
{
  "type": "required_pull_request_reviews",
  "parameters": {
    "dismiss_stale_reviews_on_push": true,
    "require_code_owner_review": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  }
}
```

**Ce que la règle impose**

- Toute modification de `main` passe par une **pull request**.
- Au moins **1 revue approuvée** est nécessaire.
- Si de nouveaux commits sont poussés sur la PR, les anciennes revues sont **invalidées**.

**Pourquoi pour OpenG7**

- Empêcher les push directs non relus sur `main`.  
- Éviter de merger du code qui a changé après la review.  
- Ancrer une culture de **relecture systématique**, même avec peu de mainteneurs.

---

### 2.2 required_status_checks

```json
{
  "type": "required_status_checks",
  "parameters": {
    "strict_required_status_checks_policy": true,
    "required_status_checks": [
      { "context": "ci/lint",  "integration_id": null },
      { "context": "ci/test",  "integration_id": null },
      { "context": "ci/build", "integration_id": null }
    ]
  }
}
```

**Ce que la règle impose**

Une PR ne peut pas être mergée dans `main` tant que ces checks ne sont pas au vert :

- `ci/lint` : qualité de code / ESLint du monorepo.
- `ci/test` : tests (unitaires / intégration).
- `ci/build` : build des artefacts principaux (Angular, Strapi, etc.).

**Pourquoi pour OpenG7**

- Garantir que :
  - le code **compile**,  
  - un minimum de **qualité** est respecté,  
  - les **tests** passent avant d’arriver sur `main`.  
- Limiter les régressions évidentes sur une branche censée être **déployable et fiable**.

> À noter : après import du ruleset, les noms de checks (`ci/lint`, `ci/test`, `ci/build`) doivent être alignés avec les **noms exacts** des jobs GitHub Actions.

---

### 2.3 non_fast_forward (protection de l’historique)

```json
{
  "type": "non_fast_forward",
  "parameters": {}
}
```

**Ce que la règle impose**

- Bloque les opérations qui réécrivent l’historique de `main` (rebase / force‑push sur la branche protégée).

**Pourquoi pour OpenG7**

- Protéger l’historique de `main` contre les actions destructrices.  
- Garder un historique **auditables et reproductible**, important pour :  
  - la confiance de la communauté,  
  - une réutilisation par des partenaires publics ou institutionnels.

---

### 2.4 required_linear_history

```json
{
  "type": "required_linear_history",
  "parameters": {}
}
```

**Ce que la règle impose**

- L’historique de `main` doit être **linéaire** :
  - pas de merge commits complexes,
  - PR mergées en fast‑forward / squash.

**Pourquoi pour OpenG7**

- Rendre l’historique Git **facile à lire et à déboguer** :
  - `git bisect` plus simple,
  - changelog plus clair,
  - onboarding facilité pour les nouvelles personnes.

---

### 2.5 restrict_pushes

```json
{
  "type": "restrict_pushes",
  "parameters": {
    "allowed_actor_ids": [],
    "allowed_actor_type": "RepositoryRole",
    "branch_allowlist": [],
    "push_allowance_actors": []
  }
}
```

**Ce que la règle impose**

- Restreint les push directs sur `main` à des acteurs explicitement autorisés.
- Avec la configuration actuelle, l’intention est : **personne ne pousse directement sur `main`**, tout passe par PR.

**Pourquoi pour OpenG7**

- Renforcer le principe : **« main ne bouge jamais sans pull request »**.  
- Éviter les erreurs humaines (push accidentel sur `main` au lieu d’une branche de feature).  
- Aligner la sécurité de `main` avec la vocation d’OpenG7 comme **infrastructure de confiance**.

---

### 2.6 required_signatures

```json
{
  "type": "required_signatures",
  "parameters": {}
}
```

**Ce que la règle impose**

- Les commits doivent être **signés** (GPG / signature GitHub vérifiée) pour être acceptés dans `main` (si l’option est activée au niveau du dépôt / de l’organisation).

**Pourquoi pour OpenG7**

- Renforcer l’**authenticité** et la **traçabilité** des contributions.  
- Utile si le projet est réutilisé par des entités publiques ou régulées, pour lesquelles la provenance du code est critique.

> Si la signature des commits n’est pas encore généralisée, cette règle peut être temporairement désactivée dans GitHub ou documentée comme **objectif cible**.

---

### 2.7 pull_request – dismiss_stale_reviews_on_push

```json
{
  "type": "pull_request",
  "parameters": {
    "dismiss_stale_reviews_on_push": true
  }
}
```

**Ce que la règle impose**

- Toute revue devient caduque dès qu’un nouveau commit est poussé sur la PR.

**Pourquoi pour OpenG7**

- S’assurer que l’on relit **le code réellement mergé**, pas une ancienne version.  
- Encourager à redemander une review quand l’implémentation a changé.

---

## 3. Acteurs pouvant contourner les règles (bypass)

```json
"bypass_actors": [
  {
    "actor_id": 1,
    "actor_type": "RepositoryRole",
    "bypass_mode": "always"
  }
]
```

**Ce que cela signifie**

- Un rôle GitHub (configuré dans l’interface) peut **contourner** les règles dans certains cas.
- `bypass_mode: "always"` : ce rôle peut ignorer les protections si nécessaire.

**Pourquoi pour OpenG7**

- Garder une **voie d’urgence maîtrisée** pour :
  - un incident de production nécessitant un hotfix,
  - un bug CI bloquant toutes les PR,
  - une migration majeure.  
- Ces bypass doivent rester **exceptionnels** et être documentés (commentaire dans la PR, note interne, etc.).

---

## 4. Cycle de vie du ruleset

### 4.1 Sources de vérité

- **Configuration effective** : GitHub Settings → Rules → Rulesets.  
- **Modèle déclaratif** : `docs/governance/repository-ruleset-main.json`.  
- **Explication humaine** : ce fichier markdown.

En cas de divergence, la configuration GitHub fait foi, mais toute modification importante devrait idéalement :

1. Passer par une PR mettant à jour le JSON et ce document.  
2. Être répercutée ensuite dans GitHub (import ou ajustement manuel).

### 4.2 Quand faire évoluer ce ruleset ?

Le ruleset peut évoluer, par exemple lorsque :

- le nombre de mainteneurs augmente (2 reviews minimum, code owners, etc.) ;
- la CI se complexifie (nouveaux checks obligatoires) ;
- des forks / miroirs apparaissent (adaptations locales des règles).

---

## 5. Résumé

En une phrase :

> Ce ruleset protège `main` pour qu’elle reste un **tronc stable, testé et lisible**, cohérent avec l’ambition d’OpenG7 d’être un nouveau « Hello World » pour la collaboration économique.

