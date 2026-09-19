import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Client } from 'minio';
import { env } from '@/config/env';

const folder_for = (entity_type?: string): string => {
  const folders: Record<string, string> = {
    product: 'products',
    avatar: 'avatars',
    category: 'categories',
    review: 'reviews',
  };
  return folders[entity_type ?? ''] ?? 'uploads';
};

export class MinioService {
  readonly client: Client;
  readonly bucket: string = env.minio_bucket;

  constructor() {
    this.client = new Client({
      endPoint: env.minio_endpoint,
      port: env.minio_port,
      useSSL: env.minio_use_ssl,
      accessKey: env.minio_access_key,
      secretKey: env.minio_secret_key,
    });
  }

  async ensure_bucket(): Promise<void> {
    if (!(await this.client.bucketExists(this.bucket))) {
      await this.client.makeBucket(this.bucket);
    }
    await this.client.setBucketPolicy(
      this.bucket,
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      }),
    );
  }

  async upload_file(buffer: Buffer, meta: { originalname: string; mimetype: string; entity_type?: string }): Promise<{ key: string; url: string }> {
    const key = `${folder_for(meta.entity_type)}/${randomUUID()}${extname(meta.originalname)}`;
    await this.client.putObject(this.bucket, key, buffer, buffer.length, { 'Content-Type': meta.mimetype });
    return { key, url: `http://${env.minio_endpoint}:${env.minio_port}/${this.bucket}/${key}` };
  }

  async delete_file(bucket: string, key: string): Promise<void> {
    await this.client.removeObject(bucket, key);
  }

  async generate_url(bucket: string, key: string): Promise<string> {
    return this.client.presignedGetObject(bucket, key, 24 * 60 * 60);
  }
}

export const minio_service = new MinioService();