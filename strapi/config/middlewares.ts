export default [
  {
    name: 'global::healthcheck',
    config: {
      checkDatabase: true,
      databaseTimeoutMs: 1000,
    },
  },
  'strapi::errors',
  {
    name: 'global::metrics',
    config: {
      slowRequestThresholdMs: 1500,
    },
  },
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Headers',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',

  // ✅ Session SANS config custom → Strapi utilise son store par défaut
  'strapi::session',

  'strapi::favicon',
  'strapi::public',
];
