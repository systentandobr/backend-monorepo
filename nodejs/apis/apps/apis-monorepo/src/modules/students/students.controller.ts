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
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentFiltersDto } from './dto/student-filters.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import {
  CurrentUser,
  CurrentUserShape,
} from '../../decorators/current-user.decorator';

@ApiTags('students')
@Controller('students')
@UnitScope()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo aluno',
    description:
      'Cria um novo aluno e automaticamente cria o usuário correspondente no sistema de autenticação (SYS-SEGURANÇA)',
  })
  @ApiResponse({
    status: 201,
    description: 'Aluno criado com sucesso',
  })
  @ApiResponse({
    status: 409,
    description: 'Aluno com este email já existe nesta unidade',
  })
  create(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() user: CurrentUserShape,
    @Req() request: any,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }

    const domain = user.domain || user.profile?.domain;
    if (!domain) {
      throw new Error('domain não encontrado no contexto do usuário');
    }

    // Extrair token do header Authorization
    const authHeader = request.headers?.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    return this.studentsService.create(
      createStudentDto,
      unitId,
      token,
      domain,
      user,
    );
  }

  @Get()
  findAll(
    @Query() filters: StudentFiltersDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.studentsService.findAll(filters, unitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.studentsService.findOne(id, unitId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.studentsService.update(id, updateStudentDto, unitId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.studentsService.remove(id, unitId);
  }

  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'Busca aluno pelo userId',
    description:
      'Retorna o aluno relacionado ao userId (ID do usuário no sistema de autenticação)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário no sistema de autenticação (SYS-SEGURANÇA)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Aluno encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Aluno não encontrado para este userId',
  })
  async findByUserId(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    const student = await this.studentsService.findByUserId(userId, unitId);

    if (!student) {
      throw new NotFoundException(
        `Aluno não encontrado para o userId: ${userId}`,
      );
    }

    return {
      success: true,
      data: student,
      error: null,
    };
  }
}
