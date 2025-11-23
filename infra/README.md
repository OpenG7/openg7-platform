# OpenG7 Kubernetes manifests

Ce répertoire regroupe des manifestes de référence pour déployer les workloads principaux de la plateforme sur un cluster Kubernetes :

- `kubernetes/frontend-ssr.yaml` — déploiement stateless de l'application Angular SSR derrière un Ingress Nginx et un HPA combinant métriques CPU et latence.
- `kubernetes/redis.yaml` — instance Redis stateful utilisée pour les sessions Strapi, le throttling et tout mécanisme nécessitant un store partagé.
- `kubernetes/strapi.yaml` — déploiement Strapi v5 multi-réplicas, cache HTTP Varnish (`openg7-strapi-cache`) devant l'API publique, `STRAPI_SEED_AUTO=false`, stockage objet S3, `ExternalSecret` Vault, Job de seed dédié et intégration Redis/Postgres.
- `cdn/` — configuration CloudFront + S3 pour servir `dist/openg7-org/browser` via CDN.
- `search/` — provisioning Terraform + guide pour un cluster OpenSearch/Meilisearch managé.

Les manifests s'appuient sur l'opérateur External Secrets pour synchroniser automatiquement Vault → Kubernetes (`strapi-database`, `strapi-admin-secrets`, `strapi-upload`, `openg7-redis-secret`). Vérifiez que le `ClusterSecretStore` `vault-openg7` pointe vers votre namespace Vault avant d'appliquer les manifestes.
