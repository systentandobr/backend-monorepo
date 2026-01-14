import * as path from 'path';

export interface StorageConfig {
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  ALLOWED_MIME_TYPES: string[];
  THUMBNAIL_SIZE: { width: number; height: number };
  HASH_ALGORITHM: string;
}

export const storageConfig: StorageConfig = {
  UPLOAD_DIR:
    process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'products'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB em bytes
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  THUMBNAIL_SIZE: {
    width: parseInt(process.env.THUMBNAIL_WIDTH || '300', 10),
    height: parseInt(process.env.THUMBNAIL_HEIGHT || '300', 10),
  },
  HASH_ALGORITHM: process.env.HASH_ALGORITHM || 'sha256',
};
