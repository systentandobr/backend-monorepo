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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFiltersDto } from './dto/lead-response.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';
import { LeadStatus } from './schemas/lead.schema';

@ApiTags('leads')
@Controller('leads')
@UnitScope()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

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

  @Post(':id/conversation')
  @ApiOperation({ summary: 'Create a new conversation for a lead' })
  async createConversation(
    @Param('id') id: string,
    @Body() body: { unitId: string; stage: LeadStatus; customerId?: string },
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.createConversation(id, unitId, user.id, body.customerId, body.stage);
  }

  @Get(':id/conversations')
  @ApiOperation({ summary: 'Get conversations for a lead' })
  async getLeadConversations(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
    @Query('customerId') customerId?: string,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'leads.controller.ts:135',message:'Controller entry',data:{leadId:id,unitId,customerId,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.log('getLeadConversations:: ', {
      unitId,
    })
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.leadsService.getConversations(id, unitId, customerId, user.id);
  }

}

