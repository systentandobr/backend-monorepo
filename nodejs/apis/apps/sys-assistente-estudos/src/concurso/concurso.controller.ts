import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ConcursoService } from './concurso.service';
import { Concurso } from './model/concurso.schema';

@Controller('concursos')
export class ConcursoController {
  constructor(private readonly concursoService: ConcursoService) { }

  @Post()
  create(@Body() createConcursoDto: any): Promise<Concurso> {
    return this.concursoService.create(createConcursoDto);
  }

  @Get()
  findAll(): Promise<Concurso[]> {
    return this.concursoService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Concurso> {
    return this.concursoService.findById(id);
  }

  @Delete()
  deleteAll(): Promise<void> {
    return this.concursoService.deleteAll();
  }
}
