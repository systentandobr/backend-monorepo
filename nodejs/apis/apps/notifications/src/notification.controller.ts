import { Body, Controller, Post } from '@nestjs/common';
import { NotificationPayload } from './types/config';
import { NotificationsService } from './notifications.service';
import { ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

/**
 * Controller for notifications
 */
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post('send')
  @ApiOperation({ summary: 'Send notification' })
  @ApiBody({
    description: 'Payload para envio de notificação',
    examples: {
      exemplo1: {
        summary: 'Notificação de sucesso',
        description: 'Exemplo de notificação de sucesso com metadata',
        value: {
          title: '✅ Operação realizada com sucesso',
          message: 'A operação foi concluída com êxito',
          type: 'success',
          metadata: {
            ID: '12345',
            Status: 'Concluído',
            Data: '2024-01-15T10:30:00Z',
          },
        },
      },
      exemplo2: {
        summary: 'Notificação de erro',
        description: 'Exemplo de notificação de erro',
        value: {
          title: '❌ Erro ao processar',
          message: 'Ocorreu um erro ao processar a solicitação',
          type: 'error',
          metadata: {
            Código: 'ERR001',
            Detalhes: 'Erro de validação',
          },
        },
      },
      exemplo3: {
        summary: 'Notificação simples',
        description: 'Exemplo de notificação simples sem metadata',
        value: {
          title: 'ℹ️ Informação',
          message: 'Esta é uma mensagem informativa',
          type: 'info',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendNotification(
    @Body() payload: NotificationPayload & { unitId?: string },
  ): Promise<{
    telegram: boolean;
    discord: boolean;
    email: boolean;
    whatsapp: boolean;
  }> {
    const unitId =
      payload.unitId ||
      payload.metadata?.unitId ||
      payload.metadata?.['ID Unidade'];
    return this.notificationsService.sendNotification(payload, unitId);
  }

  @Post('trigger/lead-welcome')
  @ApiOperation({ summary: 'Trigger welcome notification for a lead' })
  @ApiResponse({ status: 200, description: 'Welcome notification sent' })
  async sendLeadWelcome(
    @Body() body: { leadId: string; unitId: string; name?: string },
  ) {
    const payload: NotificationPayload = {
      title: '👋 Bem-vindo!',
      message: `Olá ${body.name || 'Visitante'}, ficamos felizes com seu interesse. Em breve um consultor entrará em contato.`,
      type: 'info',
      metadata: {
        leadId: body.leadId,
        unitId: body.unitId,
        trigger: 'lead-welcome',
      },
    };
    return this.notificationsService.sendNotification(payload, body.unitId);
  }

  @Post('trigger/chat-link')
  @ApiOperation({ summary: 'Generate and send chat link notification' })
  @ApiResponse({ status: 200, description: 'Chat link notification sent' })
  async sendChatLink(
    @Body() body: { leadId: string; unitId: string; stage?: string },
  ) {
    const chatUrl = await this.notificationsService.getChatUrl(
      body.leadId,
      body.unitId,
      body.stage,
    );

    const payload: NotificationPayload = {
      title: '💬 Seu Link de Atendimento',
      message: `Acesse seu chat exclusivo aqui para falar com nosso time: ${chatUrl}`,
      type: 'success',
      metadata: {
        leadId: body.leadId,
        unitId: body.unitId,
        chatUrl: chatUrl,
        trigger: 'chat-link',
      },
    };
    return this.notificationsService.sendNotification(payload, body.unitId);
  }
}
