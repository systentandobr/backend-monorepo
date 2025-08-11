import { Injectable } from '@nestjs/common';
import { Estatistica } from './model/estatistica.schema';
import { EstatisticaDto } from './model/estatistica.dto';
import { EstatisticaRepository } from './repository/estatistica.repository';

@Injectable()
export class EstatisticaService {
  constructor(private readonly repository: EstatisticaRepository) {}

  async create(
    createEstatisticaDto: Partial<EstatisticaDto>,
  ): Promise<Estatistica> {
    const createdEstatistica =
      await this.repository.create(createEstatisticaDto);
    return createdEstatistica;
  }

  async update(
    id: string,
    createEstatisticaDto: Partial<EstatisticaDto>,
  ): Promise<Estatistica> {
    const createdEstatistica = await this.repository.update(
      id,
      createEstatisticaDto,
    );
    return createdEstatistica;
  }

  async findByConcursoId(concursoId: string): Promise<Estatistica[]> {
    return this.repository.findByConcursoId(concursoId);
  }
  async findByConcursoESimulacaoId(
    concursoId: string,
    simulacaoId: string,
  ): Promise<Estatistica[]> {
    return this.repository.findByConcursoESimulacaoId(concursoId, simulacaoId);
  }
  async findByUserId(userId: string): Promise<Estatistica[]> {
    return this.repository.findByUserId(userId);
  }

  async findById(id: string): Promise<Estatistica> {
    return this.repository.findById(id);
  }

  async deleteAll(): Promise<void> {
    await this.repository.deleteAll();
  }
}
