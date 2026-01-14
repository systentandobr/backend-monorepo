import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentFiltersDto } from './dto/student-filters.dto';
import { StudentResponseDto } from './dto/student-response.dto';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(createStudentDto: CreateStudentDto, unitId: string): Promise<StudentResponseDto> {
    // Verificar se já existe aluno com mesmo email na mesma unidade
    const existing = await this.studentModel.findOne({
      unitId,
      email: createStudentDto.email,
    });

    if (existing) {
      throw new ConflictException('Aluno com este email já existe nesta unidade');
    }

    const student = new this.studentModel({
      ...createStudentDto,
      unitId,
    });

    const saved = await student.save();
    return this.toResponseDto(saved);
  }

  async findAll(filters: StudentFiltersDto, unitId: string): Promise<{
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
      this.studentModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.studentModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map(item => this.toResponseDto(item)),
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

  async update(id: string, updateStudentDto: UpdateStudentDto, unitId: string): Promise<StudentResponseDto> {
    const student = await this.studentModel.findOneAndUpdate(
      { _id: id, unitId },
      { $set: updateStudentDto },
      { new: true },
    ).exec();

    if (!student) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado`);
    }

    return this.toResponseDto(student);
  }

  async remove(id: string, unitId: string): Promise<void> {
    const result = await this.studentModel.deleteOne({ _id: id, unitId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Aluno com ID ${id} não encontrado`);
    }
  }

  private toResponseDto(student: StudentDocument): StudentResponseDto {
    return {
      id: student._id.toString(),
      unitId: student.unitId,
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
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
