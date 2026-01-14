import {
  Injectable,
  Logger,
  Inject,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { EmailConfig, NotificationPayload, ToReceivers } from './types/config';
import * as nodemailerModule from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SettingsService } from '../../apis-monorepo/src/modules/settings/settings.service';

// Resolver nodemailer de forma compatível
const nodemailer = nodemailerModule.default || nodemailerModule;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly defaultTelegramBotToken: string;
  private readonly defaultTelegramChatId: string;
  private readonly defaultDiscordWebhookUrl: string;
  private readonly defaultEmailConfig: EmailConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Optional()
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService?: SettingsService,
  ) {
    // Configurações padrão de fallback (variáveis de ambiente)
    this.defaultTelegramBotToken =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.defaultTelegramChatId =
      this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    this.defaultDiscordWebhookUrl =
      this.configService.get<string>('DISCORD_WEBHOOK_URL') || '';
    this.defaultEmailConfig = {
      host: this.configService.get<string>('EMAIL_HOST') || '',
      port: this.configService.get<number>('EMAIL_PORT') || 587,
      username: this.configService.get<string>('EMAIL_USERNAME') || '',
      password: this.configService.get<string>('EMAIL_PASSWORD') || '',
      from: this.configService.get<string>('EMAIL_FROM') || '',
    };
  }

  /**
   * Busca configurações de notificações para uma unidade
   * Retorna configurações do banco se disponível, senão usa variáveis de ambiente
   */
  private async getNotificationConfig(unitId?: string): Promise<{
    telegram?: { botToken?: string; chatId?: string; enabled?: boolean };
    discord?: { webhookUrl?: string; enabled?: boolean };
    email?: {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      from?: string;
      enabled?: boolean;
    };
  }> {
    try {
      // Busca configurações do banco
      const settings =
        await this.settingsService.getNotificationSettings(unitId);

      if (settings) {
        // Mescla configurações do banco com fallback para variáveis de ambiente
        return {
          telegram: {
            botToken:
              settings.telegram?.botToken || this.defaultTelegramBotToken,
            chatId: settings.telegram?.chatId || this.defaultTelegramChatId,
            enabled:
              settings.telegram?.enabled !== false &&
              !!(settings.telegram?.botToken || this.defaultTelegramBotToken) &&
              !!(settings.telegram?.chatId || this.defaultTelegramChatId),
          },
          discord: {
            webhookUrl:
              settings.discord?.webhookUrl || this.defaultDiscordWebhookUrl,
            enabled:
              settings.discord?.enabled !== false &&
              !!(settings.discord?.webhookUrl || this.defaultDiscordWebhookUrl),
          },
          email: {
            host: settings.email?.host || this.defaultEmailConfig.host,
            port: settings.email?.port || this.defaultEmailConfig.port,
            username:
              settings.email?.username || this.defaultEmailConfig.username,
            password:
              settings.email?.password || this.defaultEmailConfig.password,
            from: settings.email?.from || this.defaultEmailConfig.from,
            enabled:
              settings.email?.enabled !== false &&
              !!(settings.email?.host || this.defaultEmailConfig.host) &&
              !!(settings.email?.username || this.defaultEmailConfig.username),
          },
        };
      }
    } catch (error) {
      this.logger.warn(
        `Erro ao buscar configurações do banco para unitId ${unitId}: ${error.message}`,
      );
    }

    // Fallback para configurações padrão
    return {
      telegram: {
        botToken: this.defaultTelegramBotToken,
        chatId: this.defaultTelegramChatId,
        enabled: !!(this.defaultTelegramBotToken && this.defaultTelegramChatId),
      },
      discord: {
        webhookUrl: this.defaultDiscordWebhookUrl,
        enabled: !!this.defaultDiscordWebhookUrl,
      },
      email: {
        ...this.defaultEmailConfig,
        enabled: !!(
          this.defaultEmailConfig.host &&
          this.defaultEmailConfig.username &&
          this.defaultEmailConfig.password
        ),
      },
    };
  }

  /**
   * Envia notificação para Telegram
   */
  async sendTelegramNotification(
    payload: NotificationPayload,
    unitId?: string,
  ): Promise<boolean> {
    const config = await this.getNotificationConfig(unitId);

    if (
      !config.telegram?.enabled ||
      !config.telegram?.botToken ||
      !config.telegram?.chatId
    ) {
      this.logger.warn('Telegram bot token ou chat ID não configurados');
      return false;
    }

    try {
      const emoji = this.getEmojiForType(payload.type);
      let message = `${emoji} *${payload.title}*\n\n${payload.message}`;

      if (payload.metadata) {
        const metadataText = Object.entries(payload.metadata)
          .map(([key, value]) => `*${key}:* ${value}`)
          .join('\n');
        message = `${message}\n\n${metadataText}`;
      }

      const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;

      await firstValueFrom(
        this.httpService.post(url, {
          chat_id: config.telegram.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      );

      this.logger.log('Notificação enviada para Telegram com sucesso');
      return true;
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação para Telegram: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Envia notificação para Discord
   */
  async sendDiscordNotification(
    payload: NotificationPayload,
    unitId?: string,
  ): Promise<boolean> {
    const config = await this.getNotificationConfig(unitId);

    if (!config.discord?.enabled || !config.discord?.webhookUrl) {
      this.logger.warn('Discord webhook URL não configurada');
      return false;
    }

    try {
      const color = this.getColorForType(payload.type);
      const embed = {
        title: payload.title,
        description: payload.message,
        color: color,
        timestamp: new Date().toISOString(),
        fields: payload.metadata
          ? Object.entries(payload.metadata).map(([name, value]) => ({
              name,
              value: String(value),
              inline: true,
            }))
          : [],
      };

      await firstValueFrom(
        this.httpService.post(config.discord.webhookUrl, {
          embeds: [embed],
        }),
      );

      this.logger.log('Notificação enviada para Discord com sucesso');
      return true;
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação para Discord: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Envia notificação para ambos os canais
   */
  async sendNotification(
    payload: NotificationPayload,
    unitId?: string,
    toSend?: ToReceivers,
  ): Promise<{
    telegram: boolean;
    discord: boolean;
    email: boolean;
  }> {
    const [telegramResult, discordResult, emailResult] =
      await Promise.allSettled([
        toSend?.sendToAdmins
          ? this.sendTelegramNotification(payload, unitId)
          : Promise.resolve(false),
        toSend?.sendToAdmins
          ? this.sendDiscordNotification(payload, unitId)
          : Promise.resolve(false),
        toSend?.sendToClients
          ? this.sendEmailNotification(payload, unitId)
          : Promise.resolve(false),
      ]);

    return {
      telegram:
        telegramResult.status === 'fulfilled' ? telegramResult.value : false,
      discord:
        discordResult.status === 'fulfilled' ? discordResult.value : false,
      email: emailResult.status === 'fulfilled' ? emailResult.value : false,
    };
  }

  private customHTMLMessage(payload: NotificationPayload): string {
    // Função para escapar HTML e prevenir XSS
    const escapeHtml = (text: string | number | undefined | null): string => {
      if (text === null || text === undefined) return '-';
      const str = String(text);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const metadataHtml = payload.metadata
      ? Object.entries(payload.metadata)
          .map(([key, value]) => {
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())
              .trim();
            return `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 40%;">${escapeHtml(formattedKey)}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${escapeHtml(value)}</td>
            </tr>
            `;
          })
          .join('')
      : '';

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${escapeHtml(payload.title)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
          <td style="padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; border-radius: 8px 8px 0 0; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">${escapeHtml(payload.title)}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 32px 24px;">
                  <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    ${escapeHtml(payload.message)}
                  </p>
                  
                  ${
                    metadataHtml
                      ? `
                  <div style="margin-top: 32px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb;">
                      <tr>
                        <td style="padding: 12px; background-color: #f3f4f6; border-bottom: 1px solid #e5e7eb;">
                          <h2 style="margin: 0; color: #111827; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Detalhes</h2>
                        </td>
                      </tr>
                      ${metadataHtml}
                    </table>
                  </div>
                  `
                      : ''
                  }
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                    Esta é uma notificação automática do sistema.<br>
                    Por favor, não responda este email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  /**
   * Envia notificação para email
   */
  async sendEmailNotification(
    payload: NotificationPayload,
    unitId?: string,
  ): Promise<boolean> {
    const config = await this.getNotificationConfig(unitId);

    if (
      !config.email?.enabled ||
      !config.email?.host ||
      !config.email?.port ||
      !config.email?.username ||
      !config.email?.password ||
      !config.email?.from
    ) {
      this.logger.warn('Email config não configurada');
      return false;
    }

    let transporter: Transporter | null = null;

    try {
      // Verificar se nodemailer está disponível
      if (!nodemailer) {
        this.logger.error(
          'nodemailer não está disponível. Verifique se está instalado: npm install nodemailer',
        );
        return false;
      }

      if (typeof nodemailer.createTransport !== 'function') {
        this.logger.error(
          `nodemailer.createTransport não é uma função. Tipo: ${typeof nodemailer.createTransport}`,
        );
        return false;
      }

      transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false,
        auth: {
          user: config.email.username,
          pass: config.email.password,
        },
      });

      const mailOptions = {
        from: config.email.from,
        to: payload.metadata?.Email,
        subject: payload.title,
        html: this.customHTMLMessage(payload),
        text:
          payload.message +
          (payload.metadata
            ? '\n\n' +
              Object.entries(payload.metadata)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')
            : ''),
      };

      await transporter.sendMail(mailOptions);

      this.logger.log('Notificação enviada para email com sucesso');
      return true;
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação para email: ${error.message}`,
      );
      return false;
    } finally {
      await transporter?.close();
      this.logger.log('Conexão com o servidor de email fechada');
    }
  }

  /**
   * Notifica sobre novo lead
   */
  async notifyNewLead(lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    source: string;
    score: number;
    unitId: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '🎯 Novo Lead Capturado',
      message: `Um novo lead foi capturado no sistema`,
      type: 'success',
      metadata: {
        Nome: lead.name,
        Email: lead.email,
        Telefone: lead.phone,
        Cidade: lead.city || 'Não informado',
        Origem: lead.source,
        Score: `${lead.score}/100`,
        'ID Lead': lead.id,
        'ID Unidade': lead.unitId,
      },
    };

    await this.sendNotification(payload, lead.unitId, {
      sendToAdmins: true,
      sendToClients: false,
    });
  }

  /**
   * Notifica sobre novo lead
   */
  async notifyLeadUpdated(lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    source: string;
    score: number;
    unitId: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '🎯 O Lead Atualizado',
      message: `O Lead está enviando novamente os dados pela landing page`,
      type: 'success',
      metadata: {
        Nome: lead.name,
        Email: lead.email,
        Telefone: lead.phone,
        Cidade: lead.city || 'Não informado',
        Origem: lead.source,
        Score: `${lead.score}/100`,
        'ID Lead': lead.id,
        'ID Unidade': lead.unitId,
      },
    };

    await this.sendNotification(payload, lead.unitId, {
      sendToAdmins: true,
      sendToClients: false,
    });
  }

  /**
   * Notifica sobre lead convertido em cliente
   */
  async notifyLeadConverted(lead: {
    id: string;
    name: string;
    email: string;
    customerId: string;
    unitId: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '✅ Lead Convertido em Cliente',
      message: `O lead foi convertido com sucesso em cliente`,
      type: 'success',
      metadata: {
        Nome: lead.name,
        Email: lead.email,
        'ID Lead': lead.id,
        'ID Cliente': lead.customerId,
        'ID Unidade': lead.unitId,
      },
    };

    await this.sendNotification(payload, lead.unitId, {
      sendToAdmins: false,
      sendToClients: true,
    });
  }

  /**
   * Notifica sobre novo cliente cadastrado
   */
  async notifyNewCustomer(customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    unitId: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '👤 Novo Cliente Cadastrado',
      message: `Um novo cliente foi cadastrado no sistema`,
      type: 'info',
      metadata: {
        Nome: customer.name,
        Email: customer.email,
        Telefone: customer.phone,
        'ID Cliente': customer.id,
        'ID Unidade': customer.unitId,
      },
    };

    await this.sendNotification(payload, customer.unitId, {
      sendToAdmins: true,
      sendToClients: false,
    });
  }

  async notifyNewConversation(conversation: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    source: string;
    score: number;
    unitId: string;
    chatUrl: string;
    mensagem: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '💬 Nova Conversa Iniciada',
      message: `Uma nova conversa foi iniciada`,
      type: 'info',
      metadata: {
        Nome: conversation.name,
        Email: conversation.email,
        Telefone: conversation.phone,
        Cidade: conversation.city || 'Não informado',
        Origem: conversation.source,
        Score: `${conversation.score}/100`,
        'ID Lead': conversation.id,
        'ID Unidade': conversation.unitId,
        'URL da Conversa': conversation.chatUrl,
        Mensagem: conversation.mensagem,
      },
    };

    await this.sendNotification(payload, conversation.unitId, {
      sendToAdmins: false,
      sendToClients: true,
    });
  }

  /**
   * Notifica sobre novo pedido
   */
  async notifyNewOrder(order: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    unitId: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '🛒 Novo Pedido Recebido',
      message: `Um novo pedido foi recebido`,
      type: 'success',
      metadata: {
        Número: order.orderNumber,
        Cliente: order.customerName,
        Total: `R$ ${order.total.toFixed(2)}`,
        'ID Pedido': order.id,
        'ID Unidade': order.unitId,
      },
    };

    await this.sendNotification(payload, order.unitId, {
      sendToAdmins: true,
      sendToClients: true,
    });
  }

  private getEmojiForType(type?: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  }

  private getColorForType(type?: string): number {
    switch (type) {
      case 'success':
        return 0x00ff00; // Verde
      case 'warning':
        return 0xffff00; // Amarelo
      case 'error':
        return 0xff0000; // Vermelho
      default:
        return 0x0099ff; // Azul
    }
  }
}
