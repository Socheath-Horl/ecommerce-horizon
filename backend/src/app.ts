import 'dotenv/config';
import cors, { type CorsOptions } from 'cors';
import express from 'express';
import { error_handler, not_found_handler } from '@/common/filters/error.filter';
import { DocsController } from '@/api_docs/docs.controller';
import { env } from '@/config/env';
import { AuthController } from '@/modules/auth/auth.controller';
import { HealthController } from '@/modules/health/health.controller';
import { FilesController } from '@/modules/files/files.controller';
import { UsersController } from '@/modules/users/users.controller';

const api_prefix = `/${env.api_prefix}`;

const cors_options: CorsOptions = {
  origin: env.cors_origin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

const app = express();

app.use(cors(cors_options));
app.use(express.json());

app.use(`${api_prefix}/health`, HealthController.routes());
app.use(`${api_prefix}/auth`, AuthController.routes());
app.use(`${api_prefix}/users`, UsersController.routes());
app.use(`${api_prefix}/files`, FilesController.routes());
app.use(`${api_prefix}/docs`, DocsController.routes());

app.use(not_found_handler);
app.use(error_handler);

export const app_info = { api_prefix };

export default app;