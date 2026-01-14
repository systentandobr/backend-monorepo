export interface NotificationPayload {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
}

export interface ToReceivers {
  sendToAdmins: boolean;
  sendToClients: boolean;
}
