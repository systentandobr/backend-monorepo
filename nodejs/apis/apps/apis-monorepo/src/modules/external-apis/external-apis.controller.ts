import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ExternalApisService } from './external-apis.service';
import {
  GoogleMapsScriptUrlDto,
  GeocodeRequestDto,
  GeocodeResponseDto,
  PlacesAutocompleteRequestDto,
  PlacesAutocompleteResponseDto,
} from './dto/google-maps.dto';
import {
  GroqChatCompletionDto,
  GroqProductDescriptionDto,
  GroqShortDescriptionDto,
  GroqSuggestTagsDto,
  GroqSuggestFeaturesDto,
  GroqSuggestProductNameDto,
  GroqDishDescriptionDto,
  GroqExerciseSuggestionsDto,
  GroqSolarProjectInsightsDto,
  GroqResponseDto,
  GroqTagsResponseDto,
  GroqFeaturesResponseDto,
  GroqExerciseResponseDto,
  GroqSolarInsightsResponseDto,
} from './dto/groq.dto';

@ApiTags('external-apis')
@Controller('external-apis')
export class ExternalApisController {
  constructor(private readonly externalApisService: ExternalApisService) {}

  // ==================== Google Maps Endpoints ====================

  @Get('google-maps/script-url')
  @ApiOperation({
    summary: 'Obtém URL do script do Google Maps com API key protegida',
    description:
      'Retorna a URL do script do Google Maps JavaScript API com a chave de API protegida no backend.',
  })
  @ApiResponse({
    status: 200,
    description: 'URL do script retornada com sucesso',
    type: GoogleMapsScriptUrlDto,
  })
  @ApiResponse({
    status: 400,
    description: 'API key não configurada no servidor',
  })
  getGoogleMapsScriptUrl(): GoogleMapsScriptUrlDto {
    return this.externalApisService.getGoogleMapsScriptUrl();
  }

  @Post('google-maps/geocode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Geocodifica um endereço',
    description: 'Converte um endereço em coordenadas geográficas usando Google Maps API.',
  })
  @ApiResponse({
    status: 200,
    description: 'Endereço geocodificado com sucesso',
    type: GeocodeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Endereço não encontrado ou API key não configurada',
  })
  async geocodeAddress(
    @Body() request: GeocodeRequestDto,
  ): Promise<GeocodeResponseDto> {
    return this.externalApisService.geocodeAddress(request);
  }

  @Post('google-maps/places-autocomplete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autocomplete de lugares do Google Maps',
    description:
      'Retorna sugestões de lugares baseadas em texto de entrada usando Google Places API.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugestões retornadas com sucesso',
    type: PlacesAutocompleteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'API key não configurada',
  })
  async placesAutocomplete(
    @Body() request: PlacesAutocompleteRequestDto,
  ): Promise<PlacesAutocompleteResponseDto> {
    return this.externalApisService.placesAutocomplete(request);
  }

  // ==================== Groq API Endpoints ====================

  @Post('groq/chat/completions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat completion genérico do Groq',
    description:
      'Proxy para a API de chat completions do Groq. Permite fazer requisições genéricas ao modelo de IA.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resposta gerada com sucesso',
    type: GroqResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'API key não configurada ou requisição inválida',
  })
  async groqChatCompletion(
    @Body() dto: GroqChatCompletionDto,
  ): Promise<GroqResponseDto> {
    return this.externalApisService.groqChatCompletion(dto);
  }

  @Post('groq/product-description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera descrição de produto',
    description:
      'Gera ou completa descrição de produto usando IA do Groq.',
  })
  @ApiResponse({
    status: 200,
    description: 'Descrição gerada com sucesso',
    type: GroqResponseDto,
  })
  async generateProductDescription(
    @Body() dto: GroqProductDescriptionDto,
  ): Promise<GroqResponseDto> {
    return this.externalApisService.generateProductDescription(dto);
  }

  @Post('groq/short-description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera descrição curta de produto',
    description: 'Gera descrição curta (máximo 150 caracteres) para produto.',
  })
  @ApiResponse({
    status: 200,
    type: GroqResponseDto,
  })
  async generateShortDescription(
    @Body() dto: GroqShortDescriptionDto,
  ): Promise<GroqResponseDto> {
    return this.externalApisService.generateShortDescription(dto);
  }

  @Post('groq/suggest-tags')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sugere tags para produto',
    description: 'Sugere tags relevantes para SEO e categorização de produto.',
  })
  @ApiResponse({
    status: 200,
    type: GroqTagsResponseDto,
  })
  async suggestTags(@Body() dto: GroqSuggestTagsDto): Promise<GroqTagsResponseDto> {
    return this.externalApisService.suggestTags(dto);
  }

  @Post('groq/suggest-features')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sugere features para produto',
    description: 'Sugere características principais de um produto.',
  })
  @ApiResponse({
    status: 200,
    type: GroqFeaturesResponseDto,
  })
  async suggestFeatures(
    @Body() dto: GroqSuggestFeaturesDto,
  ): Promise<GroqFeaturesResponseDto> {
    return this.externalApisService.suggestFeatures(dto);
  }

  @Post('groq/suggest-product-name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sugere nome de produto',
    description: 'Sugere nome de produto baseado em descrição.',
  })
  @ApiResponse({
    status: 200,
    type: GroqResponseDto,
  })
  async suggestProductName(
    @Body() dto: GroqSuggestProductNameDto,
  ): Promise<GroqResponseDto> {
    return this.externalApisService.suggestProductName(dto);
  }

  @Post('groq/dish-description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera descrição de prato',
    description: 'Gera descrição atrativa de prato baseada em ingredientes.',
  })
  @ApiResponse({
    status: 200,
    type: GroqResponseDto,
  })
  async generateDishDescription(
    @Body() dto: GroqDishDescriptionDto,
  ): Promise<GroqResponseDto> {
    return this.externalApisService.generateDishDescription(dto);
  }

  @Post('groq/exercise-suggestions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sugere exercícios para plano de treino',
    description:
      'Sugere exercícios específicos para um plano de treino baseado em exercícios disponíveis.',
  })
  @ApiResponse({
    status: 200,
    type: GroqExerciseResponseDto,
  })
  async suggestExercisesForPlan(
    @Body() dto: GroqExerciseSuggestionsDto,
  ): Promise<GroqExerciseResponseDto> {
    return this.externalApisService.suggestExercisesForPlan(dto);
  }

  @Post('groq/solar-project-insights')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera insights de projeto solar',
    description:
      'Gera recomendações, próximos passos, estimativas de custos e análise de riscos para projetos de energia solar.',
  })
  @ApiResponse({
    status: 200,
    type: GroqSolarInsightsResponseDto,
  })
  async suggestSolarProjectInsights(
    @Body() dto: GroqSolarProjectInsightsDto,
  ): Promise<GroqSolarInsightsResponseDto> {
    return this.externalApisService.suggestSolarProjectInsights(dto);
  }
}
