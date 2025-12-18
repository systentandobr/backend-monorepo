import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RagInstructionResponseDto {
  @ApiProperty({ description: 'ID do documento' })
  id: string;

  @ApiProperty({ description: 'Identificador da unidade' })
  unitId: string;

  @ApiProperty({ 
    description: 'Array de instruções para o agente RAG',
    type: [String]
  })
  instructions: string[];

  @ApiPropertyOptional({ 
    description: 'Contexto adicional com dados específicos da unidade'
  })
  context?: {
    products?: any[];
    campaigns?: any[];
    customers?: any[];
    trainings?: any[];
    [key: string]: any;
  };

  @ApiPropertyOptional({ 
    description: 'Metadados sobre as instruções'
  })
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
  };

  @ApiProperty({ description: 'Se as instruções estão ativas' })
  active: boolean;

  @ApiPropertyOptional({ description: 'Data da última utilização' })
  lastUsedAt?: Date;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
