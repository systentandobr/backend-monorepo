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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFiltersDto } from './dto/lead-response.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';

@ApiTags('leads')
@Controller('leads')
@UnitScope()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.create(createLeadDto, unitId);
  }

  @Get()
  findAll(
    @Query() filters: LeadFiltersDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.findAll(filters, unitId);
  }

  @Get('pipeline/stats')
  getPipelineStats(@CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.getPipelineStats(unitId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.findOne(id, unitId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.update(id, updateLeadDto, unitId);
  }

  @Patch(':id/convert')
  convertToCustomer(
    @Param('id') id: string,
    @Body() body: { customerId: string },
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.convertToCustomer(id, unitId, body.customerId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.remove(id, unitId);
  }
}

