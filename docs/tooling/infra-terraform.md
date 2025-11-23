# Automatisation infra (Terraform) et plan de déploiement préprod/prod

## État actuel

- **Provisioning Terraform existant** : seul le moteur de recherche managé dispose d'un plan Terraform prêt à l'emploi (`infra/search/opensearch.tf`) avec sécurité, chiffrement et auto-scaling. 【F:infra/search/opensearch.tf†L1-L172】【F:infra/search/README.md†L19-L50】
- **Workloads applicatifs** : les déploiements Strapi, Redis et frontend SSR sont décrits en manifestes Kubernetes YAML, sans équivalent Terraform (cluster/namespace/addons non fournis). 【F:infra/README.md†L5-L11】【F:infra/kubernetes/strapi.yaml†L109-L381】【F:infra/kubernetes/frontend-ssr.yaml†L1-L138】
- **CDN** : une stack CloudFormation YAML est présente (`infra/cdn/cloudfront-distribution.yaml`) mais aucun module Terraform n'est fourni pour le CDN ni pour le bucket S3 associé. 【F:infra/README.md†L5-L10】

> Conclusion : l'auto-construction via Terraform n'est aujourd'hui possible que pour le cluster de recherche. Les briques Kubernetes (EKS/GKE/AKS), Redis, Strapi, frontend SSR et CDN doivent être encapsulées dans des modules Terraform ou déployées manuellement.

## Checklist séquencée pour un déploiement préproduction/production

1. **Préparer l'état Terraform**
   - Créer un backend distant (S3 + DynamoDB ou équivalent) pour verrouiller l'état et partager les plans.
   - Définir un fichier `terraform.tfvars` distinct par environnement avec `vpc_id`, `strapi_security_group_id`, `indexer_role_name`, `indexer_cidr_blocks`, `environment` pour le module `infra/search`. 【F:infra/search/opensearch.tf†L23-L172】
   - Initialiser et valider : `terraform -chdir=infra/search init`, `terraform -chdir=infra/search plan -var-file=preprod.tfvars` puis `apply` après revue.

2. **Industrialiser le cluster Kubernetes (manquant)**
   - Créer un module Terraform pour le cluster (EKS/GKE/AKS), incluant : nodes autoscalés multi-AZ, Ingress Nginx, External Secrets Operator, cert-manager et storage classes.
   - Ajouter des ressources Terraform pour les Secrets de base (ingress TLS) et pour l'installation de l'opérateur External Secrets afin d'alimenter les `ExternalSecret` déjà décrits dans `infra/kubernetes/strapi.yaml`. 【F:infra/kubernetes/strapi.yaml†L119-L498】
   - Préparer des `kubectl_manifest`/`helm_release` Terraform pour appliquer les YAML existants (`strapi.yaml`, `redis.yaml`, `frontend-ssr.yaml`) ou les convertir en charts Helm réutilisables.

3. **Base de données et Redis managés**
   - Ajouter des modules Terraform pour Postgres managé (Multi-AZ, sauvegardes automatiques, paramètres de pool) et Redis managé/Elasticache avec réplica et failover. Les secrets d'accès seront injectés via Vault + External Secrets conformément aux manifests Strapi. 【F:infra/kubernetes/strapi.yaml†L119-L498】

4. **CDN + stockage statique**
   - Convertir `infra/cdn/cloudfront-distribution.yaml` en module Terraform (S3 versionné + CloudFront avec behaviours par préfixe). Coupler l'étape de build front SSR (`dist/openg7-org/browser`) avec un `terraform apply` déclenchant l'upload S3 et l'invalidation CloudFront.

5. **Déploiement applicatif**
   - Pousser les images `openg7-frontend-ssr` et `openg7-strapi` taguées (préprod/prod) dans le registre.
   - Appliquer les manifestes via Terraform/Helm en fournissant les Secrets External Secrets ; vérifier que les HPAs sont actifs pour absorber les pics (`minReplicas` 3→12 pour le front, 2→10 pour Strapi). 【F:infra/kubernetes/frontend-ssr.yaml†L8-L138】【F:infra/kubernetes/strapi.yaml†L115-L329】
   - Lancer le Job de seed Strapi uniquement si autorisé par les garde-fous (`STRAPI_SEED_AUTO=false` dans le ConfigMap). 【F:infra/kubernetes/strapi.yaml†L82-L100】【F:infra/kubernetes/strapi.yaml†L330-L381】

