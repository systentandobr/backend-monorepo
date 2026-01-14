import {
  IsString,
  IsObject,
  IsBoolean,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRagInstructionFromUrlDto {
  @ApiProperty({
    description: 'URL para extrair conteúdo e criar instruções RAG',
    example: 'https://example.com/manual-produtos.pdf',
  })
  @IsUrl({}, { message: 'URL inválida' })
  url: string;

  @ApiPropertyOptional({
    description: 'Título ou descrição das instruções',
    example: 'Manual de Produtos - Extraído de URL',
  })
  @IsOptional()
  @IsString()
  title?: string;

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
      description: 'Instruções extraídas de URL',
      tags: ['url', 'manual'],
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

  @ApiPropertyOptional({
    description: 'Se deve indexar automaticamente no RAG após processamento',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  indexInRAG?: boolean;
}
