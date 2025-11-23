# Partner quick actions panel

Ce composant standalone (`og7-partner-quick-actions`) affiche un panneau QR avec actions rapides. Il attend `partnerId` (obligatoire), `partnerName` et `baseUrl` (optionnels). Le QR est rendu côté client via un import dynamique de `qrcode`.

Les traductions sont chargées dynamiquement depuis `./i18n/partner.quick-actions.{fr,en}.json`. Pour éviter les accès DOM côté serveur, toutes les interactions (QR, presse-papiers, téléchargement) sont protégées par `isPlatformBrowser`.
