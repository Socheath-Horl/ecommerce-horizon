import { db } from '@/db/index';
import { files } from '@/db/schema';
import { minio_service } from '@/common/services/minio.service';

export class FilesService {
  async upload_file(file: Express.Multer.File, user_id: string, entity_type?: string, entity_id?: string) {
    const { key, url } = await minio_service.upload_file(file.buffer, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      entity_type,
    });
    const [created] = await db
      .insert(files)
      .values({
        user_id,
        original_name: file.originalname,
        file_name: key.split('/').pop() ?? key,
        mime_type: file.mimetype,
        size: file.size,
        bucket: minio_service.bucket,
        key,
        url,
        entity_type: entity_type ?? null,
        entity_id: entity_id ?? null,
      })
      .returning();
    return created;
  }
}