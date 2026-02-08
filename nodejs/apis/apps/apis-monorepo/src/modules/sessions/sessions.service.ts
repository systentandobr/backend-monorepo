import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SessionsService {
    private readonly logger = new Logger(SessionsService.name);
    private readonly pythonApiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.pythonApiUrl =
            this.configService.get<string>('PYTHON_CHATBOT_API_URL') ||
            this.configService.get<string>('PYTHON_RAG_API_URL') ||
            'http://localhost:7001';
    }

    async getSessionsByUnitId(unitId: string, filters: any) {
        try {
            const encodedUnitId = encodeURIComponent(unitId);
            const response = await firstValueFrom(
                this.httpService.get(`${this.pythonApiUrl}/sessions/unit/${encodedUnitId}`, {
                    params: filters,
                }),
            );
            return { success: true, data: response.data };
        } catch (error) {
            this.logger.error(`Error fetching sessions for unit ${unitId}: ${error.message}`);
            return {
                success: false,
                error: error.response?.data?.detail || 'Erro ao buscar sessões na API Python'
            };
        }
    }

    async getSessionHistory(sessionId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.pythonApiUrl}/sessions/${sessionId}/history`),
            );
            return { success: true, data: response.data };
        } catch (error) {
            this.logger.error(`Error fetching history for session ${sessionId}: ${error.message}`);
            return {
                success: false,
                error: error.response?.data?.detail || 'Erro ao buscar histórico na API Python'
            };
        }
    }

    async updateSessionTags(sessionId: string, tags: string[]) {
        try {
            // Nota: A API Python precisará suportar este endpoint se quisermos persistir lá
            // Para já, vamos implementar o proxy
            const response = await firstValueFrom(
                this.httpService.patch(`${this.pythonApiUrl}/sessions/${sessionId}/tags`, { tags }),
            );
            return { success: true, data: response.data };
        } catch (error) {
            this.logger.error(`Error updating tags for session ${sessionId}: ${error.message}`);
            return {
                success: false,
                error: error.response?.data?.detail || 'Erro ao atualizar tags na API Python'
            };
        }
    }
}
