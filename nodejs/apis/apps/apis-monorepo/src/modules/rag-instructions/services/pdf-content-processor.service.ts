import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import type { Multer } from 'multer';

@Injectable()
export class PdfContentProcessorService {
  private readonly logger = new Logger(PdfContentProcessorService.name);

  /**
   * Extrai texto de um arquivo PDF
   */
  async extractTextFromPdf(file: Multer.File): Promise<{
    content: string;
    metadata?: {
      pages?: number;
      extractedAt?: Date;
    };
  }> {
    try {
      if (!file) {
        throw new BadRequestException('Arquivo não fornecido');
      }

      // Verificar se é PDF
      if (
        file.mimetype !== 'application/pdf' &&
        !file.originalname.toLowerCase().endsWith('.pdf')
      ) {
        throw new BadRequestException('Arquivo deve ser um PDF');
      }

      this.logger.log(`Extraindo texto de PDF: ${file.originalname}`);

      const pdfData = await pdfParse(file.buffer);

      return {
        content: this.cleanText(pdfData.text),
        metadata: {
          pages: pdfData.numpages,
          extractedAt: new Date(),
        },
      };
    } catch (error: any) {
      this.logger.error(`Erro ao extrair texto de PDF: ${error.message}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(`Erro ao processar PDF: ${error.message}`);
    }
  }

  /**
   * Limpa e normaliza texto
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Múltiplos espaços em um
      .replace(/\n\s*\n/g, '\n\n') // Múltiplas quebras de linha em duas
      .trim();
  }
}
