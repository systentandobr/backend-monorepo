import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleGenAI, PersonGeneration } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

@Injectable()
export class Veo3Service {
    private readonly logger = new Logger(Veo3Service.name);
    private genAI: GoogleGenAI;
    private readonly baseVideoCache: Map<string, Buffer> = new Map();
    private readonly baseImageCache: Map<string, Buffer> = new Map();

    constructor() {
        const apiKey = process.env.VEO3_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
        if (!apiKey) {
            this.logger.warn(
                'VEO3_API_KEY ou GOOGLE_GENAI_API_KEY não configurada. A geração de vídeos não funcionará.',
            );
        } else {
            this.genAI = new GoogleGenAI({
                apiKey
            });
        }
    }

    /**
     * Converte Buffer para base64
     */
    private bufferToBase64(buffer: Buffer, mimeType: string = 'video/mp4'): string {
        return buffer.toString('base64');
    }

    /**
     * Gera um vídeo usando a API Veo3 (Gemini 2.0 Flash ou modelo Veo dedicado)
     */
    async generateVideo(
        prompt: string,
        baseVideo?: Buffer,
        baseImage?: Buffer,
        options?: { retries?: number; timeout?: number }
    ): Promise<Buffer> {
        if (!this.genAI) {
            throw new BadRequestException(
                'API Key do Veo3 não configurada. Configure VEO3_API_KEY ou GOOGLE_GENAI_API_KEY.',
            );
        }

        const retries = options?.retries || 1;
        const timeout = options?.timeout || 180000; // Vídeos demoram mais para gerar

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                // Configuração conforme playground funcional
                const generateOptions: any = {
                    model: 'veo-3.1-generate-preview',
                    prompt: prompt,
                    config: {
                        numberOfVideos: 1,
                        aspectRatio: '16:9',
                        durationSeconds: 8,
                        personGeneration: PersonGeneration.ALLOW_ADULT,
                        resolution: '720p',
                    },
                };

                // Adicionar imagem de referência se existir
                if (baseImage && baseImage.length > 0) {
                    generateOptions.image = {
                        imageBytes: baseImage.toString('base64'),
                        mimeType: 'image/png',
                    };
                    // Reforçar no prompt a referência
                    generateOptions.prompt = `Using the provided character image as reference for the athlete: ${generateOptions.prompt}`;
                }

                this.logger.log(`Iniciando geração de vídeo com Veo 3.1 (tentativa ${attempt})...`);

                let operation = await Promise.race([
                    this.genAI.models.generateVideos(generateOptions),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout inicial de conexão (30s)')), 30000),
                    ),
                ]) as any;

                // Loop de Polling conforme playground funcional
                const maxPollingAttempts = 40; // 40 * 10s = ~6.6 minutos
                let pollingAttempt = 0;

                while (!operation.done && pollingAttempt < maxPollingAttempts) {
                    pollingAttempt++;
                    this.logger.log(`Vídeo ${operation.name} não gerado ainda (tentativa ${pollingAttempt}). Aguardando 10 segundos...`);

                    await new Promise((resolve) => setTimeout(resolve, 10000));

                    operation = await this.genAI.operations.getVideosOperation({
                        operation: operation,
                    });
                }

                if (!operation.done) {
                    throw new Error('Geração de vídeo expirou no polling (excedeu 6 minutos)');
                }

                this.logger.log(`Geração concluída. Total de vídeos: ${operation.response?.generatedVideos?.length ?? 0}`);

                const generatedVideo = operation.response?.generatedVideos?.[0];
                if (generatedVideo?.video?.uri) {
                    this.logger.log(`Baixando vídeo de: ${generatedVideo.video.uri}`);
                    const response = await fetch(`${generatedVideo.video.uri}&key=${process.env.VEO3_API_KEY || process.env.GOOGLE_GENAI_API_KEY}`);
                    const arrayBuffer = await response.arrayBuffer();
                    return Buffer.from(arrayBuffer);
                }

