import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { type ZodType } from 'zod';

type ValidationSource = 'body' | 'query';

export function validate(schema: ZodType, source: ValidationSource = 'body'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.flatten(),
        },
      });
      return;
    }
    // assign parsed data to whichever source was validated (body or query)
    (req as Request)[source] = result.data;
    next();
  };
}