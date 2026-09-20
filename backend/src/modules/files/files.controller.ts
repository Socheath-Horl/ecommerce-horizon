import { Router } from 'express';
import { require_auth } from '@/common/middleware/auth';
import { FilesService } from '@/modules/files/files.service';

export class FilesController {
  constructor(private readonly files_service: FilesService = new FilesService()) {}

  static routes(): Router {
    const controller = new FilesController();
    // POST /upload, GET /, GET /:id, DELETE /:id, PUT /:id/link|unlink → 1.18–1.21
    return Router().use(require_auth);
  }
}