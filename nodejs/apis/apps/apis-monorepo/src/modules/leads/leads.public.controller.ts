import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadSource } from './schemas/lead.schema';

@ApiTags('leads-public')
@Controller('leads/public')
export class LeadsPublicController {
  private readonly logger = new Logger(LeadsPublicController.name);

  // Fallback para Unit ID do sistema se não houver variável de ambiente
  // #BR#ALL#SYSTEM#0001 é um ID fictício de exemplo para HQ
  private readonly DEFAULT_UNIT_ID =
    process.env.DEFAULT_UNIT_ID || '#BR#ALL#SYSTEM#0001';

  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um novo lead publicamente (Landing Page)',
    description:
      'Cria um lead público permitindo especificar unitId, segmento de mercado e tipo de usuário (aluno ou nova academia) para demonstrar interesse genuíno',
  })
  @ApiBody({
    type: CreateLeadDto,
    description: 'Dados do lead a ser criado',
    examples: {
      student: {
        value: {
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '+5511999999999',
          city: 'Natal',
          state: 'RN',
          unitId: 'FR-001',
          marketSegment: 'gym',
          userType: 'student',
          objectives: {
            primary: 'Quero me matricular na academia',
            secondary: ['Melhorar condicionamento físico', 'Perder peso'],
            interestedInFranchise: false,
          },
          metadata: {
            selectedUnitName: 'Unidade Centro',
            preferredContactTime: 'manhã',
            howDidYouKnow: 'Instagram',
          },
        },
        summary: 'Exemplo de lead de aluno interessado',
      },
      franchise: {
        value: {
          name: 'Carlos Oliveira',
          email: 'carlos@academiaexemplo.com',
          phone: '+5511977777777',
          city: 'Recife',
          state: 'PE',
          unitId: null,
          marketSegment: 'gym',
          userType: 'franchise',
          objectives: {
            primary: 'Quero abrir uma nova unidade',
            secondary: ['Expandir negócio', 'Investir em fitness'],
            interestedInFranchise: true,
          },
          metadata: {
            preferredContactTime: 'qualquer horário',
            howDidYouKnow: 'Google',
            franchiseType: 'premium',
            experience: 'Tenho experiência em gestão de academias',
            budget: 'R$ 200.000 - R$ 500.000',
            timeToStart: '3-6 meses',
          },
        },
        summary: 'Exemplo de lead de nova academia interessada',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lead criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            unitId: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            userType: { type: 'string', enum: ['student', 'franchise'] },
            marketSegment: { type: 'string' },
            objectives: { type: 'object' },
            score: { type: 'number' },
          },
        },
        error: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Lead com este email já existe (será atualizado)',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeadDto: CreateLeadDto) {
    this.logger.log(`Recebendo novo lead público: ${createLeadDto.email}`);
    this.logger.log(`  UnitId: ${createLeadDto.unitId || 'não fornecido'}`);
    this.logger.log(`  MarketSegment: ${createLeadDto.marketSegment || 'não fornecido'}`);
    this.logger.log(`  UserType: ${createLeadDto.userType || 'não fornecido'}`);

    // Força a origem como 'website' se não especificado (compatível com enum LeadSource)
    if (!createLeadDto.source) {
      createLeadDto.source = LeadSource.WEBSITE;
    }

    const targetUnitId = createLeadDto.unitId || this.DEFAULT_UNIT_ID;
    return this.leadsService.create(createLeadDto, targetUnitId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um lead publicamente (Onboarding)' })
  @ApiResponse({ status: 200, description: 'Lead atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    this.logger.log(`Atualizando lead público: ${id}`);
    return this.leadsService.update(id, updateLeadDto, this.DEFAULT_UNIT_ID);
  }
}
