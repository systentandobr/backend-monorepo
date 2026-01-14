import { HttpService } from '@nestjs/axios';
export interface JwtValidationResult {
  isValid: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    roles: Array<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
      isSystem: boolean;
      isActive: boolean;
    }>;
    permissions: string[];
    isEmailVerified: boolean;
    isActive: boolean;
  };
  payload: any;
  expiresAt: Date;
}
export declare class JwtValidatorService {
  private readonly httpService;
  private readonly sysSegurancaUrl;
  constructor(httpService: HttpService);
  validateToken(token: string): Promise<JwtValidationResult>;
  validateTokenLocally(token: string): Promise<JwtValidationResult>;
  validateTokenWithFallback(token: string): Promise<JwtValidationResult>;
}
