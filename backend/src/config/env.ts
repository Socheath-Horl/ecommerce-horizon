export const env = {
  port: Number(process.env.PORT ?? 3000),
  api_prefix: process.env.API_PREFIX ?? 'api',
  cors_origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  database_url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/horizon-ecommerce',
  zitadel_issuer: process.env.ZITADEL_ISSUER ?? 'http://localhost:8080',
  zitadel_client_id: process.env.ZITADEL_CLIENT_ID ?? '',
  zitadel_redirect_uri: process.env.ZITADEL_REDIRECT_URI ?? 'http://localhost:5173/auth/callback',
};