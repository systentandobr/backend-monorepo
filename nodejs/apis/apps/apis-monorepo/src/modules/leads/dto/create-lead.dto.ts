import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadSource } from '../schemas/lead.schema';

export class LeadObjectivesDto {
  @ApiProperty({
    description: 'Objetivo principal do lead',
    example: 'Quero me matricular na academia',
  })
  @IsString()
  primary: string;

  @ApiProperty({
    description: 'Objetivos secundários',
    example: ['Melhorar condicionamento físico', 'Perder peso'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondary?: string[];

  @ApiProperty({
    description: 'Se é aluno, indica interesse em se tornar franqueado no futuro',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  interestedInFranchise?: boolean;
}

export class CreateLeadDto {
  @ApiProperty({
    description: 'Nome completo do lead',
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email válido',
    example: 'joao.silva@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Telefone com DDD',
    example: '+5511999999999',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'Natal',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'RN',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'ID da unidade selecionada',
    example: 'FR-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiProperty({
    description: 'Tipo de segmento de mercado',
    example: 'gym',
    enum: [
      'gym',
      'restaurant',
      'delivery',
      'retail',
      'ecommerce',
      'hybrid',
      'solar_plant',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'gym',
    'restaurant',
    'delivery',
    'retail',
    'ecommerce',
    'hybrid',
    'solar_plant',
  ])
  marketSegment?: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    example: 'student',
    enum: ['student', 'franchise'],
  })
  @IsString()
  @IsIn(['student', 'franchise'])
  userType: 'student' | 'franchise';

  @ApiProperty({
    description: 'Objetivos do lead',
    type: LeadObjectivesDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  objectives?: LeadObjectivesDto;

  @ApiProperty({
    description: 'Origem do lead',
    enum: ['chatbot', 'website', 'whatsapp', 'form', 'referral'],
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiProperty({
    description: 'Metadados adicionais',
    example: {
      selectedUnitName: 'Unidade Centro',
      preferredContactTime: 'manhã',
      howDidYouKnow: 'Instagram',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Tags para categorização',
    example: ['interessado', 'alta-prioridade'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Score de qualificação (0-100). Calculado automaticamente se não fornecido',
    example: 75,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;
}
