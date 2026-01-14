import {
  IsString,
  IsArray,
  IsObject,
  IsBoolean,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRagInstructionDto {
  @ApiPropertyOptional({
    description:
      'Identificador da unidade (opcional, será extraído do contexto do usuário)',
  })
  @IsOptional()
  @IsString()
  unitId: string;

  @ApiProperty({
    description: 'Array de instruções para o agente RAG',
    type: [String],
    example: [
      'Você é um assistente virtual especializado em produtos infantis',
      'Sempre mencione a garantia de 30 dias para todos os produtos',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions: string[];

  @ApiPropertyOptional({
    description: 'Tipo de fonte do conteúdo',
    enum: ['text', 'url', 'pdf'],
    default: 'text',
  })
  @IsOptional()
  @IsString()
  sourceType?: 'text' | 'url' | 'pdf';

  @ApiPropertyOptional({
    description: 'URL de origem (quando sourceType é url)',
  })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({
    description: 'Nome do arquivo (quando sourceType é pdf)',
  })
  @IsOptional()
  @IsString()
  sourceFileName?: string;

  @ApiPropertyOptional({
    description: 'ID do arquivo armazenado (quando sourceType é pdf)',
  })
  @IsOptional()
  @IsString()
  sourceFileId?: string;

  @ApiPropertyOptional({ description: 'Conteúdo bruto extraído' })
  @IsOptional()
  @IsString()
  rawContent?: string;

  @ApiPropertyOptional({
    description: 'Contexto adicional com dados específicos da unidade',
    example: {
      products: [],
      campaigns: [],
      customers: [],
    },
  })
  @IsOptional()
  @IsObject()
  context?: {
    products?: any[];
    campaigns?: any[];
    customers?: any[];
    trainings?: any[];
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Metadados sobre as instruções',
    example: {
      version: '1.0.0',
      author: 'admin',
      description: 'Instruções para unidade de produtos infantis',
      tags: ['infantil', 'brinquedos'],
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
  };

  @ApiPropertyOptional({
    description: 'Se as instruções estão ativas',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
