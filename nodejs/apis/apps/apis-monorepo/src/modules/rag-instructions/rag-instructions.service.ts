import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RagInstruction, RagInstructionDocument } from './schemas/rag-instruction.schema';
import { CreateRagInstructionDto } from './dto/create-rag-instruction.dto';
import { UpdateRagInstructionDto } from './dto/update-rag-instruction.dto';
import { RagInstructionResponseDto } from './dto/rag-instruction-response.dto';

@Injectable()
export class RagInstructionsService {
  private readonly logger = new Logger(RagInstructionsService.name);

  constructor(
    @InjectModel(RagInstruction.name) 
    private ragInstructionModel: Model<RagInstructionDocument>,
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

  private toResponseDto(instruction: RagInstructionDocument): RagInstructionResponseDto {
    return {
      id: instruction._id.toString(),
      unitId: instruction.unitId,
      instructions: instruction.instructions,
      context: instruction.context,
      metadata: instruction.metadata,
      active: instruction.active,
      lastUsedAt: instruction.lastUsedAt,
      createdAt: instruction.createdAt || new Date(),
      updatedAt: instruction.updatedAt || new Date(),
    };
  }
}
