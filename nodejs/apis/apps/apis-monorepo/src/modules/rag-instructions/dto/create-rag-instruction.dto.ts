import { IsString, IsArray, IsObject, IsBoolean, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRagInstructionDto {
  @ApiProperty({ description: 'Identificador da unidade' })
  @IsString()
  unitId: string;

  @ApiProperty({ 
    description: 'Array de instruções para o agente RAG',
    type: [String],
    example: [
      'Você é um assistente virtual especializado em produtos infantis',
      'Sempre mencione a garantia de 30 dias para todos os produtos'
    ]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions: string[];

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
      description: 'Instruções para unidade de produtos infantis',
      tags: ['infantil', 'brinquedos']
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
}
