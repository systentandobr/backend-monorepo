import { Injectable } from '@nestjs/common';

@Injectable()
export class SysSegurancaService {
  getHello(): string {
    return 'Hello World!';
  }
}
