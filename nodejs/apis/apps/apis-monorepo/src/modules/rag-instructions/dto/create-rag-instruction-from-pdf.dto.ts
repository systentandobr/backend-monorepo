import { IsString, IsObject, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRagInstructionFromPdfDto {
  @ApiPropertyOptional({ 
    description: 'Título ou descrição das instruções',
    example: 'Manual de Produtos - Extraído de PDF'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ 
    description: 'Contexto adicional com dados específicos da unidade',
    example: {
      products: [],
      campaigns: [],
      customers: []
    }
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
      description: 'Instruções extraídas de PDF',
      tags: ['pdf', 'manual']
    }
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

  @ApiPropertyOptional({ description: 'Se as instruções estão ativas', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ 
    description: 'Se deve indexar automaticamente no RAG após processamento',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  indexInRAG?: boolean;
}
