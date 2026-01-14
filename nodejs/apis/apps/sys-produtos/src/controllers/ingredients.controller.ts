import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  IngredientsService,
  CreateIngredientDto,
  UpdateIngredientDto,
  AddPurchaseDto,
  AddLossDto,
} from '../services/ingredients.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserShape,
} from '../decorators/current-user.decorator';
import { UnitScope } from '../decorators/unit-scope.decorator';

@Controller('ingredients')
@UseGuards(JwtAuthGuard)
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @UnitScope()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateIngredientDto,
    @CurrentUser() user: any,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('UnitId é obrigatório');
    }

    const ingredient = await this.ingredientsService.create({
      ...createDto,
      unitId,
    });

    return {
      success: true,
      data: ingredient,
    };
  }

  @Get()
  @UnitScope()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
    @CurrentUser() user?: CurrentUserShape,
  ) {
    const unitId = user?.unitId || user?.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('UnitId é obrigatório');
    }

    const ingredients = await this.ingredientsService.findAll(
      unitId,
      includeInactive === 'true',
    );

    return {
      success: true,
      data: ingredients,
    };
  }

  @Get(':id')
  @UnitScope()
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('UnitId é obrigatório');
    }

    const ingredient = await this.ingredientsService.findOne(id, unitId);

    return {
      success: true,
      data: ingredient,
    };
  }

  @Put(':id')
  @UnitScope()
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIngredientDto,
    @CurrentUser() user: any,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('UnitId é obrigatório');
    }

    const ingredient = await this.ingredientsService.update(
      id,
      unitId,
      updateDto,
    );

    return {
      success: true,
      data: ingredient,
    };
  }

  @Delete(':id')
  @UnitScope()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('UnitId é obrigatório');
    }

    await this.ingredientsService.remove(id, unitId);
  }

  @Post(':id/purchases')
  @UnitScope()
  @HttpCode(HttpStatus.OK)
  async addPurchase(
    @Param('id') id: string,
    @Body() purchaseDto: AddPurchaseDto,
    @CurrentUser() user: any,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('UnitId é obrigatório');
    }

    const ingredient = await this.ingredientsService.addPurchase(
      id,
      unitId,
      purchaseDto,
    );

    return {
      success: true,
      data: ingredient,
    };
  }

  @Post(':id/losses')
  @UnitScope()
  @HttpCode(HttpStatus.OK)
  async addLoss(
    @Param('id') id: string,
    @Body() lossDto: AddLossDto,
    @CurrentUser() user: any,
  ) {
    const unitId = user.unitId || user.profile?.unitId;
    if (!unitId) {
      throw new BadRequestException('UnitId é obrigatório');
    }

    const ingredient = await this.ingredientsService.addLoss(
      id,
      unitId,
      lossDto,
    );

    return {
      success: true,
      data: ingredient,
    };
  }
}
