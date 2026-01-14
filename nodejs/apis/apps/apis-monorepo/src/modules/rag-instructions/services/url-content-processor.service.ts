import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class UrlContentProcessorService {
  private readonly logger = new Logger(UrlContentProcessorService.name);

  /**
   * Extrai conteúdo de uma URL
   * Suporta HTML e PDFs
   */
  async extractContentFromUrl(url: string): Promise<{
    content: string;
    title?: string;
    metadata?: {
      contentType?: string;
      contentLength?: number;
      extractedAt?: Date;
    };
  }> {
    try {
      this.logger.log(`Extraindo conteúdo de URL: ${url}`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const contentType = response.headers['content-type'] || '';
      const buffer = Buffer.from(response.data);

      // Verificar se é PDF
      if (
        contentType.includes('application/pdf') ||
        url.toLowerCase().endsWith('.pdf')
      ) {
        return this.extractFromPdfBuffer(buffer, url);
      }

      // Processar como HTML
      return this.extractFromHtml(buffer.toString('utf-8'));
    } catch (error: any) {
      this.logger.error(
        `Erro ao extrair conteúdo de URL ${url}: ${error.message}`,
      );
      throw new BadRequestException(
        `Não foi possível extrair conteúdo da URL: ${error.message}`,
      );
    }
  }

  /**
   * Extrai texto de HTML
   */
  private extractFromHtml(
    html: string,
  ): {
    content: string;
    title?: string;
    metadata?: any;
  } {
    try {
      const $ = cheerio.load(html);

      // Remover scripts, styles e outros elementos não desejados
      $(
        'script, style, nav, header, footer, aside, .ad, .advertisement',
      ).remove();

      // Extrair título
      const title = $('title').text() || $('h1').first().text() || '';

      // Extrair conteúdo principal
      const mainContent = $('main, article, .content, .post, #content').first();
      let content = '';

      if (mainContent.length > 0) {
        content = mainContent.text();
      } else {
        // Fallback: extrair de body
        content = $('body').text();
      }

      // Limpar e normalizar texto
      content = this.cleanText(content);

      return {
        content,
        title: title.trim() || undefined,
        metadata: {
          contentType: 'text/html',
          extractedAt: new Date(),
        },
      };
    } catch (error: any) {
      this.logger.error(`Erro ao processar HTML: ${error.message}`);
      throw new BadRequestException(
        `Erro ao processar conteúdo HTML: ${error.message}`,
      );
    }
  }

  /**
   * Extrai texto de PDF
   */
  private async extractFromPdfBuffer(
    buffer: Buffer,
    url: string,
  ): Promise<{
    content: string;
    title?: string;
    metadata?: any;
  }> {
    try {
      const pdfData = await pdfParse(buffer);

      return {
        content: this.cleanText(pdfData.text),
        title:
          pdfData.info?.Title ||
          url.split('/').pop()?.replace('.pdf', '') ||
          undefined,
        metadata: {
          contentType: 'application/pdf',
          pages: pdfData.numpages,
          extractedAt: new Date(),
        },
      };
    } catch (error: any) {
      this.logger.error(`Erro ao processar PDF: ${error.message}`);
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
