import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserShape } from '../decorators/current-user.decorator';
import { NavigationService } from '../services/navigation.service';
import { VisitSource } from '../schemas/navigation.schema';

@ApiTags('navigation')
@ApiBearerAuth()
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('track/product')
  @ApiOperation({ summary: 'Rastrear visita de produto' })
  @ApiResponse({ status: 201, description: 'Visita rastreada com sucesso' })
  trackProductVisit(
    @CurrentUser() user: CurrentUserShape,
    @Body()
    body: {
      productId: string;
      source: VisitSource;
      interactions?: any;
      metadata?: { referrer?: string; searchTerm?: string; category?: string };
      duration?: number;
    },
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.navigationService.trackProductVisit(
      user.unitId as string | undefined,
      user.id,
      body.productId,
      body.source,
      body.interactions,
      body.metadata,
      body.duration,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('visited-products')
  @ApiOperation({ summary: 'Obter produtos visitados' })
  @ApiResponse({ status: 200, description: 'Produtos visitados encontrados' })
  getVisitedProducts(@CurrentUser() user: CurrentUserShape, @Query('limit') limit?: number) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    const limitNum = limit ? parseInt(limit.toString(), 10) : 10;
    return this.navigationService.getVisitedProducts(
      user.unitId as string | undefined,
      user.id,
      limitNum,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('search')
  @ApiOperation({ summary: 'Salvar busca' })
  @ApiResponse({ status: 201, description: 'Busca salva com sucesso' })
  saveSearch(
    @CurrentUser() user: CurrentUserShape,
    @Body()
    body: {
      sessionId: string;
      query: string;
      resultsCount: number;
      filters?: any;
      results?: any[];
      metadata?: any;
    },
  ) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    return this.navigationService.saveSearch(
      user.unitId as string | undefined,
      user.id,
      body.sessionId,
      body.query,
      body.resultsCount,
      body.filters,
      body.results,
      body.metadata,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiOperation({ summary: 'Obter histórico de navegação' })
  @ApiResponse({ status: 200, description: 'Histórico encontrado' })
  getNavigationHistory(@CurrentUser() user: CurrentUserShape, @Query('limit') limit?: number) {
    if (!user.id) {
      throw new Error('Usuário não autenticado');
    }
    const limitNum = limit ? parseInt(limit.toString(), 10) : 10;
    return this.navigationService.getSearchHistory(
      user.unitId as string | undefined,
      user.id,
      limitNum,
    );
  }
}


