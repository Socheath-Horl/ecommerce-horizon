import { Router, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { validate } from '@/common/middleware/validate';
import { require_auth } from '@/common/middleware/auth';
import { FilesService } from '@/modules/files/files.service';
import { allowed_image_mimes, max_file_size, upload_meta_schema } from '@/modules/files/files.dto';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: max_file_size } });

export class FilesController {
  constructor(private readonly files_service: FilesService = new FilesService()) {}

  static routes(): Router {
    const controller = new FilesController();
    return Router()
      .use(require_auth)
      .post('/upload', upload.single('file'), validate(upload_meta_schema), (req, res) => controller.upload(req, res));
  }

  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'file is required' },
      });
      return;
    }
    if (!allowed_image_mimes.includes(req.file.mimetype as (typeof allowed_image_mimes)[number])) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid file type: ${req.file.mimetype}. Allowed: ${allowed_image_mimes.join(', ')}`,
        },
      });
      return;
    }
    if (req.file.size > max_file_size) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'File too large (max 5MB)' },
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