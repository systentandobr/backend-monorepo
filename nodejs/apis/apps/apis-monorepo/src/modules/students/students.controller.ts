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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  create(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.studentsService.create(createStudentDto, unitId);
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
}
