import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RagInstruction, RagInstructionDocument } from './schemas/rag-instruction.schema';
import { CreateRagInstructionDto } from './dto/create-rag-instruction.dto';
import { UpdateRagInstructionDto } from './dto/update-rag-instruction.dto';
import { RagInstructionResponseDto } from './dto/rag-instruction-response.dto';
import { CreateRagInstructionFromTextDto } from './dto/create-rag-instruction-from-text.dto';
import { CreateRagInstructionFromUrlDto } from './dto/create-rag-instruction-from-url.dto';
import { CreateRagInstructionFromPdfDto } from './dto/create-rag-instruction-from-pdf.dto';
import { UrlContentProcessorService } from './services/url-content-processor.service';
import { PdfContentProcessorService } from './services/pdf-content-processor.service';
import { RagIndexingService } from './services/rag-indexing.service';

@Injectable()
export class RagInstructionsService {
  private readonly logger = new Logger(RagInstructionsService.name);

  constructor(
    @InjectModel(RagInstruction.name) 
    private ragInstructionModel: Model<RagInstructionDocument>,
    private urlContentProcessor: UrlContentProcessorService,
    private pdfContentProcessor: PdfContentProcessorService,
    private ragIndexingService: RagIndexingService,
  ) {}

  async create(
    createDto: CreateRagInstructionDto, 
    unitId: string
  ): Promise<RagInstructionResponseDto> {
    // Verificar se já existe instrução para esta unidade
    const existing = await this.ragInstructionModel.findOne({
      unitId,
      active: true,
    });

    if (existing) {
      // Atualizar existente ao invés de criar duplicado
      return this.update(existing._id.toString(), createDto, unitId);
    }

    const instruction = new this.ragInstructionModel({
      ...createDto,
      unitId, // Garantir que unitId vem do contexto do usuário
    });

    const saved = await instruction.save();
    return this.toResponseDto(saved);
  }

  async findByUnitId(unitId: string): Promise<RagInstructionResponseDto | null> {
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';
    
    // Buscar instrução específica da unidade ou fallback para padrão
    let instruction = await this.ragInstructionModel.findOne({
      unitId,
      active: true,
    }).sort({ updatedAt: -1 });

    // Se não encontrou e não é a unidade padrão, buscar padrão
    if (!instruction && unitId !== defaultUnitId) {
      instruction = await this.ragInstructionModel.findOne({
        unitId: defaultUnitId,
        active: true,
      }).sort({ updatedAt: -1 });
    }

    if (instruction) {
      // Atualizar lastUsedAt
      instruction.lastUsedAt = new Date();
      await instruction.save();
      
      return this.toResponseDto(instruction);
    }

    return null;
  }

  async getContext(unitId: string): Promise<any> {
    const instruction = await this.findByUnitId(unitId);
    return instruction?.context || {};
  }

  async findAll(unitId: string): Promise<RagInstructionResponseDto[]> {
    const instructions = await this.ragInstructionModel
      .find({ unitId })
      .sort({ updatedAt: -1 })
      .exec();

    return instructions.map(inst => this.toResponseDto(inst));
  }

  async findOne(id: string, unitId: string): Promise<RagInstructionResponseDto> {
    const instruction = await this.ragInstructionModel.findOne({
      _id: id,
      unitId,
    });

    if (!instruction) {
      throw new NotFoundException(`Instrução RAG com ID ${id} não encontrada`);
    }

    return this.toResponseDto(instruction);
  }

