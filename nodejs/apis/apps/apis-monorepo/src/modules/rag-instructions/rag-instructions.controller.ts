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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import type { Multer } from 'multer';
import { RagInstructionsService } from './rag-instructions.service';
import { CreateRagInstructionDto } from './dto/create-rag-instruction.dto';
import { UpdateRagInstructionDto } from './dto/update-rag-instruction.dto';
import { RagInstructionResponseDto } from './dto/rag-instruction-response.dto';
import { CreateRagInstructionFromTextDto } from './dto/create-rag-instruction-from-text.dto';
import { CreateRagInstructionFromUrlDto } from './dto/create-rag-instruction-from-url.dto';
import { CreateRagInstructionFromPdfDto } from './dto/create-rag-instruction-from-pdf.dto';
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

  @Post('from-text')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar instruções RAG a partir de texto' })
  @ApiResponse({ status: 201, type: RagInstructionResponseDto })
  createFromText(
    @Body() createDto: CreateRagInstructionFromTextDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.createFromText(createDto, unitId);
  }

  @Post('from-url')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar instruções RAG a partir de URL' })
  @ApiResponse({ status: 201, type: RagInstructionResponseDto })
  createFromUrl(
    @Body() createDto: CreateRagInstructionFromUrlDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.createFromUrl(createDto, unitId);
  }

  @Post('from-pdf')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos PDF são permitidos'), false);
      }
    },
  }))
  @ApiOperation({ summary: 'Criar instruções RAG a partir de PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: RagInstructionResponseDto })
  createFromPdf(
    @UploadedFile() file: Multer.File,
    @Body() createDto: CreateRagInstructionFromPdfDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    if (!file) {
      throw new Error('Arquivo PDF é obrigatório');
    }
    return this.ragInstructionsService.createFromPdf(createDto, file, unitId);
  }

  @Post(':id/reindex')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reindexar instrução RAG no sistema de busca' })
  @ApiResponse({ status: 200, type: RagInstructionResponseDto })
  reindex(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.ragInstructionsService.reindex(id, unitId);
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
