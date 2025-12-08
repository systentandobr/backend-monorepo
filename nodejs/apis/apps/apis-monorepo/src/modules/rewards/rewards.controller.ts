import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { ProcessRewardDto } from './dto/process-reward.dto';
import { CurrentUser, CurrentUserShape } from '../../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('process')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Processar recompensa (sistema interno)' })
  @ApiResponse({ status: 201, description: 'Recompensa processada' })
  processReward(@Body() processRewardDto: ProcessRewardDto) {
    return this.rewardsService.processReward(processRewardDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Minhas recompensas' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas do usuário' })
  findMyRewards(@CurrentUser() user: CurrentUserShape) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.rewardsService.findAllByUser(user.id, franchiseId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Recompensas de um usuário' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas do usuário' })
  findAllByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.rewardsService.findAllByUser(userId, franchiseId);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Recompensas pendentes (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas pendentes' })
  findPending(@CurrentUser() user: CurrentUserShape) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.rewardsService.findPending(franchiseId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detalhes da recompensa' })
  @ApiResponse({ status: 200, description: 'Recompensa encontrada' })
  @ApiResponse({ status: 404, description: 'Recompensa não encontrada' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    return this.rewardsService.findOne(id, user.id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprovar recompensa' })
  @ApiResponse({ status: 200, description: 'Recompensa aprovada' })
  @ApiResponse({ status: 404, description: 'Recompensa não encontrada' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.rewardsService.approve(id, user.id, franchiseId);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar recompensa' })
  @ApiResponse({ status: 200, description: 'Recompensa cancelada' })
  @ApiResponse({ status: 404, description: 'Recompensa não encontrada' })
  cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: CurrentUserShape,
  ) {
    const franchiseId = user.unitId || user.profile?.unitId;
    return this.rewardsService.cancel(id, user.id, body.reason, franchiseId);
  }
}
