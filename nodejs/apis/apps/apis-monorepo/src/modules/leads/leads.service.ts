import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { Lead, LeadDocument, LeadStatus } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import {
  LeadFiltersDto,
  LeadResponseDto,
  LeadPipelineStatsDto,
} from './dto/lead-response.dto';
import { NotificationsService } from '../../../../notifications/src/notifications.service';

// axios.interceptors.request.use((config) => {
//   config.headers['Authorization'] = `Bearer ${process.env.PYTHON_CHATBOT_API_TOKEN}`;
//   console.log('axios.interceptors.request.use', config);
//   return config;
// });

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createLeadDto: CreateLeadDto,
    unitId: string,
  ): Promise<LeadResponseDto> {
    // Verificar se já existe lead com mesmo email na mesma unidade
    const existing = await this.leadModel.findOne({
      unitId,
      email: createLeadDto.email,
    });

    if (existing) {
      // Atualizar lead existente ao invés de criar duplicado
      const response = await this.update(
        existing._id.toString(),
        createLeadDto,
        unitId,
      );
      // Enviar notificação sobre atualização de lead
      this.notificationsService
        .notifyLeadUpdated({
          id: response.id,
          name: response.name,
          email: response.email,
          phone: response.phone,
          city: response.city,
          source: response.source,
          score: response.score,
          unitId: response.unitId,
        })
        .catch((err) => {
          this.logger.error(
            `Erro ao enviar notificação de novo lead: ${err.message}`,
          );
        });

      return response;
    }

    // Calcular score inicial baseado nos dados
    const score = this.calculateInitialScore(createLeadDto);

    const lead = new this.leadModel({
      ...createLeadDto,
      unitId,
      score,
      pipeline: {
        stage: 'new',
        stageHistory: [
          {
            stage: 'new',
            enteredAt: new Date(),
          },
        ],
      },
    });

    const saved = await lead.save();
    const responseDto = this.toResponseDto(saved);

    // Enviar notificação sobre novo lead
    this.notificationsService
      .notifyNewLead({
        id: responseDto.id,
        name: responseDto.name,
        email: responseDto.email,
        phone: responseDto.phone,
        city: responseDto.city,
        source: responseDto.source,
        score: responseDto.score,
        unitId: responseDto.unitId,
      })
      .catch((err) => {
        this.logger.error(
          `Erro ao enviar notificação de novo lead: ${err.message}`,
        );
      });

    return responseDto;
  }

  async findAll(
    filters: LeadFiltersDto,
    unitId: string,
  ): Promise<{
    data: LeadResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';
    const query: any = {
      unitId: { $in: [unitId, defaultUnitId] },
    };

    // Aplicar filtros
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    if (filters.minScore !== undefined || filters.maxScore !== undefined) {
      query.score = {};
      if (filters.minScore !== undefined) query.score.$gte = filters.minScore;
      if (filters.maxScore !== undefined) query.score.$lte = filters.maxScore;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
        { city: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.leadModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.leadModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map((l) => this.toResponseDto(l)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, unitId: string): Promise<LeadResponseDto> {
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';
    const lead = await this.leadModel
      .findOne({
        _id: id,
        unitId: { $in: [unitId, defaultUnitId] },
      })
      .exec();

    if (!lead) {
      throw new NotFoundException(
        'Lead não encontrado ==> ' + id + ' unitId:' + unitId,
      );
    }

    return this.toResponseDto(lead);
  }

  async update(
    id: string,
    updateLeadDto: UpdateLeadDto,
    unitId: string,
  ): Promise<LeadResponseDto> {
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';
    const lead = await this.leadModel
      .findOne({
        _id: id,
        unitId: { $in: [unitId, defaultUnitId] },
      })
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    // Atualizar pipeline se status mudou
    const updateData: any = { ...updateLeadDto };

    if (updateLeadDto.status && updateLeadDto.status !== lead.status) {
      updateData[`${updateLeadDto.status}At`] = new Date();

      // Atualizar histórico do pipeline
      const currentStage =
        lead.pipeline?.stageHistory[lead.pipeline.stageHistory.length - 1];
      if (currentStage && !currentStage.exitedAt) {
        currentStage.exitedAt = new Date();
      }

      updateData.pipeline = {
        stage: this.getPipelineStage(updateLeadDto.status),
        stageHistory: [
          ...(lead.pipeline?.stageHistory || []),
          {
            stage: this.getPipelineStage(updateLeadDto.status),
            enteredAt: new Date(),
          },
        ],
      };
    }

    // Adicionar nota se fornecida
    if (updateLeadDto.note) {
      const notes = lead.notes || [];
      notes.push({
        content: updateLeadDto.note,
        author: 'system', // TODO: Pegar do usuário autenticado
        createdAt: new Date(),
      });
      updateData.notes = notes;
    }

    const updated = await this.leadModel
      .findOneAndUpdate(
        { _id: id, unitId: { $in: [unitId, defaultUnitId] } },
        { ...updateData, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    return this.toResponseDto(updated);
  }

  async convertToCustomer(
    id: string,
    unitId: string,
    customerId: string,
  ): Promise<LeadResponseDto> {
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';
    const lead = await this.leadModel
      .findOneAndUpdate(
        { _id: id, unitId: { $in: [unitId, defaultUnitId] } },
        {
          status: LeadStatus.CUSTOMER,
          customerId,
          convertedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const responseDto = this.toResponseDto(lead);

    // Enviar notificação sobre conversão
    this.notificationsService
      .notifyLeadConverted({
        id: responseDto.id,
        name: responseDto.name,
        email: responseDto.email,
        customerId: responseDto.customerId!,
        unitId: responseDto.unitId,
      })
      .catch((err) => {
        this.logger.error(
          `Erro ao enviar notificação de conversão: ${err.message}`,
        );
      });

    return responseDto;
  }

  async remove(id: string, unitId: string): Promise<void> {
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';
    const result = await this.leadModel
      .deleteOne({
        _id: id,
        unitId: { $in: [unitId, defaultUnitId] },
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Lead não encontrado');
    }
  }

  async getPipelineStats(unitId: string): Promise<LeadPipelineStatsDto> {
    const defaultUnitId = process.env.DEFAULT_UNIT_ID || '#BR#SP#SYSTEM#0001';
    const leads = await this.leadModel
      .find({
        unitId: { $in: [unitId, defaultUnitId] },
      })
      .exec();

    const newCount = leads.filter((l) => l.status === LeadStatus.NEW).length;
    const contactedCount = leads.filter(
      (l) => l.status === LeadStatus.CONTACTED,
    ).length;
    const qualifiedCount = leads.filter(
      (l) => l.status === LeadStatus.QUALIFIED,
    ).length;
    const convertedCount = leads.filter(
      (l) =>
        l.status === LeadStatus.CONVERTED || l.status === LeadStatus.CUSTOMER,
    ).length;
    const lostCount = leads.filter((l) => l.status === LeadStatus.LOST).length;
    const total = leads.length;

    const conversionRate = total > 0 ? (convertedCount / total) * 100 : 0;

    return {
      new: newCount,
      contacted: contactedCount,
      qualified: qualifiedCount,
      converted: convertedCount,
      lost: lostCount,
      total,
      conversionRate: Number(conversionRate.toFixed(2)),
    };
  }

  private calculateInitialScore(lead: CreateLeadDto): number {
    let score = 0;

    // Score baseado em dados completos
    if (lead.name && lead.name.length > 2) score += 10;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.city) score += 10;

    // Score baseado em metadata
    if (lead.metadata?.budget) score += 20;
    if (lead.metadata?.franchiseType) score += 15;
    if (lead.metadata?.experience) score += 10;
    if (lead.metadata?.timeToStart) score += 15;

    return Math.min(score, 100);
  }

  private getPipelineStage(status: LeadStatus): string {
    const stageMap: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: 'new',
      [LeadStatus.CONTACTED]: 'contacted',
      [LeadStatus.QUALIFIED]: 'qualified',
      [LeadStatus.CONVERTED]: 'converted',
      [LeadStatus.CUSTOMER]: 'customer',
      [LeadStatus.LOST]: 'lost',
    };
    return stageMap[status] || 'new';
  }

  private generateSessionId(): string {
    return randomUUID();
  }

  private async findOrCreateSession(
    leadId: string,
    unitId: string,
    userId: string,
    customerId?: string,
  ): Promise<string> {
    /**
     * Busca uma sessão existente ou cria uma nova
     * Prioridade: lead_id > customer_id > user_id
     */
    const pythonApiUrl =
      process.env.PYTHON_CHATBOT_API_URL ||
      process.env.PYTHON_RAG_API_URL ||
      'http://localhost:7001';

    try {
      // Tentar buscar sessão existente
      const findParams = new URLSearchParams({
        unit_id: unitId,
      });

      if (leadId) {
        findParams.append('lead_id', leadId);
      } else if (customerId) {
        findParams.append('customer_id', customerId);
      } else if (userId) {
        findParams.append('user_id', userId);
      }

      const findResponse = await axios.get(
        `${pythonApiUrl}/sessions/find?${findParams.toString()}`,
        {
          timeout: parseInt(
            process.env.PYTHON_CHATBOT_FIND_TIMEOUT || '10000',
            10,
          ), // 10 segundos padrão
        },
      );

      if (findResponse.data?.found && findResponse.data?.session_id) {
        this.logger.log(
          `Sessão existente encontrada: ${findResponse.data.session_id}`,
        );
        return findResponse.data.session_id;
      }
    } catch (error) {
      // Se houver erro ao buscar, continuar e criar nova sessão
      this.logger.warn(`Erro ao buscar sessão existente: ${error.message}`);
    }

    // Se não encontrou, gerar novo session_id
    return this.generateSessionId();
  }

  async createConversation(
    leadId: string,
    unitId: string,
    userId: string,
    customerId?: string,
    stage?: LeadStatus,
  ): Promise<any> {
    const lead = await this.findOne(leadId, unitId);

    // Configurar URL base (idealmente via variáveis de ambiente)
    const baseUrl =
      process.env.CHAT_BASE_URL || 'https://chat.tadevolta.com.br';

    // Determinar o estágio inicial baseado no status do lead
    let startStage = 'sales';
    if (lead.status === LeadStatus.CUSTOMER || stage === LeadStatus.CUSTOMER)
      startStage = 'post-sales';
    if (lead.status === LeadStatus.NEW || stage === LeadStatus.NEW)
      startStage = 'capture';

    const pythonApiUrl =
      process.env.PYTHON_CHATBOT_API_URL ||
      process.env.PYTHON_RAG_API_URL ||
      'http://localhost:7001';

    try {
      // Buscar sessão existente ou criar nova
      const sessionId = await this.findOrCreateSession(
        leadId,
        unitId,
        userId,
        customerId,
      );

      // Chamar API Python para inicializar a conversa
      this.logger.log('Chamando API Python para inicializar conversa', {
        pythonApiUrl,
        leadId,
        unitId,
        userId,
        sessionId,
        startStage,
        domain: 'systentando-web',
      });

      // Timeout aumentado para inicialização da conversa (pode demorar mais devido à inicialização do agente e busca de dados)
      const initTimeout = parseInt(
        process.env.PYTHON_CHATBOT_INIT_TIMEOUT || '30000',
        10,
      ); // 30 segundos padrão

      const response = await axios.post(
        `${pythonApiUrl}/chat`,
        {
          session_id: sessionId,
          lead_id: leadId,
          unit_id: unitId,
          user_id: userId,
          customer_id: customerId,
          stage: startStage,
          domain: 'systentando-web',
          message: 'init_conversation',
        },
        {
          timeout: initTimeout,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Usar session_id da resposta se disponível, senão usar o que foi gerado/buscado
      const finalSessionId = response?.data?.session_id || sessionId;

      const params = new URLSearchParams({
        leadId: leadId,
        unitId: unitId,
        stage: startStage,
        sessionId: finalSessionId,
      });

      const chatUrl = `${baseUrl}/?${params.toString()}`;

      this.notificationsService
        .notifyNewConversation({
          id: leadId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          source: lead.source,
          score: lead.score,
          unitId: lead.unitId,
          chatUrl: chatUrl || '',
          mensagem: response?.data?.message || '',
        })
        .catch((err) => {
          this.logger.error(
            `Erro ao enviar notificação de novo lead: ${err.message}`,
          );
        });

      return { chatUrl, data: response.data };
    } catch (error) {
      this.logger.error(
        `Erro ao criar conversa do lead ${leadId}: ${error.message}`,
      );
    }
    return null;
  }

  async getConversations(
    leadId: string,
    unitId: string,
    customerId?: string,
    userId?: string,
  ): Promise<{
    sessions: Array<{
      sessionId: string;
      firstMessageAt: string;
      lastMessageAt: string;
      messageCount: number;
      history: Array<{
        role: string;
        content: string;
        timestamp?: string;
      }>;
    }>;
  }> {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'leads.service.ts:414',
        message: 'getConversations entry',
        data: { leadId, unitId, customerId, userId },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion

    const pythonApiUrl =
      process.env.PYTHON_CHATBOT_API_URL ||
      process.env.PYTHON_RAG_API_URL ||
      'http://localhost:7001';

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'leads.service.ts:428',
        message: 'Python API URL',
        data: { pythonApiUrl },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion

    try {
      // Buscar sessões associadas ao lead
      const requestUrl = `${pythonApiUrl}/sessions/unit/${encodeURIComponent(unitId)}`;
      const requestParams = {
        lead_id: leadId,
        customer_id: customerId,
        user_id: userId,
        limit: 100,
        offset: 0,
      };

      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'leads.service.ts:440',
            message: 'Before sessions API call',
            data: { requestUrl, requestParams },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        },
      ).catch(() => {});
      // #endregion

      const response = await axios.get(requestUrl, {
        params: requestParams,
        timeout: parseInt(process.env.PYTHON_CHATBOT_TIMEOUT || '10000', 10), // 10 segundos para buscar sessões
      });

      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'leads.service.ts:447',
            message: 'After sessions API call',
            data: {
              status: response.status,
              hasData: !!response.data,
              sessionsCount: response.data?.sessions?.length,
              sessions: response.data?.sessions,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'C',
          }),
        },
      ).catch(() => {});
      // #endregion

      console.log('getConversations:: ', {
        unitId,
        leadId,
        data: response.data.sessions,
      });
      const sessions = response.data.sessions || [];

      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'leads.service.ts:455',
            message: 'Before history fetch loop',
            data: {
              sessionsCount: sessions.length,
              sessionIds: sessions.map((s: any) => s.sessionId),
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B',
          }),
        },
      ).catch(() => {});
      // #endregion

      // Para cada sessão, buscar histórico completo
      const sessionsWithHistory = await Promise.all(
        sessions.map(async (session: any) => {
          // #region agent log
          fetch(
            'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'leads.service.ts:461',
                message: 'Before history API call',
                data: { sessionId: session.sessionId },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'B',
              }),
            },
          ).catch(() => {});
          // #endregion

          try {
            const historyUrl = `${pythonApiUrl}/sessions/${session.sessionId}/history`;

            // #region agent log
            fetch(
              'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  location: 'leads.service.ts:466',
                  message: 'History URL',
                  data: { historyUrl },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'run1',
                  hypothesisId: 'E',
                }),
              },
            ).catch(() => {});
            // #endregion

            const historyResponse = await axios.get(historyUrl, {
              timeout: parseInt(
                process.env.PYTHON_CHATBOT_HISTORY_TIMEOUT || '15000',
                10,
              ), // 15 segundos (reduzido de 30)
              // Desabilitar retries automáticos do axios para evitar loops
              validateStatus: (status) => status < 500, // Não retry em erros 5xx
            });

            // #region agent log
            fetch(
              'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  location: 'leads.service.ts:472',
                  message: 'After history API call success',
                  data: {
                    sessionId: session.sessionId,
                    status: historyResponse.status,
                    hasMessages: !!historyResponse.data.messages,
                    messagesCount: historyResponse.data?.messages?.length,
                    responseData: historyResponse.data,
                  },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'run1',
                  hypothesisId: 'B',
                }),
              },
            ).catch(() => {});
            // #endregion

            return {
              sessionId: session.sessionId,
              firstMessageAt: session.firstMessageAt,
              lastMessageAt: session.lastMessageAt,
              messageCount: session.messageCount,
              metadata: session.metadata,
              history: historyResponse.data.messages || [],
            };
          } catch (error: any) {
            // #region agent log
            fetch(
              'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  location: 'leads.service.ts:487',
                  message: 'History API call error',
                  data: {
                    sessionId: session.sessionId,
                    errorMessage: error.message,
                    errorCode: error.code,
                    errorResponse: error.response?.data,
                    errorStatus: error.response?.status,
                  },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'run1',
                  hypothesisId: 'B',
                }),
              },
            ).catch(() => {});
            // #endregion

            this.logger.warn(
              `Erro ao buscar histórico da sessão ${session.sessionId}: ${error.message}`,
            );
            return {
              sessionId: session.sessionId,
              firstMessageAt: session.firstMessageAt,
              lastMessageAt: session.lastMessageAt,
              messageCount: session.messageCount,
              history: [],
            };
          }
        }),
      );

      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'leads.service.ts:503',
            message: 'Before return',
            data: {
              sessionsWithHistoryCount: sessionsWithHistory.length,
              historiesWithMessages: sessionsWithHistory.filter(
                (s: any) => s.history?.length > 0,
              ).length,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'D',
          }),
        },
      ).catch(() => {});
      // #endregion

      return {
        sessions: sessionsWithHistory,
      };
    } catch (error: any) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/2c2ef524-2985-45e5-aeb9-914704297ab1',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'leads.service.ts:510',
            message: 'Main catch error',
            data: {
              errorMessage: error.message,
              errorCode: error.code,
              errorResponse: error.response?.data,
              errorStatus: error.response?.status,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B',
          }),
        },
      ).catch(() => {});
      // #endregion

      this.logger.error(
        `Erro ao buscar conversas do lead ${leadId}: ${error.message}`,
      );
      // Retornar vazio em caso de erro (degradação graciosa)
      return {
        sessions: [],
      };
    }
  }

  private toResponseDto(lead: LeadDocument): LeadResponseDto {
    return {
      id: lead._id.toString(),
      unitId: lead.unitId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      state: lead.state,
      source: lead.source,
      status: lead.status,
      metadata: lead.metadata,
      tags: lead.tags,
      notes: lead.notes,
      contactedAt: lead.contactedAt,
      qualifiedAt: lead.qualifiedAt,
      convertedAt: lead.convertedAt,
      customerId: lead.customerId?.toString(),
      score: lead.score,
      pipeline: lead.pipeline,
      createdAt: lead.createdAt || new Date(),
      updatedAt: lead.updatedAt || new Date(),
    };
  }
}
