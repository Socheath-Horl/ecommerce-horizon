import 'dotenv/config';
import app, { app_info } from '@/app';
import { minio_service } from '@/common/services/minio.service';
import { env } from '@/config/env';

async function bootstrap(): Promise<void> {
  await minio_service.ensure_bucket();
  app.listen(env.port, () => {
    console.log(`API listening on :${env.port}${app_info.api_prefix}`);
  });
}

bootstrap();