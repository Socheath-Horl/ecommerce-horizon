import 'dotenv/config';
import cors, { type CorsOptions } from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

const api_prefix = `/${process.env.API_PREFIX ?? 'api'}`;

const cors_options: CorsOptions = {
  origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

const app = express();

app.use(cors(cors_options));
app.use(express.json());

app.get(`${api_prefix}/health`, (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

const not_found_handler: express.RequestHandler = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
};

const error_handler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
};

app.use(not_found_handler);
app.use(error_handler);

export const app_info = { api_prefix };

export default app;