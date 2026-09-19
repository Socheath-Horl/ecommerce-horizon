import { Router, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { apiReference } from '@scalar/express-api-reference';
import { openapi_doc } from '@/api_docs/registry';

export class DocsController {
  static routes(): Router {
    const doc_url = '/api/docs/openapi.json';
    return Router()
      .get('/openapi.json', (_req, res) => {
        res.status(StatusCodes.OK).json(openapi_doc);
      })
      .use(
        '/',
        apiReference({
          spec: { url: doc_url },
          pageTitle: 'Horizon E-Commerce API',
        }),
      );
  }
}