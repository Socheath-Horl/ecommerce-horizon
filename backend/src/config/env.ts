export const env = {
  port: Number(process.env.PORT ?? 3000),
  api_prefix: process.env.API_PREFIX ?? 'api',
  cors_origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  database_url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/horizon-ecommerce',
};