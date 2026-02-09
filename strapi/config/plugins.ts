interface Env {
  (key: string, defaultValue?: any): any;
  bool(key: string, defaultValue?: boolean): boolean;
}

interface ConfigContext {
  env: Env;
}

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default ({ env }: ConfigContext) => {
  const uploadProvider = (env('UPLOAD_PROVIDER', 'aws-s3') as string).toLowerCase();
  const uploadBaseUrl = env('UPLOAD_S3_BASE_URL');
  const uploadEndpoint = env('UPLOAD_S3_ENDPOINT');
  const uploadPrefix = env('UPLOAD_S3_PREFIX');
  const uploadAcl = env('UPLOAD_S3_ACL');

  const smtpPort = parsePositiveInteger(env('SMTP_PORT', 465), 465);
  const smtpSecureDefault = smtpPort === 465;
  const smtpRequireTlsDefault = smtpPort === 587;

  return {
    ...(uploadProvider === 'aws-s3'
      ? {
          upload: {
            config: {
              provider: '@strapi/provider-upload-aws-s3',
              providerOptions: {
                baseUrl: uploadBaseUrl || undefined,
                s3Options: {
                  accessKeyId: env('UPLOAD_S3_ACCESS_KEY_ID'),
                  secretAccessKey: env('UPLOAD_S3_SECRET_ACCESS_KEY'),
                  region: env('UPLOAD_S3_REGION'),
                  endpoint: uploadEndpoint || undefined,
                  params: {
                    Bucket: env('UPLOAD_S3_BUCKET'),
                    Prefix: uploadPrefix || undefined,
                    ACL: uploadAcl || undefined,
                  },
                  s3ForcePathStyle: env.bool('UPLOAD_S3_FORCE_PATH_STYLE', false),
                },
              },
              actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
              },
            },
          },
        }
      : {}),
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST', 'mail.papamail.net'),
          port: smtpPort,
          secure: env.bool('SMTP_SECURE', smtpSecureDefault),
          requireTLS: env.bool('SMTP_REQUIRE_TLS', smtpRequireTlsDefault),
          auth: {
            user: env('SMTP_USERNAME', 'notify@openg7.org'),
            pass: env('SMTP_PASSWORD'),
          },
          connectionTimeout: parsePositiveInteger(
            env('SMTP_CONNECTION_TIMEOUT_MS', 10000),
            10000
          ),
          greetingTimeout: parsePositiveInteger(
            env('SMTP_GREETING_TIMEOUT_MS', 10000),
            10000
          ),
          socketTimeout: parsePositiveInteger(
            env('SMTP_SOCKET_TIMEOUT_MS', 20000),
            20000
          ),
        },
        settings: {
          defaultFrom: env('SMTP_DEFAULT_FROM', 'notify@openg7.org'),
          defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'notify@openg7.org'),
        },
      },
    },
  };
};
