import 'dotenv/config';
import cors, { type CorsOptions } from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

const apiPrefix = `/${process.env.API_PREFIX ?? 'api'}`;

const corsOptions: CorsOptions = {
  origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get(`${apiPrefix}/health`, (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

const notFoundHandler: express.RequestHandler = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
};

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
};

app.use(notFoundHandler);
app.use(errorHandler);

export const appInfo = { apiPrefix };

export default app;