import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import SwaggerParser from '@apidevtools/swagger-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const specPath = resolve(__dirname, 'openapi.json');

try {
  await SwaggerParser.validate(specPath);
  console.log('OpenAPI specification is valid.');
} catch (error) {
  console.error('OpenAPI validation failed.');
  console.error(error);
  process.exitCode = 1;
}
