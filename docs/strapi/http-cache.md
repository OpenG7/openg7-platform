# Cache HTTP devant Strapi

Pour absorber la montée en charge durant le sommet, l'API publique Strapi est protégée par un reverse proxy Varnish (`openg7-strapi-cache`) déployé dans Kubernetes. Cette couche sert les requêtes anonymes en cache et réduit significativement la charge sur les pods Strapi.

## Architecture

- **Service interne** `openg7-strapi` : expose Strapi sur le port 80.
- **Service cache** `openg7-strapi-cache` : pods Varnish (2 réplicas) avec un VCL personnalisé.
- **Ingress** : pointe désormais vers `openg7-strapi-cache`.

## Politique de cache

- Mise en cache des requêtes `GET`/`HEAD` anonymes sur `/api/*` pendant 5 minutes (`beresp.ttl = 300s`).
- Bypass automatique des routes d'administration, des sessions authentifiées (`strapi.sid`) et des prévisualisations (`preview=true`).
- En-tête `X-Cache` ajouté à toutes les réponses pour diagnostiquer les hits/miss.

## Invalidation via webhooks

1. Créez un secret Kubernetes `strapi-cache-secrets` contenant `purge-token`.
2. Déclarez un webhook Strapi (`Settings → Webhooks`) pointant vers `https://cms.openg7.org/api/companies` (méthode `PURGE`) ou toute URL spécifique que vous souhaitez invalider.
3. Configurez le webhook pour les évènements `Entry.publish` et `Entry.unpublish` sur les collections `company` et `exchange`.
4. Ajoutez l'en-tête `X-Purge-Token: <votre-token>` dans le webhook.

> Alternative : déclencher la purge depuis le pipeline CI/CD (`curl -X PURGE https://cms.openg7.org/api/companies`).

## Monitoring

- Scraper `X-Cache` depuis les logs Ingress pour suivre le taux HIT/MISS.
- Exporter les métriques Varnish (`varnishstat -j`) vers Prometheus via un `DaemonSet` `varnish-exporter`.
- Alerting lorsque le taux de HIT < 60% pendant 10 minutes.

## Tests

1. Publier un contenu dans Strapi et vérifier qu'il est servi immédiatement via le cache (HIT au deuxième appel).
2. Exécuter `k6 run scripts/public-api.js` pour simuler 100 req/s sur `/api/companies`.
3. Vérifier que la latence médiane reste < 80 ms et que CPU Strapi baisse de 40%.
