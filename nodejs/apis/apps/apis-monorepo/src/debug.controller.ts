import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('debug')
export class DebugController {
  constructor(private configService: ConfigService) {}

  @Get('info')
  async getDebugInfo() {
    const axios = require('axios');
    
    let publicIp = 'Não foi possível obter';
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      publicIp = response.data.ip;
    } catch (error) {
      console.error('Erro ao obter IP público:', error.message);
    }

    return {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: this.configService.get('NODE_ENV'),
        USER_DB: this.configService.get('USER_DB') ? 'DEFINIDA' : 'NÃO DEFINIDA',
        PASS_DB: this.configService.get('PASS_DB') ? 'DEFINIDA' : 'NÃO DEFINIDA',
        HOST_DB: this.configService.get('HOST_DB') ? 'DEFINIDA' : 'NÃO DEFINIDA',
      },
      network: {
        publicIp,
        hostname: require('os').hostname(),
        platform: require('os').platform(),
      },
      mongodb: {
        connectionString: this.configService.get('HOST_DB') ? 
          `mongodb+srv://${this.configService.get('USER_DB')}:***@${this.configService.get('HOST_DB')}/` : 
          'NÃO CONFIGURADA'
      }
    };
  }

  @Get('health')
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'apis-monorepo'
    };
  }
} 