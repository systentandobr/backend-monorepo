import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NanoBananaService {
  private readonly logger = new Logger(NanoBananaService.name);
  private genAI: GoogleGenerativeAI;
  private readonly baseImageCache: Map<string, Buffer> = new Map();

  constructor() {
    const apiKey = process.env.NANO_BANANA_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'NANO_BANANA_API_KEY ou GOOGLE_GENAI_API_KEY não configurada. A geração de imagens não funcionará.',
      );
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Carrega a imagem base conforme o gênero
   */
  private async loadBaseImage(gender: 'male' | 'female' | 'other'): Promise<Buffer> {
    const cacheKey = gender === 'other' ? 'male' : gender;
    
    if (this.baseImageCache.has(cacheKey)) {
      return this.baseImageCache.get(cacheKey)!;
    }

    try {
      // Tentar carregar do diretório de assets do frontend (via caminho relativo)
      // Ou usar imagens públicas se disponíveis
      const imageName = gender === 'female' ? 'athlete_female.png' : 'athlete_male.png';
      
      // Caminhos possíveis para as imagens base
      const possiblePaths = [
        path.join(process.cwd(), '..', '..', '..', 'tadevolta-landing-page', 'src', 'assets', 'images', imageName),
        path.join(process.cwd(), 'assets', 'images', imageName),
        path.join(process.cwd(), 'uploads', 'base-images', imageName),
      ];

      let imageBuffer: Buffer | null = null;
      for (const imagePath of possiblePaths) {
        if (fs.existsSync(imagePath)) {
          imageBuffer = fs.readFileSync(imagePath);
          this.logger.log(`Imagem base carregada de: ${imagePath}`);
          break;
        }
      }

      if (!imageBuffer) {
        // Se não encontrar localmente, retornar null e usar apenas prompt
        this.logger.warn(`Imagem base não encontrada para gênero ${gender}. Usando apenas prompt.`);
        return Buffer.alloc(0);
      }

      this.baseImageCache.set(cacheKey, imageBuffer);
      return imageBuffer;
    } catch (error) {
      this.logger.error(`Erro ao carregar imagem base: ${error.message}`);
      return Buffer.alloc(0);
    }
  }

  /**
   * Converte Buffer para base64
   */
  private bufferToBase64(buffer: Buffer, mimeType: string = 'image/png'): string {
    return buffer.toString('base64');
  }

  /**
   * Gera uma imagem usando a API Nano Banana (Gemini 2.5 Flash Image)
   */
  async generateImage(
    prompt: string,
    baseImage?: Buffer,
    options?: { retries?: number; timeout?: number },
  ): Promise<Buffer> {
    if (!this.genAI) {
      throw new BadRequestException(
        'API Key do Nano Banana não configurada. Configure NANO_BANANA_API_KEY ou GOOGLE_GENAI_API_KEY.',
      );
    }

    const retries = options?.retries || 3;
    const timeout = options?.timeout || 30000;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

        const parts: any[] = [{ text: prompt }];

        // Se houver imagem base, adicionar como contexto
        if (baseImage && baseImage.length > 0) {
          const base64Image = this.bufferToBase64(baseImage);
          parts.push({
            inlineData: {
              data: base64Image,
              mimeType: 'image/png',
            },
          });
        }

        const result = await Promise.race([
          model.generateContent(parts),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout na geração de imagem')), timeout),
          ),
        ]) as any;

        const response = result.response;
        const candidates = response.candidates;

        if (!candidates || candidates.length === 0) {
          throw new Error('Nenhuma imagem gerada pela API');
        }

        // Extrair imagem da resposta
        for (const candidate of candidates) {
          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData?.data) {
                const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                this.logger.log(`Imagem gerada com sucesso (tentativa ${attempt})`);
                return imageBuffer;
              }
            }
          }
        }

        throw new Error('Resposta da API não contém dados de imagem');
      } catch (error: any) {
        this.logger.warn(
          `Tentativa ${attempt}/${retries} falhou: ${error.message}`,
        );

        if (attempt === retries) {
          throw new BadRequestException(
            `Erro ao gerar imagem após ${retries} tentativas: ${error.message}`,
          );
        }

        // Backoff exponencial
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new BadRequestException('Erro ao gerar imagem');
  }

  /**
   * Gera múltiplas imagens para um exercício
   */
  async generateExerciseImages(
    exerciseName: string,
    description: string | undefined,
    muscleGroups: string[],
    equipment: string[] | undefined,
    targetGender: 'male' | 'female' | 'other',
  ): Promise<Buffer[]> {
    const baseImage = await this.loadBaseImage(targetGender);
    const genderText = targetGender === 'female' ? 'feminino' : 'masculino';
    const equipmentText = equipment && equipment.length > 0 ? equipment.join(', ') : 'corpo livre';
    const muscleGroupsText = muscleGroups.join(', ');

    const prompts = [
      // Imagem 1 - Posição Inicial
      `Um atleta ${genderText} em posição inicial do exercício "${exerciseName}", mostrando a postura correta antes de iniciar o movimento. Foco nos grupos musculares: ${muscleGroupsText}. Equipamento: ${equipmentText}.${description ? ` Descrição: ${description}` : ''} Estilo: ilustração técnica de exercício, fundo neutro, iluminação clara.`,

      // Imagem 2 - Meio do Movimento
      `Um atleta ${genderText} executando o exercício "${exerciseName}" na fase intermediária do movimento, demonstrando a técnica correta. Foco nos grupos musculares: ${muscleGroupsText}. Equipamento: ${equipmentText}.${description ? ` Descrição: ${description}` : ''} Estilo: ilustração técnica de exercício, fundo neutro, iluminação clara.`,

      // Imagem 3 - Posição Final
      `Um atleta ${genderText} completando o exercício "${exerciseName}", mostrando a posição final e contração máxima. Foco nos grupos musculares: ${muscleGroupsText}. Equipamento: ${equipmentText}.${description ? ` Descrição: ${description}` : ''} Estilo: ilustração técnica de exercício, fundo neutro, iluminação clara.`,
    ];

    const images: Buffer[] = [];

    for (let i = 0; i < prompts.length; i++) {
      try {
        this.logger.log(`Gerando imagem ${i + 1}/3 para exercício: ${exerciseName}`);
        const image = await this.generateImage(prompts[i], baseImage.length > 0 ? baseImage : undefined);
        images.push(image);
        
        // Pequeno delay entre gerações para evitar rate limit
        if (i < prompts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        this.logger.error(`Erro ao gerar imagem ${i + 1}: ${error.message}`);
        throw error;
      }
    }

    return images;
  }
}
