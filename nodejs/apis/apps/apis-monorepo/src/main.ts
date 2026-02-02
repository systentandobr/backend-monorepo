import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import { resolve } from 'path';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { EnvironmentConfig } from './config/environment.config';

/**
 * Busca origens permitidas do MongoDB dinamicamente
 * Consulta a coleção de aplicações para obter allowedOrigins
 */
async function getAllowedOriginsFromMongoDB(): Promise<string[]> {
  const origins: string[] = [];

  try {
    const mongoUri = EnvironmentConfig.database.uri;
    const mongoose = require('mongoose');

    // Criar conexão temporária
    const connection = await mongoose.createConnection(mongoUri).asPromise();
    const db = connection.db;
    const applicationsCollection = db.collection('applications');

    // Buscar todas as aplicações ativas
    const applications = await applicationsCollection
      .find({ isActive: true })
      .toArray();

    // Extrair todas as origens permitidas
    applications.forEach((app: any) => {
      if (app.allowedOrigins && Array.isArray(app.allowedOrigins)) {
        app.allowedOrigins.forEach((origin: string) => {
          if (origin && !origins.includes(origin)) {
            origins.push(origin);
          }
        });
      }
    });

    console.log(`📦 Origens encontradas no MongoDB: ${origins.length}`);

    // Fechar conexão temporária
    await connection.close();
  } catch (error: any) {
    console.warn(
      '⚠️ Erro ao buscar origens do MongoDB:',
      error?.message || error,
    );
    console.log('📋 Usando apenas origens hardcoded');
  }

  return origins;
}

/**
 * Verifica se uma origem corresponde a um padrão com wildcard
 * Ex: https://*.viralkids.com.br corresponde a https://app.viralkids.com.br
 */
