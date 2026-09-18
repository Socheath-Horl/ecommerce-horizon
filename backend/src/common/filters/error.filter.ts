import { type ErrorRequestHandler, type RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const not_found_handler: RequestHandler = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
};

export const error_handler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
};