                throw new Error('Resposta da API não contém URI do vídeo gerado');
            } catch (error: any) {
                this.logger.warn(
                    `Tentativa ${attempt}/${retries} falhou: ${error.message}`,
                );

                if (attempt === retries) {
                    throw new BadRequestException(
                        `Erro ao gerar vídeo após ${retries} tentativas: ${error.message}`,
                    );
                }

                // Backoff exponencial
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        throw new BadRequestException('Erro ao gerar vídeo');
    }

    /**
     * Gera um vídeo de execução para um exercício
     */
    async generateExerciseVideo(
        exerciseName: string,
        description: string | undefined,
        muscleGroups: string[],
        equipment: string[] | undefined,
        targetGender: 'male' | 'female' | 'other',
    ): Promise<Buffer> {
        const genderText = targetGender === 'female' ? 'feminino' : 'masculino';
        const equipmentText = equipment && equipment.length > 0 ? equipment.join(', ') : 'corpo livre';
        const muscleGroupsText = muscleGroups.join(', ');

        // Carregar imagem base para referência de personagem
        const baseImage = await this.loadBaseImage(targetGender);

        // Prompt altamente específico para montagem da execução do exercício
        const prompt = `Crie um vídeo de alta fidelidade mostrando a execução completa e tecnicamente perfeita do exercício "${exerciseName}". 
O atleta é do gênero ${genderText} e deve ter a mesma aparência do personagem na imagem de referência. 
O vídeo deve começar na posição inicial correta, demonstrar a fase concêntrica (contração), o ponto de contração máxima, a fase excêntrica controlada e retornar à posição inicial.
Foco visual claro nos seguintes grupos musculares: ${muscleGroupsText}. 
Equipamento utilizado: ${equipmentText}.
${description ? `Contexto adicional da execução: ${description}` : ''}
Estilo: Vídeo cinematográfico 4K, fundo de academia moderno e minimalista, iluminação profissional que realça a definição muscular e a técnica do movimento. Sem textos ou logos.`;

        const videoBuffer = await this.generateVideo(prompt, undefined, baseImage);
        return videoBuffer;
    }

    /**
     * Carrega a imagem base conforme o gênero (Personagem Referência)
     */
    private async loadBaseImage(gender: 'male' | 'female' | 'other'): Promise<Buffer> {
        const cacheKey = gender === 'other' ? 'male' : gender;

        if (this.baseImageCache.has(cacheKey)) {
            return this.baseImageCache.get(cacheKey)!;
        }

        try {
            const imageName = gender === 'female' ? 'athlete_female.png' : 'athlete_male.png';

            // Caminhos possíveis para as imagens base
            const possiblePaths = [
                path.join(process.cwd(), '..', '..', '..', 'tadevolta-landing-page', 'src', 'assets', 'images', imageName),
                path.join(process.cwd(), 'apps', 'apis-monorepo', 'src', 'assets', 'images', imageName),
                path.join(process.cwd(), 'assets', 'images', imageName),
                path.join(process.cwd(), 'uploads', 'base-images', imageName),
            ];

            let imageBuffer: Buffer | null = null;
            for (const imagePath of possiblePaths) {
                if (fs.existsSync(imagePath)) {
                    imageBuffer = fs.readFileSync(imagePath);
                    this.logger.log(`Imagem base do personagem carregada de: ${imagePath}`);
                    break;
                }
            }

            if (!imageBuffer) {
                this.logger.warn(`Imagem base não encontrada para gênero ${gender}. Usando apenas prompt.`);
                return Buffer.alloc(0);
            }

            this.baseImageCache.set(cacheKey, imageBuffer);
            return imageBuffer;
        } catch (error: any) {
            this.logger.error(`Erro ao carregar imagem base: ${error.message}`);
            return Buffer.alloc(0);
        }
    }
}