function matchesWildcardPattern(origin: string, pattern: string): boolean {
  if (!pattern.includes('*')) {
    return origin === pattern;
  }

  // Converter wildcard para regex
  const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(origin);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Lista base de origens permitidas (desenvolvimento)
  const baseAllowedOrigins = [
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
    'http://127.0.0.1:7001',
  ];

  // URLs de produção (hardcoded como fallback)
  const productionOrigins = [
    'https://app.viralkids.com.br',
    'https://viralkids-wine.vercel.app',
    'https://*.viralkids.com.br', // Wildcard para subdomínios
    'https://*.tadevolta.com.br', // Wildcard para subdomínios
    'https://*.systentando.com', // Wildcard para subdomínios
    'https://*.deacademias.com.br', // Wildcard para subdomínios
  ];

  // Buscar origens do MongoDB em produção
  let mongoOrigins: string[] = [];
  if (process.env.NODE_ENV === 'production') {
    try {
      mongoOrigins = await getAllowedOriginsFromMongoDB();
      console.log(`✅ ${mongoOrigins.length} origens carregadas do MongoDB`);
    } catch (error) {
      console.warn('⚠️ Falha ao carregar origens do MongoDB, usando fallback');
    }
  }

  // Combinar todas as origens
  const allowedOrigins = [
    ...baseAllowedOrigins,
    ...productionOrigins,
    ...mongoOrigins,
  ];

  // Configurar servir arquivos estáticos da pasta uploads ANTES do CORS
  const expressApp = app.getHttpAdapter().getInstance();
  const express = require('express');
  const uploadsPath = join(process.cwd(), 'uploads');
  
  // Criar diretório uploads se não existir
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }
  
  // Servir arquivos estáticos da pasta uploads (deve estar antes do CORS)
  expressApp.use('/uploads', express.static(uploadsPath, {
    maxAge: '1d', // Cache por 1 dia
    etag: true,
    lastModified: true,
  }));

  // Configuração do CORS com função de callback para debug
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origem (ex: Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar se a origem está na lista permitida (exata)
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS permitido para origem: ${origin}`);
        return callback(null, true);
      }

      // Verificar padrões com wildcard
      const matchesWildcard = allowedOrigins.some(
        (pattern) =>
          pattern.includes('*') && matchesWildcardPattern(origin, pattern),
      );

      if (matchesWildcard) {
        console.log(`✅ CORS permitido para origem (wildcard): ${origin}`);
        return callback(null, true);
      }

      // Em desenvolvimento, permitir todas as origens locais
      if (process.env.NODE_ENV !== 'production') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          console.log(
            `🔓 Permitindo origem local em desenvolvimento: ${origin}`,
          );
          return callback(null, true);
        }
      }

      // Log para debug
      console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
      console.log(`📋 Origens permitidas: ${allowedOrigins.join(', ')}`);

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

  // Middleware adicional para garantir CORS e desabilitar cache em desenvolvimento
  expressApp.use((req: any, res: any, next: any) => {
    // Pular middleware para arquivos estáticos (já servidos pelo express.static)
    if (req.path.startsWith('/uploads/')) {
      return next();
    }
    
    const origin = req.headers.origin;

    if (origin) {
      // Verificar origem exata
      const isExactMatch = allowedOrigins.includes(origin);
      // Verificar wildcards
      const matchesWildcard = allowedOrigins.some(
        (pattern) =>
          pattern.includes('*') && matchesWildcardPattern(origin, pattern),
      );
      // Verificar localhost em desenvolvimento
      const isLocalhost =
        process.env.NODE_ENV !== 'production' &&
        (origin.includes('localhost') || origin.includes('127.0.0.1'));

      if (isExactMatch || matchesWildcard || isLocalhost) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
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

    // Desabilitar cache em desenvolvimento para evitar 304 Not Modified
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Responder imediatamente para requisições OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }

    next();
  });

  // BEGIN SWAGGER CONFIG ---------------------------------------
  const packageFile = resolve(__dirname, '../../..', 'package.json');
  const pkg = JSON.parse(readFileSync(packageFile).toString());

  const config = new DocumentBuilder()
    .setTitle(`${String(pkg.name).toUpperCase()} - Monorepo API Documentation`)
    .setDescription(
      `${pkg.description}\n\nEste monorepo inclui todas as APIs do sistema Systentando.`,
    )
    .setVersion('1.0')
    .addTag(
      'produtos',
      'Sistema de Produtos - Gestão de produtos, variantes e estoque',
    )
    .addTag(
      'affiliate-products',
      'Produtos Afiliados - Gestão de produtos de afiliados',
    )
    .addTag('categories', 'Categorias - Gestão de categorias de produtos')
    .addTag(
      'sys-assistente-estudos',
      'Sistema Assistente de Estudos - Questões, concursos e simulações',
    )
    .addTag('sys-pagamentos', 'Sistema de Pagamentos - Gestão de pagamentos')
    .addTag(
      'life-tracker',
      'Life Tracker - Rastreamento de vida e produtividade',
    )
    .addTag('customers', 'Clientes - Gestão de clientes')
    .addTag('orders', 'Pedidos - Gestão de pedidos')
    .addTag('franchises', 'Franquias - Gestão de franquias')
    .addTag('leads', 'Leads - Gestão de leads')
    .addTag('notifications', 'Notificações - Sistema de notificações')
    .addTag('debug', 'Debug - Endpoints de debug e desenvolvimento')
    .addBearerAuth()
    .build();

  // Criar documento Swagger incluindo todos os módulos do AppModule
  const document = SwaggerModule.createDocument(app, config, {
    include: [AppModule],
    deepScanRoutes: true,
  });

  // Criar diretório public se não existir
  const publicDir = join(process.cwd(), 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Exporta o OpenAPI JSON em modo não interativo quando sinalizado por env
  if (process.env.SWAGGER_EXPORT === 'true') {
    const outputPath = join(process.cwd(), 'openapi.json');
    try {
      require('fs').writeFileSync(
        outputPath,
        JSON.stringify(document, null, 2),
        'utf-8',
      );
      // Não encerramos a aplicação aqui; o script pode optar por finalizar o processo
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Falha ao exportar openapi.json:', err);
    }
  }

  // Endpoint para servir o JSON do OpenAPI
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(document);
  });

  // Configurar Stoplight Elements
  setupStoplightElements(app, pkg);

  // Manter Swagger UI como backup (opcional)
  SwaggerModule.setup('/swagger', app, document, {
    customSiteTitle: `${pkg.name} - Swagger UI`,
    customfavIcon: '/favicon.ico',
  });

  //END SWAGGER CONFIG ------------------------------------

  const logger = new ConsoleLogger();
  const port = process.env.PORT || 9090;

  logger.log(
    `${clc.magentaBright('🚀')} ${clc.green(
      'Application ready on port',
    )} ${clc.yellow(port.toString())}`,
  );

  logger.log(
    `${clc.cyanBright('🌐')} ${clc.green(
      'CORS configurado para as seguintes origens:',
    )}`,
  );
  allowedOrigins.forEach((origin) => {
    logger.log(`   ${clc.cyanBright('-')} ${clc.yellow(origin)}`);
  });

  logger.log(
    `${clc.cyanBright('📚')} ${clc.green(
      'Stoplight Elements documentation available at:',
    )} ${clc.yellow(`http://0.0.0.0:${port}/docs`)}`,
  );

  logger.log(
    `${clc.cyanBright('📖')} ${clc.green(
      'Swagger UI documentation available at:',
    )} ${clc.yellow(`http://0.0.0.0:${port}/swagger`)}`,
  );

  await app.listen(port, '0.0.0.0');
}

function setupStoplightElements(app: any, pkg: any) {
  // Servir arquivos estáticos para Stoplight Elements
  app.use('/docs', (req: any, res: any, next: any) => {
    // Middleware simples para servir arquivos estáticos
    next();
  });

  // Endpoint principal do Stoplight Elements
  app.getHttpAdapter().get('/docs', (req, res) => {
    const html = generateStoplightHTML(pkg);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Endpoints alternativos
  app.getHttpAdapter().get('/documentation', (req, res) => {
    res.redirect('/docs');
  });
}

function generateStoplightHTML(pkg: any): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${pkg.name} - API Documentation</title>
    <meta name="description" content="${pkg.description}">
    <meta name="author" content="${pkg.author || 'Systentando'}">
    
    <!-- Stoplight Elements -->
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Custom styles -->
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        /* Custom Stoplight Elements styling */
        elements-api {
            height: 100vh;
            display: block;
        }
        
        /* Loading animation */
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #f8f9fa;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e3e3e3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Header customization */
        .custom-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .custom-header h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .custom-header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <!-- Loading screen -->
    <div id="loading" class="loading">
        <div class="spinner"></div>
    </div>
    
    <!-- Custom header -->
    <div class="custom-header">
        <h1>${pkg.name.toUpperCase()} API</h1>
        <p>${pkg.description}</p>
        <small>Versão ${pkg.version} | Documentação Interativa</small>
    </div>
    
    <!-- Stoplight Elements -->
    <elements-api 
        id="docs"
        apiDescriptionUrl="/api-json"
        router="hash"
        layout="sidebar"
        hideInternal="false"
        hideTryIt="false"
        hideExport="false"
        hideSchemas="false"
        tryItCredentialPolicy="include"
        style="display: none;"
    />
    
    <script>
        // Remove loading screen when Elements is ready
        document.addEventListener('DOMContentLoaded', function() {
            const docsElement = document.getElementById('docs');
            const loadingElement = document.getElementById('loading');
            
            // Show docs and hide loading
            setTimeout(() => {
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
                if (docsElement) {
                    docsElement.style.display = 'block';
                }
            }, 1000);
            
            // Error handling
            docsElement.addEventListener('error', function(e) {
                console.error('Erro ao carregar documentação:', e);
                document.body.innerHTML = \`
                    <div style="padding: 2rem; text-align: center; color: #dc3545;">
                        <h2>Erro ao carregar a documentação</h2>
                        <p>Verifique se a API está funcionando corretamente.</p>
                        <a href="/swagger" style="color: #007bff;">Tentar Swagger UI</a>
                    </div>
                \`;
            });
        });
        
        // Analytics (opcional)
        console.log('📚 Documentação carregada com Stoplight Elements');
        console.log('🔗 API JSON disponível em: /api-json');
        console.log('🔄 Swagger UI disponível em: /swagger');
    </script>
</body>
</html>
  `;
}

bootstrap();
