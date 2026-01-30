interface Env {
  (key: string, defaultValue?: any): any;
  bool(key: string, defaultValue?: boolean): boolean;
}

interface ConfigContext {
  env: Env;
}

export default ({ env }: ConfigContext) => {
  const provider = (env('UPLOAD_PROVIDER', 'aws-s3') as string).toLowerCase();

  if (provider !== 'aws-s3') {
    return {};
  }

  const baseUrl = env('UPLOAD_S3_BASE_URL');
  const endpoint = env('UPLOAD_S3_ENDPOINT');
  const prefix = env('UPLOAD_S3_PREFIX');
  const acl = env('UPLOAD_S3_ACL');

  return {
    upload: {
      config: {
        provider: '@strapi/provider-upload-aws-s3',
        providerOptions: {
          accessKeyId: env('UPLOAD_S3_ACCESS_KEY_ID'),
          secretAccessKey: env('UPLOAD_S3_SECRET_ACCESS_KEY'),
          region: env('UPLOAD_S3_REGION'),
          endpoint: endpoint || undefined,
          baseUrl: baseUrl || undefined,
          params: {
            Bucket: env('UPLOAD_S3_BUCKET'),
            Prefix: prefix || undefined,
            ACL: acl || undefined,
          },
          s3ForcePathStyle: env.bool('UPLOAD_S3_FORCE_PATH_STYLE', false),
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};
