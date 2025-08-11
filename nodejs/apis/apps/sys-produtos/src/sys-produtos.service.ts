import { Injectable } from '@nestjs/common';

@Injectable()
export class SysProdutosService {
  getHello(): string {
    return 'Hello World!';
  }
}
