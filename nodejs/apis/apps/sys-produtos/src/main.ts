import { NestFactory } from '@nestjs/core';
import { SysProdutosModule } from './sys-produtos.module';

async function bootstrap() {
  const app = await NestFactory.create(SysProdutosModule, { cors: true });

  // Lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081',
  ];

  // Configuração do CORS com função de callback para debug
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origem (ex: Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar se a origem está na lista permitida
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS permitido para origem: ${origin}`);
        return callback(null, true);
      }

      // Log para debug
      console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
      console.log(`📋 Origens permitidas: ${allowedOrigins.join(', ')}`);

      // Em desenvolvimento, permitir todas as origens locais
      if (process.env.NODE_ENV !== 'production') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          console.log(
            `🔓 Permitindo origem local em desenvolvimento: ${origin}`,
          );
          return callback(null, true);
        }
      }

      callback(new Error('Não permitido pelo CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'Expires',
      'x-api-key',
      'x-domain',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'If-None-Match',
      'If-Modified-Since',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 horas
  });

  // Middleware adicional para garantir CORS em todas as rotas
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;

    if (
      origin &&
      (allowedOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1'))
    ) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, x-api-key, x-domain, If-None-Match, If-Modified-Since',
    );
    res.setHeader('Access-Control-Max-Age', '86400');

    // Responder imediatamente para requisições OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }

    next();
  });

  const port = process.env.PORT || 9090;
  await app.listen(port);
  console.log(`🚀 Sys Produtos API rodando na porta ${port}`);
  console.log(`🌐 CORS configurado para as seguintes origens:`);
  allowedOrigins.forEach((origin) => console.log(`   - ${origin}`));
}
bootstrap();
