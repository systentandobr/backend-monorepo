import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsObject,
  ValidateNested,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GroqModel {
  LLAMA_3_1_70B = 'llama-3.1-70b-versatile',
  LLAMA_3_1_8B = 'llama-3.1-8b-instant',
  MIXTRAL_8X7B = 'mixtral-8x7b-32768',
}

export class GroqChatCompletionDto {
  @ApiProperty({
    description: 'Prompt do usuário',
    example: 'Complete esta descrição de produto...',
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: 'Prompt do sistema (instruções para o modelo)',
  })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional({
    description: 'Modelo a ser usado',
    enum: GroqModel,
    default: GroqModel.LLAMA_3_1_8B,
  })
  @IsOptional()
  @IsEnum(GroqModel)
  model?: GroqModel;

  @ApiPropertyOptional({
    description: 'Temperatura (0-2)',
    default: 0.7,
    minimum: 0,
    maximum: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Número máximo de tokens',
    default: 500,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTokens?: number;

  @ApiPropertyOptional({
    description: 'Usar cache',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  cache?: boolean;
}

export class GroqProductDescriptionDto extends GroqChatCompletionDto {
  @ApiProperty({
    description: 'Texto parcial da descrição',
  })
  @IsString()
  partialText: string;

  @ApiPropertyOptional({ description: 'Nome do produto' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'Categoria do produto' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class GroqShortDescriptionDto {
  @ApiProperty({ description: 'Nome do produto' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({ description: 'Categoria do produto' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: GroqModel })
  @IsOptional()
  @IsEnum(GroqModel)
  model?: GroqModel;
}

export class GroqSuggestTagsDto {
  @ApiProperty({ description: 'Nome do produto' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({ description: 'Descrição do produto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Categoria do produto' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: GroqModel })
  @IsOptional()
  @IsEnum(GroqModel)
  model?: GroqModel;
}

export class GroqSuggestFeaturesDto extends GroqSuggestTagsDto {}

export class GroqSuggestProductNameDto {
  @ApiProperty({ description: 'Descrição do produto' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Categoria do produto' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: GroqModel })
  @IsOptional()
  @IsEnum(GroqModel)
  model?: GroqModel;
}

export class IngredientDto {
  @ApiProperty({ description: 'Nome do ingrediente' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Quantidade' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Unidade (KG, G, L, ML, UN)' })
  @IsString()
  unit: string;
}

export class GroqDishDescriptionDto {
  @ApiProperty({ description: 'Nome do prato' })
  @IsString()
  dishName: string;

  @ApiProperty({
    description: 'Lista de ingredientes',
    type: [IngredientDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @ApiPropertyOptional({ enum: GroqModel })
  @IsOptional()
  @IsEnum(GroqModel)
  model?: GroqModel;
}

export class GroqExerciseSuggestionsDto {
  @ApiProperty({ description: 'Nome do plano de treino' })
  @IsString()
  planName: string;

  @ApiProperty({
    description: 'Lista de exercícios disponíveis',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  availableExercises: string[];

  @ApiPropertyOptional({
    description: 'Gênero alvo',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  targetGender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ enum: GroqModel })
  @IsOptional()
  @IsEnum(GroqModel)
  model?: GroqModel;
}

export class SolarProjectDataDto {
  @ApiPropertyOptional({ description: 'Capacidade total em KW' })
  @IsOptional()
  @IsNumber()
  totalCapacityKW?: number;

  @ApiPropertyOptional({ description: 'Área do terreno em m²' })
  @IsOptional()
  @IsNumber()
  terrainArea?: number;

  @ApiPropertyOptional({ description: 'Localização' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Investimento total' })
  @IsOptional()
  @IsNumber()
  totalInvestment?: number;

  @ApiPropertyOptional({ description: 'Custo atual por KWH' })
  @IsOptional()
  @IsNumber()
  currentCostPerKWH?: number;

  @ApiPropertyOptional({ description: 'Custo da concessionária por KWH' })
  @IsOptional()
  @IsNumber()
  utilityCostPerKWH?: number;
}

export class GroqSolarProjectInsightsDto {
  @ApiProperty({
    description: 'Fase do projeto',
    enum: ['planning', 'licensing', 'procurement', 'installation', 'operation'],
  })
  @IsEnum(['planning', 'licensing', 'procurement', 'installation', 'operation'])
  projectPhase: 'planning' | 'licensing' | 'procurement' | 'installation' | 'operation';

  @ApiPropertyOptional({
    description: 'Dados atuais do projeto',
    type: SolarProjectDataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SolarProjectDataDto)
  currentData?: SolarProjectDataDto;

  @ApiPropertyOptional({ enum: GroqModel })
  @IsOptional()
  @IsEnum(GroqModel)
  model?: GroqModel;
}

export class GroqResponseDto {
  @ApiProperty({ description: 'Resposta gerada' })
  content: string;
}

export class GroqTagsResponseDto {
  @ApiProperty({ description: 'Lista de tags sugeridas', type: [String] })
  tags: string[];
}

export class GroqFeaturesResponseDto {
  @ApiProperty({ description: 'Lista de features sugeridas', type: [String] })
  features: string[];
}

export class GroqExerciseResponseDto {
  @ApiProperty({
    description: 'Lista de exercícios sugeridos',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        muscleGroups: { type: 'array', items: { type: 'string' } },
        sets: { type: 'number' },
        reps: { type: 'string' },
      },
    },
  })
  exercises: Array<{
    name: string;
    muscleGroups?: string[];
    sets?: number;
    reps?: string;
  }>;
}

export class GroqSolarInsightsResponseDto {
  @ApiProperty({ description: 'Recomendações', type: [String] })
  recommendations: string[];

  @ApiProperty({ description: 'Próximos passos', type: [String] })
  nextSteps: string[];

  @ApiPropertyOptional({ description: 'Estimativas de custos' })
  costEstimates?: string;

  @ApiProperty({ description: 'Riscos identificados', type: [String] })
  risks: string[];
}
