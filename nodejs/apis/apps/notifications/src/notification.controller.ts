import { Body, Controller, Post } from "@nestjs/common";
import { NotificationPayload } from "./types/config";
import { NotificationsService } from "./notifications.service";
import { ApiResponse, ApiOperation, ApiBody } from "@nestjs/swagger";

/** 
 * Controller for notifications
 */
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send notification' } )
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
            'ID': '12345',
            'Status': 'Concluído',
            'Data': '2024-01-15T10:30:00Z'
          }
        }
      },
      exemplo2: {
        summary: 'Notificação de erro',
        description: 'Exemplo de notificação de erro',
        value: {
          title: '❌ Erro ao processar',
          message: 'Ocorreu um erro ao processar a solicitação',
          type: 'error',
          metadata: {
            'Código': 'ERR001',
            'Detalhes': 'Erro de validação'
          }
        }
      },
      exemplo3: {
        summary: 'Notificação simples',
        description: 'Exemplo de notificação simples sem metadata',
        value: {
          title: 'ℹ️ Informação',
          message: 'Esta é uma mensagem informativa',
          type: 'info'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Notification sent'})   
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendNotification(@Body() payload: NotificationPayload): Promise<{
    telegram: boolean;
    discord: boolean;
    email: boolean;
  }> {
    return this.notificationsService.sendNotification(payload);
  }
}