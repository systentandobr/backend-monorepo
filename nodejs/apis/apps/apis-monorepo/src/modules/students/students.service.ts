import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Student, StudentDocument } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentFiltersDto } from './dto/student-filters.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { EnvironmentConfig } from '../../config/environment.config';
import { CurrentUserShape } from '../../decorators/current-user.decorator';
import { TrainingPlansService } from '../training-plans/training-plans.service';
import { TemplateLoaderService } from '../training-plans/templates/template-loader.service';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);
  private readonly sysSegurancaUrl = EnvironmentConfig.sysSeguranca.url;

  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private readonly httpService: HttpService,
    private readonly trainingPlansService: TrainingPlansService,
    private readonly templateLoaderService: TemplateLoaderService,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
    unitId: string,
    token: string,
    domain: string,
    currentUser: CurrentUserShape,
  ): Promise<StudentResponseDto> {
    // Verificar se já existe aluno com mesmo email na mesma unidade
    const existing = await this.studentModel.findOne({
      unitId,
      email: createStudentDto.email,
    });

    if (existing) {
      throw new ConflictException(
        'Aluno com este email já existe nesta unidade',
      );
    }

    let userId: string | undefined;

    // Criar usuário no SYS-SEGURANÇA
    try {
      this.logger.log(`📤 [StudentsService] Criando usuário no SYS-SEGURANÇA para aluno: ${createStudentDto.email}`);
      
      // Separar nome em firstName e lastName
      const nameParts = createStudentDto.name.trim().split(' ');
      const firstName = nameParts[0] || createStudentDto.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Gerar senha temporária (o aluno pode alterar depois)
      const tempPassword = this.generateTempPassword();

      // Preparar dados do endereço (usar dados do student ou valores padrão)
      const address = createStudentDto.address || {
        city: 'Natal',
        state: 'RN',
      };

      // Preparar payload para criar usuário no SYS-SEGURANÇA
      const createUserPayload = {
        email: createStudentDto.email,
        username: createStudentDto.email.split('@')[0], // Usar parte antes do @ como username
        password: tempPassword,
        firstName: firstName,
        lastName: lastName,
        country: 'BR',
        state: address.state,
        zipCode: address.zipCode || '59000-000',
        localNumber: address.number || 'S/N',
        unitName: 'Unidade', // Será atualizado com o nome real da unidade se necessário
        address: address.street || address.neighborhood || 'Endereço não informado',
        complement: address.complement || 'N/A',
        neighborhood: address.neighborhood || 'Centro',
        city: address.city,
        latitude: 0, // Valores padrão, podem ser atualizados depois
        longitude: 0,
        domain: domain,
        unitId: unitId,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.sysSegurancaUrl}/api/v1/auth/register`,
          createUserPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
              'x-domain': domain,
            },
            timeout: EnvironmentConfig.sysSeguranca.timeout,
          },
        ),
      );

      const responseData = response.data;

      if (responseData.success === false) {
        this.logger.error('❌ Erro ao criar usuário no SYS-SEGURANÇA:', responseData);
        throw new HttpException(
          {
            message: responseData.message || 'Erro ao criar usuário no sistema de autenticação',
            error: 'Failed to create user',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const createdUser = responseData.user || responseData.data || responseData;
      userId = createdUser.id || createdUser._id;

      this.logger.log(`✅ [StudentsService] Usuário criado no SYS-SEGURANÇA: ${userId}`);
    } catch (error: any) {
      this.logger.error('❌ [StudentsService] Erro ao criar usuário no SYS-SEGURANÇA:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Se o erro for 409 (conflito), o usuário já existe, tentar buscar o userId
      if (error.response?.status === 409) {
        this.logger.warn('⚠️ [StudentsService] Usuário já existe no SYS-SEGURANÇA, tentando buscar...');
        try {
          // Tentar buscar o usuário existente pelo email
          const searchResponse = await firstValueFrom(
            this.httpService.get(
              `${this.sysSegurancaUrl}/api/v1/users`,
              {
                params: {
                  domain: domain,
                  search: createStudentDto.email,
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                  'x-api-key': EnvironmentConfig.sysSeguranca.apiKey,
                  'x-domain': domain,
                },
                timeout: EnvironmentConfig.sysSeguranca.timeout,
              },
            ),
          );

          const users = searchResponse.data?.data || searchResponse.data || [];
          const existingUser = Array.isArray(users) 
            ? users.find((u: any) => u.email === createStudentDto.email)
            : null;

          if (existingUser) {
            userId = existingUser.id || existingUser._id;
            this.logger.log(`✅ [StudentsService] Usuário existente encontrado: ${userId}`);
          }
        } catch (searchError) {
          this.logger.error('❌ [StudentsService] Erro ao buscar usuário existente:', searchError);
          // Continuar sem userId - o student será criado sem relação com user
        }
      } else {
        // Para outros erros, lançar exceção
        throw new HttpException(
          {
            message: error.response?.data?.message || error.message || 'Erro ao criar usuário no sistema de autenticação',
            error: 'Failed to create user',
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // Criar o student com o userId (se disponível)
    const student = new this.studentModel({
      ...createStudentDto,
      unitId,
      userId,
    });

    const saved = await student.save();
    this.logger.log(`✅ [StudentsService] Aluno criado com sucesso: ${saved._id.toString()}`);
    
    // Criar plano de treino automaticamente após criar o estudante
    await this.createDefaultTrainingPlan(saved, unitId);

    return this.toResponseDto(saved);
  }

  /**
   * Cria um plano de treino padrão (template ABC) para o estudante recém-criado
   */
  private async createDefaultTrainingPlan(
    student: StudentDocument,
    unitId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `📋 [StudentsService] Criando plano de treino padrão para estudante: ${student._id.toString()} (${student.name}), gênero: ${student.gender}`,
      );

      // Buscar template baseado no gênero do estudante
      const templateDto = await this.templateLoaderService.getTemplateAsCreateDto(
        student.gender,
        student._id.toString(),
        student.name,
      );

      if (!templateDto) {
        this.logger.warn(
          `⚠️ [StudentsService] Template não encontrado para criar plano padrão. Estudante: ${student._id.toString()}, gênero: ${student.gender}`,
        );
        return;
      }

      // Log para verificar quantos dias estão no templateDto antes de criar
      const daysCount = templateDto.weeklySchedule?.length || 0;
      const daysOfWeek = (templateDto.weeklySchedule || []).map(d => d.dayOfWeek).sort((a, b) => a - b);
      this.logger.log(
        `📋 [StudentsService] TemplateDto preparado com ${daysCount} dias na semana. Dias: [${daysOfWeek.join(', ')}]`,
      );

      // Criar o plano de treino usando o template
      const trainingPlan = await this.trainingPlansService.create(
        templateDto,
        unitId,
      );

      // Log final para verificar quantos dias foram salvos
      const finalDaysCount = trainingPlan.weeklySchedule?.length || 0;
      this.logger.log(
        `✅ [StudentsService] Plano de treino criado com sucesso para estudante ${student._id.toString()}. Plano ID: ${trainingPlan.id}, ${finalDaysCount} dias na semana`,
      );
    } catch (error) {
      // Logar erro mas não impedir a criação do estudante
      this.logger.error(
        `❌ [StudentsService] Erro ao criar plano de treino padrão para estudante ${student._id.toString()}:`,
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      // Não lançar exceção para não impedir a criação do estudante
    }
  }

  /**
   * Gera uma senha temporária para o aluno
   */
  private generateTempPassword(): string {
    // Gerar senha aleatória de 8 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async findAll(
    filters: StudentFiltersDto,
    unitId: string,
  ): Promise<{
    data: StudentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = { unitId };

    // Aplicar filtros
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.subscriptionStatus) {
      query['subscription.status'] = filters.subscriptionStatus;
    }

    if (filters.paymentStatus) {
      query['subscription.paymentStatus'] = filters.paymentStatus;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.studentModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.studentModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map((item) => this.toResponseDto(item)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, unitId: string): Promise<StudentResponseDto> {
    const student = await this.studentModel.findOne({ _id: id, unitId }).exec();
    if (!student) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado`);
    }
    return this.toResponseDto(student);
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    unitId: string,
  ): Promise<StudentResponseDto> {
    const student = await this.studentModel
      .findOneAndUpdate(
        { _id: id, unitId },
        { $set: updateStudentDto },
        { new: true },
      )
      .exec();

    if (!student) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado`);
    }

    return this.toResponseDto(student);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.studentModel
      .deleteOne({ _id: id, unitId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado`);
    }
  }

  /**
   * Busca um aluno pelo userId (ID do usuário no sistema de autenticação)
   */
  async findByUserId(userId: string, unitId?: string): Promise<StudentResponseDto | null> {
    const query: any = { userId };
    if (unitId) {
      query.unitId = unitId;
    }

    const student = await this.studentModel.findOne(query).exec();
    if (!student) {
      return null;
    }

    return this.toResponseDto(student);
  }

  private toResponseDto(student: StudentDocument): StudentResponseDto {
    return {
      id: student._id.toString(),
      unitId: student.unitId,
      userId: student.userId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      cpf: student.cpf,
      birthDate: student.birthDate,
      gender: student.gender,
      address: student.address,
      emergencyContact: student.emergencyContact,
      healthInfo: student.healthInfo,
      subscription: student.subscription,
      isActive: student.isActive,
      teamId: student.teamId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
