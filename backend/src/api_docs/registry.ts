import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { auth_config_data_schema } from '@/modules/auth/auth.dto';
import { file_data_schema, upload_meta_schema } from '@/modules/files/files.dto';
import { health_data_schema } from '@/modules/health/health.dto';
import { user_profile_data_schema } from '@/modules/users/users.dto';

extendZodWithOpenApi(z);

const response_schema = (schema: z.ZodType): z.ZodType => z.object({ success: z.boolean(), data: schema });

const base_health_response = response_schema(health_data_schema);
const base_auth_config_response = response_schema(auth_config_data_schema);
const base_user_response = response_schema(user_profile_data_schema);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearer', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: base_health_response } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/config',
  summary: 'OIDC config for the SPA',
  responses: {
    200: { description: 'SPA OIDC settings', content: { 'application/json': { schema: base_auth_config_response } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  summary: 'Logout (stateless)',
  security: [{ bearer: [] }],
  responses: {
    200: {
      description: 'Logged out',
      content: { 'application/json': { schema: response_schema(z.object({})) } },
    },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/me',
  summary: 'Current user profile (lazy upsert from token claims)',
  security: [{ bearer: [] }],
  responses: {
    200: { description: 'Current user', content: { 'application/json': { schema: base_user_response } } },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/files/upload',
  summary: 'Upload a file',
  security: [{ bearer: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: upload_meta_schema.extend({
            file: z.any().openapi({ type: 'string', format: 'binary' }),
          }),
        },
      },
    },
  },
  responses: {
    201: { description: 'Uploaded', content: { 'application/json': { schema: response_schema(file_data_schema) } } },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});

function build_document() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: { title: 'Horizon E-Commerce API', version: '1.0.0' },
    servers: [{ url: '/api' }],
  });
}

export const openapi_doc = build_document();