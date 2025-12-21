import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';

@ApiTags('settings')
@Controller('settings')
@UnitScope()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar ou atualizar configurações para uma unidade' })
  create(
    @Body() createSettingDto: CreateSettingDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    // Garante que o unitId do DTO seja o mesmo do usuário
    createSettingDto.unitId = unitId;
    return this.settingsService.createOrUpdate(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar configurações da unidade do usuário' })
  findOne(@CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.settingsService.findOne(unitId);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar configurações da unidade do usuário' })
  update(
    @Body() updateSettingDto: UpdateSettingDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.settingsService.update(unitId, updateSettingDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover configurações da unidade do usuário' })
  remove(@CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.settingsService.remove(unitId);
  }

  @Get('by-unit/:unitId')
  @ApiOperation({ summary: 'Buscar configurações por unitId (admin)' })
  findByUnitId(@Param('unitId') unitId: string) {
    return this.settingsService.findOne(unitId);
  }
}

