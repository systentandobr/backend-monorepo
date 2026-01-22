import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BioimpedanceMeasurement,
  BioimpedanceMeasurementDocument,
} from './schemas/bioimpedance-measurement.schema';
import { CreateBioimpedanceDto } from './dto/create-bioimpedance.dto';
import { BioimpedanceResponseDto } from './dto/bioimpedance-response.dto';
import { ProgressQueryDto } from './dto/progress-query.dto';
import { Types } from 'mongoose';

@Injectable()
export class BioimpedanceService {
  private readonly logger = new Logger(BioimpedanceService.name);

  constructor(
    @InjectModel(BioimpedanceMeasurement.name)
    private bioimpedanceModel: Model<BioimpedanceMeasurementDocument>,
  ) {}

  /**
   * Converte documento MongoDB para DTO de resposta
   */
  private toResponseDto(
    doc: BioimpedanceMeasurementDocument,
  ): BioimpedanceResponseDto {
    return {
      id: doc._id.toString(),
      studentId: doc.studentId.toString(),
      date: doc.date.toISOString(),
      weight: doc.weight,
      bodyFat: doc.bodyFat,
      muscle: doc.muscle,
      isBestRecord: doc.isBestRecord,
    };
  }

  /**
   * Atualiza o isBestRecord para todas as avaliações de um aluno
   * Apenas a avaliação com menor bodyFat terá isBestRecord = true
   */
  private async updateBestRecord(
    studentId: string,
    unitId: string,
  ): Promise<void> {
    // Buscar todas as avaliações do aluno ordenadas por bodyFat (menor primeiro)
    const measurements = await this.bioimpedanceModel
      .find({
        studentId: new Types.ObjectId(studentId),
        unitId,
      })
      .sort({ bodyFat: 1, date: -1 }) // Menor bodyFat primeiro, depois mais recente
      .exec();

    if (measurements.length === 0) {
      return;
    }

    // A primeira avaliação (menor bodyFat) será o melhor recorde
    const bestMeasurement = measurements[0];

    // Atualizar todas as avaliações
    await Promise.all(
      measurements.map((measurement) => {
        measurement.isBestRecord =
          measurement._id.toString() === bestMeasurement._id.toString();
        return measurement.save();
      }),
    );
  }

  /**
   * Cria uma nova avaliação de bioimpedância
   */
  async create(
    studentId: string,
    createDto: CreateBioimpedanceDto,
    unitId: string,
  ): Promise<BioimpedanceResponseDto> {
    // Validar que a data não é no futuro
    const measurementDate = new Date(createDto.date);
    const now = new Date();
    if (measurementDate > now) {
      throw new BadRequestException('Data não pode ser no futuro');
    }

    // Criar nova avaliação
    const measurement = new this.bioimpedanceModel({
      studentId: new Types.ObjectId(studentId),
      unitId,
      date: measurementDate,
      weight: createDto.weight,
      bodyFat: createDto.bodyFat,
      muscle: createDto.muscle,
      isBestRecord: false, // Será calculado após salvar
    });

    const saved = await measurement.save();

    // Atualizar isBestRecord para todas as avaliações do aluno
    await this.updateBestRecord(studentId, unitId);

    // Buscar novamente para ter o isBestRecord atualizado
    const updated = await this.bioimpedanceModel
      .findById(saved._id)
      .exec();

    if (!updated) {
      throw new NotFoundException('Avaliação não encontrada após criação');
    }

    return this.toResponseDto(updated);
  }

  /**
   * Retorna o histórico de avaliações de um aluno
   */
  async getHistory(
    studentId: string,
    unitId: string,
  ): Promise<BioimpedanceResponseDto[]> {
    const measurements = await this.bioimpedanceModel
      .find({
        studentId: new Types.ObjectId(studentId),
        unitId,
      })
      .sort({ date: -1 }) // Mais recente primeiro
      .exec();

    return measurements.map((measurement) => this.toResponseDto(measurement));
  }

  /**
   * Retorna dados de progresso agrupados por mês
   */
  async getProgress(
    studentId: string,
    unitId: string,
    period: '6 meses' | '1 ano' | 'todo período' = '6 meses',
  ): Promise<{
    period: string;
    title: string;
    weightData: Array<{ month: string; value: number }>;
    bodyFatData: Array<{ month: string; value: number }>;
  }> {
    // Calcular data inicial baseado no período
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '6 meses':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1 ano':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'todo período':
        startDate = new Date(0); // Data inicial
        break;
    }

    // Buscar avaliações no período
    const measurements = await this.bioimpedanceModel
      .find({
        studentId: new Types.ObjectId(studentId),
        unitId,
        date: { $gte: startDate },
      })
      .sort({ date: 1 }) // Mais antiga primeiro
      .exec();

    // Mapear meses em português
    const monthNames = [
      'JAN',
      'FEV',
      'MAR',
      'ABR',
      'MAI',
      'JUN',
      'JUL',
      'AGO',
      'SET',
      'OUT',
      'NOV',
      'DEZ',
    ];

    // Agrupar por mês e calcular médias
    const monthlyData = new Map<
      string,
      { weight: number[]; bodyFat: number[] }
    >();

    measurements.forEach((measurement) => {
      const date = new Date(measurement.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { weight: [], bodyFat: [] });
      }

      const data = monthlyData.get(monthKey)!;
      data.weight.push(measurement.weight);
      data.bodyFat.push(measurement.bodyFat);
    });

    // Converter para arrays ordenados
    const sortedMonths = Array.from(monthlyData.entries()).sort((a, b) => {
      const [yearA, monthA] = a[0].split('-').map(Number);
      const [yearB, monthB] = b[0].split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    const weightData: Array<{ month: string; value: number }> = [];
    const bodyFatData: Array<{ month: string; value: number }> = [];

    sortedMonths.forEach(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthName = monthNames[month];

      // Calcular média
      const avgWeight =
        data.weight.reduce((sum, val) => sum + val, 0) / data.weight.length;
      const avgBodyFat =
        data.bodyFat.reduce((sum, val) => sum + val, 0) / data.bodyFat.length;

      weightData.push({
        month: monthName,
        value: Math.round(avgWeight * 10) / 10, // Arredondar para 1 casa decimal
      });

      bodyFatData.push({
        month: monthName,
        value: Math.round(avgBodyFat * 10) / 10,
      });
    });

    return {
      period,
      title: 'Progresso Galáctico',
      weightData,
      bodyFatData,
    };
  }
}
