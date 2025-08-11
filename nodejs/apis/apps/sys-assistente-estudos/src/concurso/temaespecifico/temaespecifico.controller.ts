import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TemaespecificoService } from './temaespecifico.service';
import { TemaEspecifico } from './model/temaEspecifico.schema';

@Controller('temas-especificos')
export class TemaespecificoController {
  constructor(private readonly temaEspecificoService: TemaespecificoService) { }

  @Post()
  create(@Body() createTemaEspecificoDto: any): Promise<TemaEspecifico> {
    return this.temaEspecificoService.create(createTemaEspecificoDto);
  }

  @Get()
  findAll(): Promise<TemaEspecifico[]> {
    return this.temaEspecificoService.findAll();
  }

  @Get('concurso/:concursoId/user/:userId')
  @Get('concurso/:concursoId/user/:userId/filterOpenQuestions/:filterOpenQuestions')
  findByUserId(
    @Param('concursoId') concursoId: string,
    @Param('userId') userId: string,
    @Param('filterOpenQuestions') filterOpenQuestions: boolean,
  ): Promise<TemaEspecifico[]> {
    return this.temaEspecificoService.findByTemaEspecificoUserId(concursoId, userId, filterOpenQuestions);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<TemaEspecifico> {
    return this.temaEspecificoService.findById(id);
  }

  @Delete()
  deleteAll(): Promise<void> {
    return this.temaEspecificoService.deleteAll();
  }

}
