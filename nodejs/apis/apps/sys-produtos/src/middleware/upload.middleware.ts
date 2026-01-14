import { Injectable, BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { storageConfig } from '../config/storage.config';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadMiddleware {
  static getMulterOptions(): MulterOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Criar estrutura de pastas baseada em data-hora-minuto
          const now = new Date();
          const dateFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

          // Gerar hashId temporário para criar pasta
          const tempHash = crypto.randomBytes(16).toString('hex');
          const uploadPath = path.join(
            storageConfig.UPLOAD_DIR,
            dateFolder,
            tempHash,
          );

          // Criar diretórios se não existirem
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          // Armazenar tempHash no request para uso posterior
          (req as any).tempHash = tempHash;
          (req as any).dateFolder = dateFolder;

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // O nome do arquivo será atualizado no service após gerar o hashId final
          const ext = extname(file.originalname);
          cb(null, `temp${ext}`);
        },
      }),
      limits: {
        fileSize: storageConfig.MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        // Validar tipo MIME
        if (!storageConfig.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Tipo de arquivo não permitido. Tipos permitidos: ${storageConfig.ALLOWED_MIME_TYPES.join(', ')}`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    };
  }
}
