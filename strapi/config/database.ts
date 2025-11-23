import path from 'path';

type Env = {
  (key: string, defaultValue?: any): any;
  int(key: string, defaultValue?: number): number;
  bool(key: string, defaultValue?: boolean): boolean;
  json<T = unknown>(key: string, defaultValue?: T): T;
};

type ConfigContext = {
  env: Env;
};

function buildPoolConfig(env: Env) {
  return {
    min: env.int('DATABASE_POOL_MIN', 2),
    max: env.int('DATABASE_POOL_MAX', 10),
    acquireTimeoutMillis: env.int('DATABASE_POOL_ACQUIRE_TIMEOUT', 60000),
    idleTimeoutMillis: env.int('DATABASE_POOL_IDLE_TIMEOUT', 30000),
  };
}

function buildPostgresConnection(env: Env) {
  const sslEnabled = env.bool('DATABASE_SSL', false);
  const sslRejectUnauthorized = env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true);
  const sslCa = env('DATABASE_SSL_CA');

  const ssl = sslEnabled
    ? {
        rejectUnauthorized: sslRejectUnauthorized,
        ca: sslCa || undefined,
      }
    : false;

  return {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'openg7_cms'),
      user: env('DATABASE_USERNAME', 'openg7'),
      password: env('DATABASE_PASSWORD', ''),
      schema: env('DATABASE_SCHEMA', 'public'),
      ssl,
    },
    pool: buildPoolConfig(env),
    debug: env.bool('DATABASE_DEBUG', false),
  };
}

function buildSqliteConnection(env: Env) {
  return {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', '..', 'data', env('DATABASE_FILENAME', 'db.sqlite')),
    },
    useNullAsDefault: true,
    debug: env.bool('DATABASE_DEBUG', false),
  };
}

export default ({ env }: ConfigContext) => {
  const client = (env('DATABASE_CLIENT', 'sqlite') as string).toLowerCase();

  if (client === 'postgres') {
    return {
      connection: buildPostgresConnection(env),
    };
  }

  if (client === 'sqlite') {
    return {
      connection: buildSqliteConnection(env),
    };
  }

  throw new Error(
    `Unsupported DATABASE_CLIENT "${client}". Supported values are "postgres" and "sqlite".`,
  );
};
