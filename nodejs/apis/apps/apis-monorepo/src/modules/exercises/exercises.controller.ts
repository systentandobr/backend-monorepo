import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { GenerateExerciseImagesDto } from './dto/generate-images.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';
import { NanoBananaService } from '../../services/nano-banana.service';
import { Veo3Service } from '../../services/veo3.service';
import { GenerateExerciseVideoDto } from './dto/generate-video.dto';

@ApiTags('exercises')
@Controller('exercises')
@UnitScope()
export class ExercisesController {
  constructor(
    private readonly exercisesService: ExercisesService,
    private readonly nanoBananaService: NanoBananaService,
    private readonly veo3Service: Veo3Service,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createExerciseDto: CreateExerciseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.exercisesService.create(createExerciseDto, unitId);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserShape,
    @Query('search') search?: string,
    @Query('muscleGroup') muscleGroup?: string,
    @Query('equipment') equipment?: string,
    @Query('difficulty') difficulty?: 'beginner' | 'intermediate' | 'advanced',
    @Query('targetGender') targetGender?: 'male' | 'female' | 'other',
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.exercisesService.findAll(
      { search, muscleGroup, equipment, difficulty, targetGender },
      unitId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.exercisesService.findOne(id, unitId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.exercisesService.update(id, updateExerciseDto, unitId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }
    return this.exercisesService.remove(id, unitId);
  }

  @Post('generate-images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera imagens para um exercício usando IA' })
  @ApiResponse({
    status: 200,
    description: 'Imagens geradas com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            images: {
              type: 'array',
              items: { type: 'string' },
              example: [
                '/uploads/exercises/temp-123/image-0-abc123.png',
                '/uploads/exercises/temp-123/image-1-def456.png',
                '/uploads/exercises/temp-123/image-2-ghi789.png',
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na validação ou geração de imagens',
  })
  async generateImages(
    @Body() generateImagesDto: GenerateExerciseImagesDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException(
        'unitId não encontrado no contexto do usuário',
      );
    }

    // Validar dados mínimos
    if (!generateImagesDto.exerciseName || !generateImagesDto.muscleGroups || generateImagesDto.muscleGroups.length === 0) {
      throw new BadRequestException(
        'Nome do exercício e pelo menos um grupo muscular são obrigatórios',
      );
    }

    try {
      const images = await this.exercisesService.generateExerciseImages(
        generateImagesDto.exerciseName,
        generateImagesDto.description,
        generateImagesDto.muscleGroups,
        generateImagesDto.equipment,
        generateImagesDto.targetGender || 'male',
        this.nanoBananaService,
      );

      return {
        success: true,
        data: { images },
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Erro ao gerar imagens: ${error.message}`,
      );
    }
  }

  @Post('generate-video')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera um vídeo de execução para um exercício usando Veo3 IA' })
  async generateVideo(
    @Body() generateVideoDto: GenerateExerciseVideoDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('unitId não encontrado');
    }

    try {
      const videoUrl = await this.exercisesService.generateExerciseVideo(
        generateVideoDto.exerciseName,
        generateVideoDto.description,
        generateVideoDto.muscleGroups,
        generateVideoDto.equipment,
        generateVideoDto.targetGender || 'male',
        this.veo3Service,
      );

      return {
        success: true,
        data: { videoUrl },
      };
    } catch (error: any) {
      throw new BadRequestException(`Erro ao gerar vídeo: ${error.message}`);
    }
  }

  @Get('media')
  @ApiOperation({ summary: 'Lista todas as mídias de exercícios de forma paginada' })
  async findAllMedia(
    @CurrentUser() user: CurrentUserShape,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('unitId não encontrado');
    }

    const { items, total } = await this.exercisesService.findAllMedia(
      unitId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );

    return {
      success: true,
      data: {
        items,
        meta: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    };
  }

  @Get('media/stream/:exerciseId/:filename')
  @ApiOperation({ summary: 'Abre um stream para um arquivo de mídia' })
  async streamMedia(
    @Param('exerciseId') exerciseId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const { stream, stats, mimeType } = await this.exercisesService.getMediaStream(
      exerciseId,
      filename,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
    });

    stream.pipe(res);
  }
}
