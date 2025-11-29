import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { EmailConfig, NotificationPayload } from './types/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly telegramBotToken: string;
  private readonly telegramChatId: string;
  private readonly discordWebhookUrl: string;
  private readonly emailConfig: EmailConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.telegramChatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    this.discordWebhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL') || '';
    this.emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST') || '',
      port: this.configService.get<number>('EMAIL_PORT') || 587,
      username: this.configService.get<string>('EMAIL_USERNAME') || '',
      password: this.configService.get<string>('EMAIL_PASSWORD') || '',
      from: this.configService.get<string>('EMAIL_FROM') || '',
    };
  }

  /**
   * Envia notificação para Telegram
   */
  async sendTelegramNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.telegramBotToken || !this.telegramChatId) {
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

      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      
      await firstValueFrom(
        this.httpService.post(url, {
          chat_id: this.telegramChatId,
          text: message,
          parse_mode: 'Markdown',
        })
      );

      this.logger.log('Notificação enviada para Telegram com sucesso');
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação para Telegram: ${error.message}`);
      return false;
    }
  }

  /**
   * Envia notificação para Discord
   */
  async sendDiscordNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.discordWebhookUrl) {
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
        this.httpService.post(this.discordWebhookUrl, {
          embeds: [embed],
        })
      );

      this.logger.log('Notificação enviada para Discord com sucesso');
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação para Discord: ${error.message}`);
      return false;
    }
  }

  /**
   * Envia notificação para ambos os canais
   */
  async sendNotification(payload: NotificationPayload): Promise<{
    telegram: boolean;
    discord: boolean;
    email: boolean;
  }> {
    const [telegramResult, discordResult, emailResult] = await Promise.allSettled([
      this.sendTelegramNotification(payload),
      this.sendDiscordNotification(payload),
      this.sendEmailNotification(payload),
    ]);

    return {
      telegram: telegramResult.status === 'fulfilled' ? telegramResult.value : false,
      discord: discordResult.status === 'fulfilled' ? discordResult.value : false,
      email: emailResult.status === 'fulfilled' ? emailResult.value : false,
    };
  }

  /**
   * Envia notificação para email
   */
  async sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.emailConfig.host || !this.emailConfig.port || !this.emailConfig.username || !this.emailConfig.password || !this.emailConfig.from) {
      this.logger.warn('Email config não configurada');
      return false;
    }

    let transporter: Transporter | null = null;

    try {
      transporter = nodemailer.createTransport({
        host: this.emailConfig.host,
        port: this.emailConfig.port,
        secure: false,
        auth: {
          user: this.emailConfig.username,
          pass: this.emailConfig.password,
        },
      });

      const mailOptions = {
        from: this.emailConfig.from,
        to: payload.metadata.Email,
        subject: payload.title,
        text: payload.message,
      };

      await transporter.sendMail(mailOptions);

      this.logger.log('Notificação enviada para email com sucesso');
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação para email: ${error.message}`);
      return false;
    }
    finally {
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

    await this.sendNotification(payload);
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

    await this.sendNotification(payload);
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

    await this.sendNotification(payload);
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
        'Número': order.orderNumber,
        Cliente: order.customerName,
        Total: `R$ ${order.total.toFixed(2)}`,
        'ID Pedido': order.id,
        'ID Unidade': order.unitId,
      },
    };

    await this.sendNotification(payload);
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

