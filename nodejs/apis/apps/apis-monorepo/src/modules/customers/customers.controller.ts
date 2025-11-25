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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFiltersDto } from './dto/customer-filters.dto';
import { UnitScope } from '../../decorators/unit-scope.decorator';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';

@ApiTags('customers')
@Controller('customers')
@UnitScope()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.customersService.create(createCustomerDto, unitId);
  }

  @Get()
  findAll(
    @Query() filters: CustomerFiltersDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.customersService.findAll(filters, unitId);
  }

  @Get('stats')
  getStats(@CurrentUser() user: CurrentUserShape) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.customersService.getStats(unitId);
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
    return this.customersService.findOne(id, unitId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new Error('unitId não encontrado no contexto do usuário');
    }
    return this.customersService.update(id, updateCustomerDto, unitId);
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
    return this.customersService.remove(id, unitId);
  }
}

