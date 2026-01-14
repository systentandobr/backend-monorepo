import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RagIndexingService {
  private readonly logger = new Logger(RagIndexingService.name);
  private readonly pythonApiUrl: string;

  constructor() {
    this.pythonApiUrl =
      process.env.PYTHON_RAG_API_URL || 'http://localhost:7001';
  }

  /**
   * Indexa conteúdo no RAG do Python
   */
  async indexContent(
    unitId: string,
    content: string,
    sourceType: 'text' | 'url' | 'pdf',
    sourceMetadata?: {
      url?: string;
      fileName?: string;
      fileId?: string;
    },
  ): Promise<{ success: boolean; message?: string }> {
    try {
      this.logger.log(`Indexando conteúdo no RAG para unitId: ${unitId}`);

      const payload = {
        unit_id: unitId,
        content: content,
        source_type: sourceType,
        source_metadata: sourceMetadata || {},
      };

      const response = await axios.post(
        `${this.pythonApiUrl}/api/rag/ingest-instruction`,
        payload,
        {
          timeout: 60000, // 60 segundos para processar
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        this.logger.log(`Conteúdo indexado com sucesso para unitId: ${unitId}`);
        return { success: true, message: 'Conteúdo indexado com sucesso' };
      }

      return { success: false, message: 'Resposta inesperada do serviço RAG' };
    } catch (error: any) {
      this.logger.error(`Erro ao indexar conteúdo no RAG: ${error.message}`);

      // Não falhar a criação da instrução se a indexação falhar
      // A indexação pode ser feita posteriormente
      return {
        success: false,
        message: `Erro ao indexar: ${error.message}`,
      };
    }
  }

  /**
   * Reindexa uma instrução existente
   */
  async reindexInstruction(
    unitId: string,
    instructionId: string,
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      this.logger.log(
        `Reindexando instrução ${instructionId} para unitId: ${unitId}`,
      );

      const response = await axios.post(
        `${this.pythonApiUrl}/api/rag/reindex-instruction`,
        {
          unit_id: unitId,
          instruction_id: instructionId,
        },
        {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        return { success: true, message: 'Instrução reindexada com sucesso' };
      }

      return { success: false, message: 'Resposta inesperada do serviço RAG' };
    } catch (error: any) {
      this.logger.error(`Erro ao reindexar instrução: ${error.message}`);
      return {
        success: false,
        message: `Erro ao reindexar: ${error.message}`,
      };
    }
  }
}
