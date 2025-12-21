export class SettingResponseDto {
  id: string;
  unitId: string;
  franchiseId?: string;
  notifications?: {
    telegram?: {
      botToken?: string;
      chatId?: string;
      enabled?: boolean;
    };
    discord?: {
      webhookUrl?: string;
      enabled?: boolean;
    };
    email?: {
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      from?: string;
      enabled?: boolean;
    };
  };
  franchise?: {
    name?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      type: 'physical' | 'digital';
    };
    status?: 'active' | 'inactive' | 'pending' | 'suspended';
    type?: 'standard' | 'premium' | 'express';
    territory?: {
      city: string;
      state: string;
      exclusive: boolean;
      radius?: number;
    };
  };
  general?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