6. **Validation post-déploiement**
   - Vérifier la santé : probes `/_health` pour Strapi, `/healthz` pour le front SSR, métriques HPA (CPU + latence). 【F:infra/kubernetes/frontend-ssr.yaml†L51-L138】【F:infra/kubernetes/strapi.yaml†L163-L329】
   - Tester les chemins critiques : `/api/homepage`, `/preview/homepage`, endpoints cache Varnish (`PURGE`).
   - Déclencher une montée en charge contrôlée (K6) pour valider le scaling horizontal et la propagation des secrets.

## Gestion des artefacts (build, diffusion, rollback)

- **Builds immuables** :
  - `openg7-frontend-ssr` et `openg7-strapi` sont générées via CI à partir des tags git (`v*`), avec provenance SBOM et digest immuable (`image:tag@sha256:...`).
  - Le build front génère également un bundle statique versionné (`dist/openg7-org/browser`) archivé dans un bucket (ex.: `s3://openg7-artifacts/<env>/<version>/browser.zip`) utilisé par Terraform pour le CDN.
- **Publication contrôlée** :
  - Les manifests Kubernetes/Helm référencent uniquement des tags immuables ; un job CI pousse un `release-manifest.yaml` listant les digests images + la version du bundle statique.
  - Les plans Terraform approuvés sont archivés par environnement (`terraform.d/plans/preprod.plan`) pour garantir la reproductibilité du déploiement.
- **Rollback** :
  - **Applicatif** : redeployer le `release-manifest.yaml` précédent (N-1) en pointant vers les digests antérieurs ; pour le front statique, réinjecter l'archive `browser.zip` précédente et lancer l'invalidation CloudFront ciblée.
  - **Infra** : rejouer le plan Terraform validé N-1 (`terraform apply <plan>`) et restaurer l'état backend si besoin ; supprimer/annuler les ressources créées par le plan fautif avant ré-apply.
  - **Base de données** : s'appuyer sur les snapshots managés Postgres/Redis alignés sur la version N-1 et documenter le RPO/RTO attendu.

## Gestion des tokens et secrets dans un dépôt ouvert

- **Ne jamais committer de secrets** : s'appuyer sur les `.env.example` et instructions de rotation existantes pour générer localement les tokens (`STRAPI_API_READONLY_TOKEN`, `PREVIEW_TOKEN`, comptes admin). 【F:docs/tooling/environments.md†L16-L74】
- **Source of truth Vault** : utiliser Vault (ou Secret Manager équivalent) alimenté par Terraform, puis External Secrets pour synchroniser automatiquement les Secrets Kubernetes (`strapi-database`, `strapi-admin-secrets`, `strapi-upload`). 【F:docs/tooling/environments.md†L61-L65】【F:infra/kubernetes/strapi.yaml†L119-L498】
- **Séparation des rôles** :
  - Tokens front (read-only, preview) stockés dans un secret unique `openg7-frontend-secrets` côté Kubernetes ; seuls les pods front les lisent. 【F:infra/kubernetes/frontend-ssr.yaml†L24-L44】
  - Secrets critiques (APP_KEYS, SESSION_KEYS, Postgres, S3) gérés par External Secrets et non exposés aux pods front. 【F:infra/kubernetes/strapi.yaml†L125-L180】【F:infra/kubernetes/strapi.yaml†L383-L498】
- **Flux CI/CD** :
  - Charger les secrets via variables protégées (CI) ou via backends secrets Terraform ; interdire toute interpolation de secret en clair dans les manifestes.
  - Ajouter des jobs de lint secrets (Trufflehog/Gitleaks) et des tests de config préprod (`yarn validate:preprod-runtime-config`) avant le build front. 【F:docs/tooling/environments.md†L29-L73】
- **Rotation** : suivre la procédure de rotation décrite (regénération du token Strapi, propagation vers le front, redémarrage contrôlé). 【F:docs/tooling/environments.md†L16-L74】

## Pistes d'amélioration supplémentaires

- **Terraformisation complète** : créer des modules réutilisables pour les manifestes Kubernetes et le CDN afin d'obtenir un plan unique couvrant réseau, stockage, compute et distribution.
- **Stabilité** : ajouter des PodDisruptionBudget et des budgets de burst pour Redis/Strapi/Varnish afin de préserver la disponibilité pendant les drains de nœuds.
- **Performance** : envisager un cache CDN côté API publique (CloudFront behaviour `/api/*` vers Varnish) et activer un circuit breaker côté Ingress (timeouts + retries) lors des pics.
- **Observabilité** : compléter l'approche CloudWatch/OpenSearch par des dashboards prom/k6 pour suivre la latence SSR et le taux HIT/MISS Varnish.
- **Documentation** : relier ce guide depuis `docs/tooling/README.md` pour qu'il devienne la référence déploiement infra.
