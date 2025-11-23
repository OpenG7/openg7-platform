# CDN frontal pour OpenG7

Ce dossier décrit la mise en place d'un CDN devant l'application Angular SSR afin de servir les assets statiques produits dans `dist/openg7-org/browser` et de réduire la pression sur les pods SSR.

## Objectifs

- Délivrer `dist/openg7-org/browser` via un CDN mondial (ici AWS CloudFront) avec TLS mutualisé et compression automatique.
- Rediriger uniquement les routes dynamiques (`/`, `/companies/...`, `/preview/...`) vers le backend SSR Kubernetes.
- Permettre l'invalidation ciblée lors d'un nouveau déploiement (`yarn build:ssr`).

## Flux de déploiement

1. Construire le front SSR (`yarn build:ssr`) puis publier le dossier `dist/openg7-org/browser` vers un bucket S3 versionné.
2. Invalider l'ancienne distribution CloudFront (chemins `/*`) une fois le contenu synchronisé.
3. Laisser le CDN servir toutes les requêtes `GET` sur les assets (`/*.js`, `/*.css`, `/assets/*`).
4. Configurer l'Ingress Nginx du SSR pour rediriger les chemins dynamiques (`/api/*`, `/preview/*`, `/**` hors assets) vers le service `openg7-frontend-ssr`.

> Astuce : utilisez un pipeline CI (GitHub Actions) pour pousser les assets S3 et lancer l'invalidation CloudFront automatiquement après chaque build.

## Infra de référence

Le fichier [`cloudfront-distribution.yaml`](./cloudfront-distribution.yaml) propose une stack CloudFormation prête à l'emploi :

- Bucket S3 privé avec policy `OriginAccessControl`.
- Distribution CloudFront avec deux origins :
  - `StaticAssets` (S3) pour `dist/openg7-org/browser`.
  - `SsrBackend` (Ingress Nginx) pour les routes dynamiques.
- Règles de behaviours basées sur le préfixe (`/assets/*`, `/*.js`, `/*.css`) vers S3 et fallback vers SSR.
- Headers `Cache-Control` agressifs côté CDN mais invalidables via `aws cloudfront create-invalidation`.

## DNS & routage

- `www.openg7.org` pointe vers la distribution CloudFront.
- `ssr.openg7.org` reste un CNAME direct vers l'Ingress Nginx afin de servir les routes dynamiques (utilisé comme origin secondaire).

## Sécurité

- Activer `Origin Shield` pour réduire la charge sur les pods SSR.
- Forcer TLS 1.2+, HSTS et HTTP/2.
- Limiter les méthodes autorisées (`GET`, `HEAD`) sur l'origine S3.

## Observabilité

- Activer les logs CloudFront dans S3 (`Standard logging` ou `Realtime logs`).
- Publier les métriques vers CloudWatch (latence, taux HIT/MISS).
- Corréler les logs CDN avec `X-Cache` exposé par Strapi/Varnish pour diagnostiquer les purges.
