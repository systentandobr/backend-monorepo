import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SimulacaoService } from './simulacao.service';
import { Simulacao } from './model/simulacao.schema';

@Controller('simulacoes')
export class SimulacaoController {
  constructor(private readonly simulacaoService: SimulacaoService) { }

  @Post()
  create(@Body() createSimulacaoDto: any): Promise<Simulacao> {
    console.log('createSimulacaoDto :: ', createSimulacaoDto);
    return this.simulacaoService.create(createSimulacaoDto);
  }

  @Put(':id')
  update(
    @Param('id') _id: string,
    @Body() createSimulacaoDto: any,
  ): Promise<Simulacao> {
    console.log('createSimulacaoDto :: ', createSimulacaoDto);
    return this.simulacaoService.update(_id, createSimulacaoDto);
  }

  @Get('temaEspecifico/:temaEspecificoId/user/:userId')
  @Get('temaEspecifico/:temaEspecificoId/user/:userId/filterOpenQuestions/:filterOpenQuestions')
  findByUserId(
    @Param('temaEspecificoId') temaEspecificoId: string,
    @Param('userId') userId: string,
    @Param('filterOpenQuestions') filterOpenQuestions: boolean,
  ): Promise<Simulacao[]> {
    return this.simulacaoService.findByTemaEspecificoUserId(temaEspecificoId, userId, filterOpenQuestions);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Simulacao> {
    return this.simulacaoService.findById(id);
  }

  @Delete()
  deleteAll(): Promise<void> {
    return this.simulacaoService.deleteAll();
  }
}
