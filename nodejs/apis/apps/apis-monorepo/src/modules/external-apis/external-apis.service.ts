import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
  GroqModel,
} from './dto/groq.dto';

@Injectable()
export class ExternalApisService {
  private readonly logger = new Logger(ExternalApisService.name);
  private readonly googleMapsApiKey: string;
  private readonly groqApiKey: string;
  private readonly groqBaseUrl = 'https://api.groq.com/openai/v1';
  private readonly googleMapsBaseUrl = 'https://maps.googleapis.com/maps/api';
  private readonly rateLimitDelay = 100; // ms entre requisições
  private lastGroqRequestTime = 0;

  constructor(private readonly httpService: HttpService) {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.groqApiKey = process.env.GROQ_API_KEY || '';

    if (!this.googleMapsApiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY não configurada. Funcionalidades do Google Maps estarão desabilitadas.',
      );
    }

    if (!this.groqApiKey) {
      this.logger.warn(
        'GROQ_API_KEY não configurada. Funcionalidades de IA estarão desabilitadas.',
      );
    }
  }

  // ==================== Google Maps ====================

  /**
   * Retorna a URL do script do Google Maps com API key protegida
   * Inclui bibliotecas necessárias: places para autocomplete
   * Usa callback para garantir que está totalmente carregado antes de usar
   */
  getGoogleMapsScriptUrl(): GoogleMapsScriptUrlDto {
    if (!this.googleMapsApiKey) {
      throw new BadRequestException(
        'Google Maps API key não configurada no servidor',
      );
    }

    // Incluir biblioteca places para autocomplete funcionar
    // Removendo loading=async para usar carregamento tradicional mais confiável
    // O callback será adicionado no frontend quando necessário
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;

    return { scriptUrl };
  }

  /**
   * Geocodifica um endereço
   */
  async geocodeAddress(
    request: GeocodeRequestDto,
  ): Promise<GeocodeResponseDto> {
    if (!this.googleMapsApiKey) {
      throw new BadRequestException(
        'Google Maps API key não configurada no servidor',
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.googleMapsBaseUrl}/geocode/json`, {
          params: {
            address: request.address,
            key: this.googleMapsApiKey,
          },
        }),
      );

      const results = response.data.results;
      if (!results || results.length === 0) {
        throw new BadRequestException('Endereço não encontrado');
      }

      const location = results[0].geometry.location;
      const addressComponents = results[0].address_components;

      let city: string | undefined;
      let state: string | undefined;
      let zipCode: string | undefined;

      addressComponents.forEach((component: any) => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
        if (component.types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: results[0].formatted_address,
        city,
        state,
        zipCode,
      };
    } catch (error: any) {
      this.logger.error('Erro ao geocodificar endereço:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao geocodificar endereço',
      );
    }
  }

  /**
   * Autocomplete de lugares do Google Maps
   */
  async placesAutocomplete(
    request: PlacesAutocompleteRequestDto,
  ): Promise<PlacesAutocompleteResponseDto> {
    if (!this.googleMapsApiKey) {
      throw new BadRequestException(
        'Google Maps API key não configurada no servidor',
      );
    }

    try {
      const params: any = {
        input: request.input,
        key: this.googleMapsApiKey,
      };

      if (request.country) {
        params.components = `country:${request.country}`;
      }

      if (request.lat !== undefined && request.lng !== undefined) {
        params.location = `${request.lat},${request.lng}`;
        params.radius = 50000; // 50km
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.googleMapsBaseUrl}/place/autocomplete/json`,
          { params },
        ),
      );

      const predictions = (response.data.predictions || []).map(
        (pred: any) => ({
          placeId: pred.place_id,
          description: pred.description,
          matchedSubstrings: pred.matched_substrings,
        }),
      );

      return { predictions };
    } catch (error: any) {
      this.logger.error('Erro ao buscar autocomplete:', error);
      throw new InternalServerErrorException(
        'Erro ao buscar sugestões de lugares',
      );
    }
  }

  // ==================== Groq API ====================

  /**
   * Aguarda o rate limit antes de fazer requisição
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastGroqRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest),
      );
    }
    this.lastGroqRequestTime = Date.now();
  }

  /**
   * Faz requisição para a API do Groq
   */
  private async makeGroqRequest(
    prompt: string,
    systemPrompt?: string,
    options: {
      model?: GroqModel;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ): Promise<string> {
    if (!this.groqApiKey) {
      throw new BadRequestException('API key do Groq não configurada');
    }

    await this.waitForRateLimit();

    const model = options.model || GroqModel.LLAMA_3_1_8B;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 500;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.groqBaseUrl}/chat/completions`,
          {
            model,
            messages: [
              ...(systemPrompt
                ? [{ role: 'system', content: systemPrompt }]
                : []),
              { role: 'user', content: prompt },
            ],
            temperature,
            max_tokens: maxTokens,
          },
          {
            headers: {
              Authorization: `Bearer ${this.groqApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error: any) {
      this.logger.error('Erro ao chamar Groq API:', error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        'Erro ao gerar resposta';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * Chat completion genérico
   */
  async groqChatCompletion(
    dto: GroqChatCompletionDto,
  ): Promise<GroqResponseDto> {
    const content = await this.makeGroqRequest(
      dto.prompt,
      dto.systemPrompt,
      {
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      },
    );

    return { content };
  }

  /**
   * Gera descrição de produto
   */
  async generateProductDescription(
    dto: GroqProductDescriptionDto,
  ): Promise<GroqResponseDto> {
    const systemPrompt = `Você é um assistente especializado em criar descrições de produtos para e-commerce. 
Crie descrições claras, atrativas e informativas em português brasileiro. 
Mantenha o tom profissional mas acessível.`;

    const prompt = `Complete a descrição do produto começando com: "${dto.partialText}"

${dto.productName ? `Nome do produto: ${dto.productName}` : ''}
${dto.category ? `Categoria: ${dto.category}` : ''}

Continue a descrição de forma natural e completa, mantendo o contexto já iniciado.`;

    const content = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens || 300,
    });

    return { content };
  }

  /**
   * Gera descrição curta de produto
   */
  async generateShortDescription(
    dto: GroqShortDescriptionDto,
  ): Promise<GroqResponseDto> {
    const systemPrompt = `Você é um assistente especializado em criar descrições curtas de produtos. 
Crie descrições concisas (máximo 150 caracteres) em português brasileiro, destacando os principais benefícios.`;

    const prompt = `Crie uma descrição curta e atrativa para o produto:
Nome: ${dto.productName}
${dto.category ? `Categoria: ${dto.category}` : ''}

Descrição curta (máximo 150 caracteres):`;

    const content = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      maxTokens: 100,
    });

    return { content };
  }

  /**
   * Sugere tags para produto
   */
  async suggestTags(dto: GroqSuggestTagsDto): Promise<GroqTagsResponseDto> {
    const systemPrompt = `Você é um assistente especializado em SEO e categorização de produtos. 
Sugira tags relevantes em português brasileiro para produtos de e-commerce. 
Retorne apenas as tags separadas por vírgula, sem explicações.`;

    const prompt = `Sugira 5-10 tags relevantes para o produto:
Nome: ${dto.productName}
${dto.description ? `Descrição: ${dto.description}` : ''}
${dto.category ? `Categoria: ${dto.category}` : ''}

Tags (separadas por vírgula):`;

    const result = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      maxTokens: 150,
    });

    const tags = result
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 10);

    return { tags };
  }

  /**
   * Sugere features para produto
   */
  async suggestFeatures(
    dto: GroqSuggestFeaturesDto,
  ): Promise<GroqFeaturesResponseDto> {
    const systemPrompt = `Você é um assistente especializado em identificar características de produtos. 
Sugira features relevantes em português brasileiro. 
Retorne apenas as features, uma por linha, sem numeração ou marcadores.`;

    const prompt = `Sugira 5-8 características principais para o produto:
Nome: ${dto.productName}
${dto.description ? `Descrição: ${dto.description}` : ''}
${dto.category ? `Categoria: ${dto.category}` : ''}

Características (uma por linha):`;

    const result = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      maxTokens: 200,
    });

    const features = result
      .split('\n')
      .map((feature) => feature.trim().replace(/^[-•*]\s*/, ''))
      .filter((feature) => feature.length > 0)
      .slice(0, 8);

    return { features };
  }

  /**
   * Sugere nome de produto
   */
  async suggestProductName(
    dto: GroqSuggestProductNameDto,
  ): Promise<GroqResponseDto> {
    const systemPrompt = `Você é um assistente especializado em criar nomes de produtos para e-commerce. 
Crie nomes claros, atrativos e descritivos em português brasileiro.`;

    const prompt = `Sugira um nome de produto baseado em:
${dto.description}
${dto.category ? `Categoria: ${dto.category}` : ''}

Nome do produto:`;

    const content = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      maxTokens: 50,
    });

    return { content };
  }

  /**
   * Gera descrição de prato
   */
  async generateDishDescription(
    dto: GroqDishDescriptionDto,
  ): Promise<GroqResponseDto> {
    const systemPrompt = `Você é um chef especializado em criar descrições de pratos para cardápios de restaurantes. 
Crie descrições apetitosas e detalhadas em português brasileiro, destacando os ingredientes principais e o método de preparo quando relevante.`;

    const ingredientsList = dto.ingredients
      .map((ing) => `${ing.name} (${ing.quantity} ${ing.unit})`)
      .join(', ');

    const prompt = `Crie uma descrição atrativa para o prato "${dto.dishName}" contendo os seguintes ingredientes:
${ingredientsList}

Descrição do prato:`;

    const content = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      maxTokens: 300,
    });

    return { content };
  }

  /**
   * Sugere exercícios para plano de treino
   */
  async suggestExercisesForPlan(
    dto: GroqExerciseSuggestionsDto,
  ): Promise<GroqExerciseResponseDto> {
    const systemPrompt = `Você é um especialista em prescrição de exercícios. 
Sugira exercícios específicos para planos de treino em português brasileiro.
Retorne uma lista JSON válida com exercícios.`;

    const genderText = dto.targetGender
      ? `Gênero alvo: ${
          dto.targetGender === 'male'
            ? 'Masculino'
            : dto.targetGender === 'female'
              ? 'Feminino'
              : 'Outro'
        }`
      : '';

    const prompt = `Para o plano de treino "${dto.planName}", sugira pelo menos 6 exercícios usando apenas estes exercícios disponíveis:
${dto.availableExercises.join(', ')}

${genderText}

Para cada exercício, forneça:
- Nome do exercício (deve estar na lista de disponíveis)
- Grupos musculares trabalhados (opcional)
- Séries sugeridas (opcional)
- Repetições sugeridas (opcional)

Formato JSON:
[
  {"name": "Nome do exercício", "muscleGroups": ["grupo1", "grupo2"], "sets": 3, "reps": "10-12"}
]`;

    const result = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      maxTokens: 500,
    });

    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const exercises = parsed.slice(0, 10).map((item: any) => ({
          name: item.name || '',
          muscleGroups: item.muscleGroups || [],
          sets: item.sets || 3,
          reps: item.reps || '10-12',
        }));
        return { exercises };
      }
    } catch (error) {
      this.logger.warn('Erro ao parsear JSON de exercícios:', error);
    }

    return { exercises: [] };
  }

  /**
   * Gera insights de projeto solar
   */
  async suggestSolarProjectInsights(
    dto: GroqSolarProjectInsightsDto,
  ): Promise<GroqSolarInsightsResponseDto> {
    const systemPrompt = `Você é um especialista em projetos de energia solar e análise de viabilidade de usinas solares.
Forneça recomendações práticas, próximos passos, estimativas de custos e análise de riscos em português brasileiro.
Seja objetivo, técnico e baseado em dados reais do mercado brasileiro.`;

    const phaseDescriptions = {
      planning: 'Planejamento e análise de viabilidade',
      licensing: 'Licenciamento e aprovações regulatórias',
      procurement: 'Compra de terreno e equipamentos',
      installation: 'Instalação e conexão à rede',
      operation: 'Operação e manutenção',
    };

    const dataContext = dto.currentData
      ? `
Dados do projeto:
${dto.currentData.totalCapacityKW ? `- Capacidade: ${dto.currentData.totalCapacityKW} KW` : ''}
${dto.currentData.terrainArea ? `- Área do terreno: ${dto.currentData.terrainArea} m²` : ''}
${dto.currentData.location ? `- Localização: ${dto.currentData.location}` : ''}
${dto.currentData.totalInvestment ? `- Investimento: R$ ${dto.currentData.totalInvestment.toLocaleString('pt-BR')}` : ''}
${dto.currentData.currentCostPerKWH ? `- Custo atual/KWH: R$ ${dto.currentData.currentCostPerKWH.toFixed(4)}` : ''}
${dto.currentData.utilityCostPerKWH ? `- Custo concessionária/KWH: R$ ${dto.currentData.utilityCostPerKWH.toFixed(4)}` : ''}
`
      : '';

    const prompt = `Fase atual: ${phaseDescriptions[dto.projectPhase]}

${dataContext}

Forneça uma análise completa incluindo:
1. Recomendações principais (3-5 itens)
2. Próximos passos específicos para esta fase (3-5 itens)
3. Estimativas de custos (se aplicável)
4. Principais riscos a considerar (3-5 itens)

Formato JSON:
{
  "recommendations": ["recomendação 1", "recomendação 2", ...],
  "nextSteps": ["passo 1", "passo 2", ...],
  "costEstimates": "texto com estimativas",
  "risks": ["risco 1", "risco 2", ...]
}`;

    const result = await this.makeGroqRequest(prompt, systemPrompt, {
      model: dto.model,
      maxTokens: 800,
      temperature: 0.7,
    });

    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendations: parsed.recommendations || [],
          nextSteps: parsed.nextSteps || [],
          costEstimates: parsed.costEstimates,
          risks: parsed.risks || [],
        };
      }
    } catch (error) {
      this.logger.warn('Erro ao parsear JSON de insights:', error);
    }

    // Fallback: extrair informações do texto
    const recommendations: string[] = [];
    const nextSteps: string[] = [];
    const risks: string[] = [];
    let costEstimates: string | undefined;

    const lines = result.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('recomendaç')) {
        currentSection = 'recommendations';
      } else if (
        trimmed.toLowerCase().includes('próximo') ||
        trimmed.toLowerCase().includes('passo')
      ) {
        currentSection = 'nextSteps';
      } else if (
        trimmed.toLowerCase().includes('custo') ||
        trimmed.toLowerCase().includes('estimativa')
      ) {
        currentSection = 'costEstimates';
      } else if (trimmed.toLowerCase().includes('risco')) {
        currentSection = 'risks';
      } else if (trimmed.match(/^[-•*0-9.)]/)) {
        const content = trimmed.replace(/^[-•*0-9.)]\s*/, '');
        if (currentSection === 'recommendations' && content) {
          recommendations.push(content);
        } else if (currentSection === 'nextSteps' && content) {
          nextSteps.push(content);
        } else if (currentSection === 'risks' && content) {
          risks.push(content);
        }
      } else if (currentSection === 'costEstimates' && trimmed) {
        costEstimates = (costEstimates || '') + trimmed + ' ';
      }
    }

    return {
      recommendations: recommendations.slice(0, 5),
      nextSteps: nextSteps.slice(0, 5),
      costEstimates: costEstimates?.trim(),
      risks: risks.slice(0, 5),
    };
  }
}
