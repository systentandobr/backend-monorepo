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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@ApiTags('leads-public')
@Controller('leads/public')
export class LeadsPublicController {
    private readonly logger = new Logger(LeadsPublicController.name);

    // Fallback para Unit ID do sistema se não houver variável de ambiente
    // #BR#SP#SYSTEM#0001 é um ID fictício de exemplo para HQ
    private readonly DEFAULT_UNIT_ID = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';

    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar um novo lead publicamente (Landing Page)' })
    @ApiResponse({ status: 201, description: 'Lead criado com sucesso.' })
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createLeadDto: any) { // Usando any para permitir unitId extra se necessário, ou extender o DTO
        this.logger.log(`Recebendo novo lead público: ${createLeadDto.email}`);

        // Força a origem como 'website' ou 'referral' se não especificado
        if (!createLeadDto.source) {
            // @ts-ignore
            createLeadDto.source = 'website';
        }

        const targetUnitId = createLeadDto.unitId || this.DEFAULT_UNIT_ID;
        return this.leadsService.create(createLeadDto, targetUnitId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar um lead publicamente (Onboarding)' })
    @ApiResponse({ status: 200, description: 'Lead atualizado com sucesso.' })
    update(
        @Param('id') id: string,
        @Body() updateLeadDto: UpdateLeadDto,
    ) {
        this.logger.log(`Atualizando lead público: ${id}`);
        return this.leadsService.update(id, updateLeadDto, this.DEFAULT_UNIT_ID);
    }
}