  async update(
    id: string,
    updateDto: UpdateRagInstructionDto,
    unitId: string
  ): Promise<RagInstructionResponseDto> {
    const instruction = await this.ragInstructionModel.findOneAndUpdate(
      { _id: id, unitId },
      { ...updateDto, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!instruction) {
      throw new NotFoundException(`Instrução RAG com ID ${id} não encontrada`);
    }

    return this.toResponseDto(instruction);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.ragInstructionModel.deleteOne({
      _id: id,
      unitId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Instrução RAG com ID ${id} não encontrada`);
    }
  }

  /**
   * Cria instrução a partir de texto
   */
  async createFromText(
    createDto: CreateRagInstructionFromTextDto,
    unitId: string
  ): Promise<RagInstructionResponseDto> {
    this.logger.log(`Criando instrução RAG a partir de texto para unitId: ${unitId}`);

    // Processar texto em instruções (dividir por parágrafos ou linhas)
    const instructions = this.processTextToInstructions(createDto.content);

    const instruction = new this.ragInstructionModel({
      unitId,
      instructions,
      sourceType: 'text',
      rawContent: createDto.content,
      context: createDto.context || {},
      metadata: {
        ...createDto.metadata,
        description: createDto.title || createDto.metadata?.description,
        processingStatus: 'completed',
        processedAt: new Date(),
      },
      active: createDto.active !== false,
    });

    const saved = await instruction.save();

    // Indexar no RAG se solicitado
    if (createDto.indexInRAG !== false) {
      await this.ragIndexingService.indexContent(
        unitId,
        createDto.content,
        'text'
      ).then(result => {
        if (result.success) {
          saved.metadata = {
            ...saved.metadata,
            indexedInRAG: true,
            ragIndexedAt: new Date(),
          };
          saved.save();
        }
      }).catch(err => {
        this.logger.warn(`Falha ao indexar conteúdo: ${err.message}`);
      });
    }

    return this.toResponseDto(saved);
  }

  /**
   * Cria instrução a partir de URL
   */
  async createFromUrl(
    createDto: CreateRagInstructionFromUrlDto,
    unitId: string
  ): Promise<RagInstructionResponseDto> {
    this.logger.log(`Criando instrução RAG a partir de URL para unitId: ${unitId}`);

    // Atualizar status de processamento
    const tempInstruction = new this.ragInstructionModel({
      unitId,
      instructions: [],
      sourceType: 'url',
      sourceUrl: createDto.url,
      metadata: {
        ...createDto.metadata,
        processingStatus: 'processing',
      },
      active: createDto.active !== false,
    });
    const tempSaved = await tempInstruction.save();

    try {
      // Extrair conteúdo da URL
      const extracted = await this.urlContentProcessor.extractContentFromUrl(createDto.url);
      
      // Processar conteúdo em instruções
      const instructions = this.processTextToInstructions(extracted.content);

      // Atualizar instrução com conteúdo extraído
      tempSaved.instructions = instructions;
      tempSaved.rawContent = extracted.content;
      tempSaved.metadata = {
        ...tempSaved.metadata,
        ...createDto.metadata,
        description: createDto.title || extracted.title || createDto.metadata?.description,
        processingStatus: 'completed',
        processedAt: new Date(),
      };

      const saved = await tempSaved.save();

      // Indexar no RAG se solicitado
      if (createDto.indexInRAG !== false) {
        await this.ragIndexingService.indexContent(
          unitId,
          extracted.content,
          'url',
          { url: createDto.url }
        ).then(result => {
          if (result.success) {
            saved.metadata = {
              ...saved.metadata,
              indexedInRAG: true,
              ragIndexedAt: new Date(),
            };
            saved.save();
          }
        }).catch(err => {
          this.logger.warn(`Falha ao indexar conteúdo: ${err.message}`);
        });
      }

      return this.toResponseDto(saved);
    } catch (error: any) {
      // Atualizar status de erro
      tempSaved.metadata = {
        ...tempSaved.metadata,
        processingStatus: 'failed',
        processingError: error.message,
      };
      await tempSaved.save();
      throw error;
    }
  }

  /**
   * Cria instrução a partir de PDF
   */
  async createFromPdf(
    createDto: CreateRagInstructionFromPdfDto,
    file: any,
    unitId: string
  ): Promise<RagInstructionResponseDto> {
    this.logger.log(`Criando instrução RAG a partir de PDF para unitId: ${unitId}`);

    // Atualizar status de processamento
    const tempInstruction = new this.ragInstructionModel({
      unitId,
      instructions: [],
      sourceType: 'pdf',
      sourceFileName: file.originalname,
      metadata: {
        ...createDto.metadata,
        processingStatus: 'processing',
      },
      active: createDto.active !== false,
    });
    const tempSaved = await tempInstruction.save();

    try {
      // Extrair texto do PDF
      const extracted = await this.pdfContentProcessor.extractTextFromPdf(file);
      
      // Processar conteúdo em instruções
      const instructions = this.processTextToInstructions(extracted.content);

      // Atualizar instrução com conteúdo extraído
      tempSaved.instructions = instructions;
      tempSaved.rawContent = extracted.content;
      tempSaved.metadata = {
        ...tempSaved.metadata,
        ...createDto.metadata,
        description: createDto.title || file.originalname || createDto.metadata?.description,
        processingStatus: 'completed',
        processedAt: new Date(),
        ...extracted.metadata,
      };

      const saved = await tempSaved.save();

      // Indexar no RAG se solicitado
      if (createDto.indexInRAG !== false) {
        await this.ragIndexingService.indexContent(
          unitId,
          extracted.content,
          'pdf',
          { fileName: file.originalname, fileId: saved._id.toString() }
        ).then(result => {
          if (result.success) {
            saved.metadata = {
              ...saved.metadata,
              indexedInRAG: true,
              ragIndexedAt: new Date(),
            };
            saved.save();
          }
        }).catch(err => {
          this.logger.warn(`Falha ao indexar conteúdo: ${err.message}`);
        });
      }

      return this.toResponseDto(saved);
    } catch (error: any) {
      // Atualizar status de erro
      tempSaved.metadata = {
        ...tempSaved.metadata,
        processingStatus: 'failed',
        processingError: error.message,
      };
      await tempSaved.save();
      throw error;
    }
  }

  /**
   * Processa texto em array de instruções
   */
  private processTextToInstructions(content: string): string[] {
    if (!content || !content.trim()) {
      return [];
    }

    // Dividir por parágrafos duplos (quebras de linha duplas)
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // Se houver poucos parágrafos, dividir por linhas
    if (paragraphs.length < 2) {
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }

    return paragraphs;
  }

  /**
   * Reindexa uma instrução no RAG
   */
  async reindex(id: string, unitId: string): Promise<RagInstructionResponseDto> {
    const instruction = await this.ragInstructionModel.findOne({
      _id: id,
      unitId,
    });

    if (!instruction) {
      throw new NotFoundException(`Instrução RAG com ID ${id} não encontrada`);
    }

    if (!instruction.rawContent) {
      throw new NotFoundException('Conteúdo bruto não disponível para reindexação');
    }

    const result = await this.ragIndexingService.indexContent(
      unitId,
      instruction.rawContent,
      instruction.sourceType || 'text',
      {
        url: instruction.sourceUrl,
        fileName: instruction.sourceFileName,
        fileId: instruction.sourceFileId || instruction._id.toString(),
      }
    );

    if (result.success) {
      instruction.metadata = {
        ...instruction.metadata,
        indexedInRAG: true,
        ragIndexedAt: new Date(),
      };
      await instruction.save();
    }

    return this.toResponseDto(instruction);
  }

  private toResponseDto(instruction: RagInstructionDocument): RagInstructionResponseDto {
    return {
      id: instruction._id.toString(),
      unitId: instruction.unitId,
      instructions: instruction.instructions,
      sourceType: instruction.sourceType,
      sourceUrl: instruction.sourceUrl,
      sourceFileName: instruction.sourceFileName,
      sourceFileId: instruction.sourceFileId,
      rawContent: instruction.rawContent,
      context: instruction.context,
      metadata: instruction.metadata,
      active: instruction.active,
      lastUsedAt: instruction.lastUsedAt,
      createdAt: instruction.createdAt || new Date(),
      updatedAt: instruction.updatedAt || new Date(),
    };
  }
}
