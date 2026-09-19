import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const response_schema = (schema: z.ZodType): object => ({
  success: z.boolean(),
  data: schema,
});

const base_health_response = response_schema(z.object({ status: z.string() }));

const base_auth_config_response = response_schema(
  z.object({
    issuer: z.string(),
    client_id: z.string(),
    redirect_uri: z.string(),
    scopes: z.array(z.string()),
    end_session_uri: z.string(),
  }),
);

const file_url_schema = z.string().nullable();

const base_user_response = response_schema(
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    role: z.string(),
    created_at: z.string().nullable(),
    avatar: file_url_schema,
    addresses: z.array(z.unknown()),
  }),
);

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
      content: { 'application/json': { schema: response_schema(z.never()) } },
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

function build_document() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: { title: 'Horizon E-Commerce API', version: '1.0.0' },
    servers: [{ url: '/api' }],
  });
}

export const openapi_doc = build_document();