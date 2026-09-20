import { z } from 'zod';

export const entity_types = ['user', 'product', 'category', 'review'] as const;
export const allowed_image_mimes = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const max_file_size = 5 * 1024 * 1024; // 5MB (matches multer limits)

// validated after multer fills req.body with the form-text fields (file stays in req.file)
export const upload_meta_schema = z.object({
  entity_type: z.enum(entity_types).optional(),
  entity_id: z.uuid().optional(),
});

// POST /api/files/upload response data
export const file_data_schema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  original_name: z.string(),
  file_name: z.string(),
  mime_type: z.string(),
  size: z.number().int(),
  bucket: z.string(),
  key: z.string(),
  url: z.string(),
  entity_type: z.string().nullable(),
  entity_id: z.string().uuid().nullable(),
  created_at: z.string(),
});