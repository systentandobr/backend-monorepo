import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RagInstructionsService } from './rag-instructions.service';
import { CreateRagInstructionDto } from './dto/create-rag-instruction.dto';
import { UpdateRagInstructionDto } from './dto/update-rag-instruction.dto';
import { RagInstructionResponseDto } from './dto/rag-instruction-response.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';

@ApiTags('rag-instructions')
@Controller('rag-instructions')
@UnitScope()
export class RagInstructionsController {
  constructor(private readonly ragInstructionsService: RagInstructionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar instruções RAG para uma unidade' })
  @ApiResponse({ status: 201, type: RagInstructionResponseDto })
  create(
    @Body() createDto: CreateRagInstructionDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.create(createDto, unitId);
  }

  @Get(':unitId')
  @ApiOperation({ summary: 'Buscar instruções RAG por unidade' })
  @ApiResponse({ status: 200, type: RagInstructionResponseDto })
  findByUnitId(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const userUnitId = user.unitId || user.profile?.unitId;
    if (!userUnitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    // Validar que o usuário está acessando sua própria unidade
    if (unitId !== userUnitId) {
      throw new Error('Acesso negado: unitId não corresponde ao usuário');
    }
    return this.ragInstructionsService.findByUnitId(unitId);
  }

  @Get(':unitId/context')
  @ApiOperation({ summary: 'Obter contexto adicional das instruções RAG' })
  @ApiResponse({ status: 200 })
  getContext(
    @Param('unitId') unitId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const userUnitId = user.unitId || user.profile?.unitId;
    if (!userUnitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    if (unitId !== userUnitId) {
      throw new Error('Acesso negado: unitId não corresponde ao usuário');
    }
    return this.ragInstructionsService.getContext(unitId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as instruções RAG da unidade' })
  @ApiResponse({ status: 200, type: [RagInstructionResponseDto] })
  findAll(@CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.findAll(unitId);
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Buscar instrução RAG por ID' })
  @ApiResponse({ status: 200, type: RagInstructionResponseDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.findOne(id, unitId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar instruções RAG' })
  @ApiResponse({ status: 200, type: RagInstructionResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRagInstructionDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.update(id, updateDto, unitId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover instruções RAG' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.remove(id, unitId);
  }
}
