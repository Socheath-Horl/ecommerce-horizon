import { Router, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { require_auth } from '@/common/middleware/auth';
import { FilesService } from '@/modules/files/files.service';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export class FilesController {
  constructor(private readonly files_service: FilesService = new FilesService()) {}

  static routes(): Router {
    const controller = new FilesController();
    return Router()
      .use(require_auth)
      .post('/upload', upload.single('file'), (req, res) => controller.upload(req, res));
  }

  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'file is required' },
      });
      return;
    }
    const created = await this.files_service.upload_file(
      req.file,
      req.user!.id,
      req.body.entity_type,
      req.body.entity_id,
    );
    res.status(StatusCodes.CREATED).json({ success: true, data: created });
  }
}