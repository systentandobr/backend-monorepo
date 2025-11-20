import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { clc } from '@nestjs/common/utils/cli-colors.util';
import { resolve } from 'path';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'x-api-key',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // BEGIN SWAGGER CONFIG ---------------------------------------
  const packageFile = resolve(__dirname, '../../..', 'package.json');
  const pkg = JSON.parse(readFileSync(packageFile).toString());
  
  const config = new DocumentBuilder()
    .setTitle(`${String(pkg.name).toUpperCase()} documentation`)
    .setDescription(pkg.description)
    .setVersion('1.0')
    .addTag('APIs', 'Endpoints principais do sistema')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Criar diretório public se não existir
  const publicDir = join(process.cwd(), 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Exporta o OpenAPI JSON em modo não interativo quando sinalizado por env
  if (process.env.SWAGGER_EXPORT === 'true') {
    const outputPath = join(process.cwd(), 'openapi.json');
    try {
      require('fs').writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');
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
  const port = process.env.PORT || 3000;
  
  logger.log(
    `${clc.magentaBright('🚀')} ${clc.green(
      'Application ready on port',
    )} ${clc.yellow(port.toString())}`,
  );
  
  logger.log(
    `${clc.cyanBright('📚')} ${clc.green(
      'Stoplight Elements documentation available at:',
    )} ${clc.yellow(`http://localhost:${port}/docs`)}`,
  );
  
  logger.log(
    `${clc.cyanBright('📖')} ${clc.green(
      'Swagger UI documentation available at:',
    )} ${clc.yellow(`http://localhost:${port}/swagger`)}`,
  );

  await app.listen(port);
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
